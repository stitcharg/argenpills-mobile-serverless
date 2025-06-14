import * as aws from "@pulumi/aws";

// Create an AWS Cognito User Pool
const userPool = new aws.cognito.UserPool("argenpills-userpool", {
    autoVerifiedAttributes: ["email"],
    schemas: [{
        attributeDataType: "String",
        mutable: true,
        name: "lastLoginDate",
        stringAttributeConstraints: {
            maxLength: "256",
            minLength: "1",
        },
    }],
});

// Create an AWS Cognito User Pool Client
const userPoolClient = new aws.cognito.UserPoolClient("argenpills-crud-client", {
    generateSecret: false,
    userPoolId: userPool.id,
    explicitAuthFlows: ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
});

export const APuserPool = userPool;
export const APuserPoolClient = userPoolClient;