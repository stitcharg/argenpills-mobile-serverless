import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { lambdaFnCacheWriter } from "./lambdafunctions";

// Create an EventBridge rule that triggers daily at midnight
const dailyMidnightRule = new aws.cloudwatch.EventRule("argenpills-cache-generation", {
	description: "Trigger daily at midnight",
	scheduleExpression: "cron(0 0 * * ? *)", // Runs at 00:00 UTC every day
	state: "ENABLED"
});

// Create a target for the rule (you can modify this based on your needs)
const ruleTarget = new aws.cloudwatch.EventTarget("argenpills-cache-target-arn", {
	rule: dailyMidnightRule.name,
	arn: lambdaFnCacheWriter.arn
});

// Export the rule name
export const ruleName = dailyMidnightRule.name;
