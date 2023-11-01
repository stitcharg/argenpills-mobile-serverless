import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { lambdaRole } from "./roles";

// Create a DynamoDB table
const dynamoTable = new aws.dynamodb.Table("argenpills-pills", {
    attributes: [
        { name: "id", type: "S" },
        { name: "posted_date", type: "S" },
        { name: "published", type: "S" },
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

export default dynamoTable;