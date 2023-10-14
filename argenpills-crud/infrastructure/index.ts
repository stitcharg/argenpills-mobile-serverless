import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


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

// Create the Lambda function, referencing the `src` directory for code
const lambdaFunc = new aws.lambda.Function("argenpills-crud-getitems", {
    role: lambdaRole.arn,
    handler: "getitems.handler", // Assuming the entry file is named `index.js` and exports a `handler` function
    runtime: aws.lambda.Runtime.NodeJS18dX,
    code: new pulumi.asset.FileArchive("../src"),
    environment: {
        variables: {
            "AP_TABLE": dynamoTable.name,
            "CDN_IMAGES": "https://images.argenpills.info"
        }
    }
});

// Export the Lambda function and DynamoDB table names
export const lambdaName = lambdaFunc.name;
export const tableName = dynamoTable.name;


