import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {
	lambdaFnAuth,
	lambdafnAuthRefreshToken,
	lambdaFnGetItems,
	lambdaFnSearch
} from './lambdafunctions';

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

export { alarms };