import * as aws from "@pulumi/aws";

// Create a CloudWatch Log Group
const apiGatewayLogs = new aws.cloudwatch.LogGroup("/aws/api-gateway/argenpills-crud-api-logs", {
    retentionInDays: 3,
});

const lambdaLogs = new aws.cloudwatch.LogGroup("/aws/lambda/argenpills-crud-logs", {
    retentionInDays: 3,
});


export const CWAPILogs = apiGatewayLogs;
export const CWLambdaLogs = lambdaLogs;