import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {
	lambdaFnAuth,
	lambdafnAuthRefreshToken,
	lambdaFnGetItems,
	lambdaFnSearch
} from './lambdafunctions';
import { httpApi } from "./httpApi";
import { CWAPILogs } from "./logs";

const config = new pulumi.Config();
const snstopicArn = config.require("snstopic-arn");

let lambdasToCheck = [lambdaFnGetItems, lambdaFnSearch, lambdaFnAuth, lambdafnAuthRefreshToken];

let alarms: pulumi.Output<aws.cloudwatch.MetricAlarm>[] = [];

lambdasToCheck.forEach(lambda => {
	const alarm = lambda.name.apply(lambdaName => {
		return new aws.cloudwatch.MetricAlarm(`alarm-${lambdaName}`, {
			name: "lambda5xxErros-" + lambdaName,
			comparisonOperator: "GreaterThanThreshold",
			evaluationPeriods: 1,
			metricName: "Errors",
			namespace: "AWS/Lambda",
			period: 60,
			statistic: "Sum",
			threshold: 0,
			treatMissingData: "notBreaching",
			alarmDescription: "This metric monitors the number of errors in the Lambda function",
			alarmActions: [snstopicArn],
			dimensions: {
				FunctionName: lambda.name
			}
		});
	});

	alarms.push(alarm);
});

// Create metric filter for API Gateway 4xx errors
const apiGateway4xxMetricFilter = new aws.cloudwatch.LogMetricFilter("apiGateway4xxErrors", {
	logGroupName: CWAPILogs.name,
	metricTransformation: {
		name: "ApiGateway4xxErrors",
		namespace: "ApiGateway",
		value: "1",
		unit: "Count"
	},
	pattern: '[host, ,  , timestamp, request, statusCode=4*, size , ]'
});

// Create alarm for API Gateway 4xx errors
const apiGateway4xxAlarm = new aws.cloudwatch.MetricAlarm("apiGateway4xxAlarm", {
	metricName: "ApiGateway4xxErrors",
	namespace: "ApiGateway",
	statistic: "Sum",
	period: 60,
	evaluationPeriods: 1,
	threshold: 3,
	treatMissingData: "notBreaching",
	comparisonOperator: "GreaterThanThreshold",
	alarmDescription: "This metric monitors the number of 4xx errors in the API Gateway",
	alarmActions: [snstopicArn],
	dimensions: {
		ApiId: httpApi.id
	}
});

export { alarms, apiGateway4xxMetricFilter };