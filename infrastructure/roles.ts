import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { APuserPool } from "./cognito";

// Create an IAM role for Lambda
export const lambdaRole = new aws.iam.Role("lambdaRole", {
    description: "AP CRUD Role",
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "lambda.amazonaws.com",
    }),
});

new aws.iam.RolePolicyAttachment("lambdaFullAccess", {
    policyArn: aws.iam.ManagedPolicy.LambdaFullAccess,
    role: lambdaRole.name,
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

// Add policy to allow writing to CloudWatch Logs
new aws.iam.RolePolicy("lambdaClodwatchLogs", {
    role: lambdaRole.id,
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
            ],
            Resource: "arn:aws:logs:*:*:*",
            Effect: "Allow",
        }],
    },
});

// Create IAM Role and Policy to allow API Gateway to write to CloudWatch Logs
export const apiGatewayLoggingRole = new aws.iam.Role("apiGatewayLoggingRole", {
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
