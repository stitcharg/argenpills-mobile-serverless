import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create an AWS Cognito User Pool
const userPool = new aws.cognito.UserPool("argenpills-userpool", {
    autoVerifiedAttributes: ["email"],
});

// Create an AWS Cognito User Pool Client
const userPoolClient = new aws.cognito.UserPoolClient("argenpills-crud-client", {
    generateSecret: false,
    userPoolId: userPool.id,
    explicitAuthFlows: ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
});

export const APuserPool = userPool;
export const APuserPoolClient = userPoolClient;