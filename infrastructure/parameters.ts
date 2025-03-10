import * as aws from "@pulumi/aws";

export const historyEndpoint = new aws.ssm.Parameter("aibotHistoryEndpoint", {
	name: "/argenpills/prod/aibot/history_endpoint",
	type: "SecureString",
	value: "https://your-api-endpoint.com",
	description: "Endpoint URL de la API de la historia del Bot",
}, {
	ignoreChanges: ["value"]
});

export const historyToken = new aws.ssm.Parameter("aibotHistoryToken", {
	name: "/argenpills/prod/aibot/history_token",
	type: "SecureString",
	value: "your-secret-token",
	description: "Authentication token de la API",
}, {
	ignoreChanges: ["value"]
});

export const trainingEndpoint = new aws.ssm.Parameter("aibotTrainingEndpoint", {
	name: "/argenpills/prod/aibot/training_endpoint",
	type: "SecureString",
	value: "https://your-api-endpoint.com",
	description: "Endpoint URL de la API para entrenar la AI",
}, {
	ignoreChanges: ["value"]
});

export const trainingToken = new aws.ssm.Parameter("aibotTrainingToken", {
	name: "/argenpills/prod/aibot/training_token",
	type: "SecureString",
	value: "your-secret-token",
	description: "Authentication token de la API de entrenamiento",
}, {
	ignoreChanges: ["value"]
});