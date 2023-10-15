import * as aws from "@pulumi/aws";

// Create a CloudWatch Log Group
const apiGatewayLogs = new aws.cloudwatch.LogGroup("argenpills-crud-api-logs", {
    retentionInDays: 14,
});

export const CWAPILogs = apiGatewayLogs;