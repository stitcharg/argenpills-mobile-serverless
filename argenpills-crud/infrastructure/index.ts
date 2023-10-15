import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { APuserPool, APuserPoolClient } from "./cognito";
import { CWAPILogs } from "./logs";

// Create an IAM role for Lambda
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "lambda.amazonaws.com",
    }),
});

new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
    policyArn: aws.iam.ManagedPolicy.LambdaFullAccess,
    role: lambdaRole.name,
});

// Create a DynamoDB table
const dynamoTable = new aws.dynamodb.Table("argenpills-pills", {
    attributes: [
        { name: "id", type: "S" },
        { name: "posted_date", type: "S"},
        { name: "published", type: "S"},
    ],
    hashKey: "id",
    readCapacity: 1,
    writeCapacity: 1,
    globalSecondaryIndexes: [
        {
            name: "published-posted_date-index",
            hashKey: "published",
            rangeKey: "posted_date",
            readCapacity: 1,
            writeCapacity: 1,
            projectionType: "ALL",
        },
    ],    
},
{
    replaceOnChanges: ["attributes"]
});

// Attach DynamoDB access policy to Lambda role
new aws.iam.RolePolicy("lambdaDynamoPolicy", {
    role: lambdaRole.id,
    policy: pulumi.all([dynamoTable.arn]).apply(([tableArn]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
            ],
            Effect: "Allow",
            Resource: [
                tableArn,
                `${tableArn}/index/*`
            ],
        }],
    })),
});

// Attach Cognito access policy to Lambda role
new aws.iam.RolePolicy("lambdaCognitoPolicy", {
    role: lambdaRole.id,
    policy: pulumi.all([APuserPool.arn]).apply(([userPoolArn]) => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "cognito-idp:AdminInitiateAuth"
            ],
            Effect: "Allow",
            Resource: [
                userPoolArn
            ],
        }],
    })),
});

// Authorization Lambda
const lambdaFnAuth = new aws.lambda.Function("argenpills-crud-auth", {
    role: lambdaRole.arn,
    description: "LAMBDA para autenticar usuarios a la API",
    handler: "index.handler", // Entry file is named `x.js` and exports a `handler` function
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../../argenpills-auth"),
    environment: {
        variables: {
            "POOL_ID": APuserPool.id,
            "CLIENT_ID": APuserPoolClient.id
        }
    }
});

// Create the Lambda function, referencing the `src` directory for code
const lambdaFnGetItems = new aws.lambda.Function("argenpills-crud-getitems", {
    role: lambdaRole.arn,
    description: "AP CRUD: Trar todas las pastillas publicadas",
    handler: "getitems.handler", // Entry file is named `x.js` and exports a `handler` function
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../src/getitems"),
    environment: {
        variables: {
            "AP_TABLE": dynamoTable.name,
            "CDN_IMAGES": "https://images.argenpills.info"
        }
    }
});

// Create the Lambda function, referencing the `src` directory for code
const lambdaFnGetItem = new aws.lambda.Function("argenpills-crud-getitem", {
    role: lambdaRole.arn,
    description: "AP CRUD: Traer una pastilla por ID",
    handler: "getitem.handler", 
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../src/getitem"),
    environment: {
        variables: {
            "AP_TABLE": dynamoTable.name,
            "CDN_IMAGES": "https://images.argenpills.info"
        }
    }
});

// Create the Lambda function, referencing the `src` directory for code
const lambdaFnDeleteItem = new aws.lambda.Function("argenpills-crud-deleteitem", {
    role: lambdaRole.arn,
    description: "AP CRUD: Borra la pastilla. Requiere auth",
    handler: "deleteitem.handler", // Entry file is named `x.js` and exports a `handler` function
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../src/deleteitem"),
    environment: {
        variables: {
            "AP_TABLE": dynamoTable.name
        }
    }
});


// Create the Lambda function, referencing the `src` directory for code
const lambdaFnSearch = new aws.lambda.Function("argenpills-crud-search", {
    role: lambdaRole.arn,
    description: "AP CRUD: Buscar por palabra clave",
    handler: "search.handler", 
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../src/search"),
    environment: {
        variables: {
            "AP_TABLE": dynamoTable.name,
            "CDN_IMAGES": "https://images.argenpills.info"
        }
    }
});

// Create IAM Role and Policy to allow API Gateway to write to CloudWatch Logs
const apiGatewayLoggingRole = new aws.iam.Role("apiGatewayLoggingRole", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "apigateway.amazonaws.com",
                },
            },
        ],
    }),
});

new aws.iam.RolePolicyAttachment("apiGatewayLoggingPolicyAttachment", {
    role: apiGatewayLoggingRole.name,
    policyArn: aws.iam.ManagedPolicies.AmazonAPIGatewayPushToCloudWatchLogs,
});

// Set CloudWatch role ARN globally for API Gateway
new aws.apigateway.Account("apiGatewayAccount", {
    cloudwatchRoleArn: apiGatewayLoggingRole.arn,
});

const httpApi = new aws.apigatewayv2.Api("argenpills-crud", {
    protocolType: "HTTP",
});

// Define routes and their corresponding Lambda functions
const routes = [
    { path: "/", method: "GET", lambda: lambdaFnGetItems, name: "GetItems"},
]


for (const { path, method, lambda, name } of routes) {
    const integration = new aws.apigatewayv2.Integration(`${name}Integration`, {
        apiId: httpApi.id,
        integrationType: "AWS_PROXY",
        integrationUri: lambda.arn,
    });

    new aws.apigatewayv2.Route(`${method}${path.replace(/\//g, '')}Route`, {
        apiId: httpApi.id,
        routeKey: `${method} ${path}`,
        target: pulumi.interpolate`integrations/${integration.id}`,
    });

    new aws.lambda.Permission(`${name}InvokePermission`, {
        action: "lambda:InvokeFunction",
        function: lambda,
        principal: "apigateway.amazonaws.com",
    });
}

// Create a Deployment
const deployment = new aws.apigatewayv2.Deployment("ap-crud-deploy", {
    apiId: httpApi.id,
});

// Create a Stage
const stage = new aws.apigatewayv2.Stage("dev", {
    apiId: httpApi.id,
    name: "dev",
    deploymentId: deployment.id,
    autoDeploy: true,
});


// // Create an API Gateway endpoint
// const api = new awsx.classic.apigateway.API("argenpills-crud", {
//     stageName: "dev",
//     routes: [
//         {
//             path: "/authenticate",
//             method: "POST",
//             eventHandler: lambdaFnAuth
//         },

//         {
//             path: "/items",
//             method: "GET",
//             eventHandler: lambdaFnGetItems,
//         },
        
//         {
//             path: "/items/{id}",
//             method: "GET",
//             eventHandler: lambdaFnGetItem,
//         },

//         {
//             path: "/items/{id}",
//             method: "DELETE",
//             eventHandler: lambdaFnDeleteItem,
//             authorizers: [{
//                 authorizerName: "apMobile",
//                 parameterName: "Authorization",
//                 parameterLocation: "header",
//                 authType: "custom",
//                 type: "token",
//                 handler: lambdaFnAuth
//             }],            
//         },
        
//         {
//             path: "/search",
//             method: "GET",
//             eventHandler: lambdaFnSearch,
//         }
//     ],
//     stageArgs: {   
//         xrayTracingEnabled: true,     
//         accessLogSettings: {
//             destinationArn: CWAPILogs.arn,
//             format: JSON.stringify({
//                 requestId: "$context.requestId",
//                 ip: "$context.identity.sourceIp",
//                 user: "$context.identity.user",
//                 status: "$context.status",  // HTTP status code
//                 errorMessage: "$context.error.message", // Error message
//                 errorResponse: "$context.error.response" // Error response
//             }),
//         },
//     }
// });

// Export everything
export const lambdaAuthName = lambdaFnAuth.name;

export const lambdaGetItemsName = lambdaFnGetItems.name;
export const lambdaGetItemName = lambdaFnGetItem.name;
export const lambdaSearchName = lambdaFnSearch.name;
export const lambdaDeleteName = lambdaFnDeleteItem.name;

export const APuserPoolId = APuserPool.id;

export const tableName = dynamoTable.name;
export const apiUrl = stage.invokeUrl;

