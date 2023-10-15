import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { APuserPool, APuserPoolClient } from "./cognito";

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

// Create an API Gateway endpoint
const api = new awsx.classic.apigateway.API("argenpills-crud", {
    stageName: "dev",
    routes: [
        {
            path: "/authenticate",
            method: "POST",
            eventHandler: lambdaFnAuth
        },

        {
            path: "/items",
            method: "GET",
            eventHandler: lambdaFnGetItems,
        },
        
        {
            path: "/items/{id}",
            method: "GET",
            eventHandler: lambdaFnGetItem,
        },

        {
            path: "/items/{id}",
            method: "DELETE",
            eventHandler: lambdaFnGetItem,
            authorizers: [{
                authorizerName: "apMobile",
                parameterName: "Authorization",
                parameterLocation: "header",
                authType: "custom",
                type: "token",
                handler: lambdaFnAuth
            }]
        },
        
        {
            path: "/search",
            method: "GET",
            eventHandler: lambdaFnSearch,
        }
    ]
});



// Export everything
export const lambdaAuthName = lambdaFnAuth.name;

export const lambdaGetItemsName = lambdaFnGetItems.name;
export const lambdaGetItemName = lambdaFnGetItem.name;
export const lambdaSearchName = lambdaFnSearch.name;
//export const lambdaDeleteName = lambdaFn.name;

export const APuserPoolId = APuserPool.id;

export const tableName = dynamoTable.name;
export const apiUrl = api.url;


