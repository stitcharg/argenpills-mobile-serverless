import * as aws from "@pulumi/aws";

// Create a CloudWatch Log Group
const apiGatewayLogs = new aws.cloudwatch.LogGroup("argenpills-crud-api-logs", {
    retentionInDays: 3,
});

export const CWAPILogs = apiGatewayLogs;