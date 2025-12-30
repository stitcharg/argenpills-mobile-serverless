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

//REVIEWS
export const reviewsEndpoint = new aws.ssm.Parameter("aibotReviewsEndpoint", {
	name: "/argenpills/prod/aireviews/reviews_endpoint",
	type: "SecureString",
	value: "https://your-api-endpoint.com",
	description: "Endpoint URL de la API de las reviews",
}, {
	ignoreChanges: ["value"]
});

export const reviewsToken = new aws.ssm.Parameter("aibotReviewsToken", {
	name: "/argenpills/prod/aireviews/reviews_token",
	type: "SecureString",
	value: "your-secret-token",
	description: "Authentication token de la API de las reviews",
}, {
	ignoreChanges: ["value"]
});



//ALGOLIA
export const algoliaApplicationId = new aws.ssm.Parameter("algoliaApplicationId", {
	name: "/argenpills/prod/algolia/application_id",
	type: "SecureString",
	value: "algoliaID",
	description: "Application ID de Algolia",
}, {
	ignoreChanges: ["value"]
});
export const algoliaSearchKey = new aws.ssm.Parameter("algoliaSearchKey", {
	name: "/argenpills/prod/algolia/search_key",
	type: "SecureString",
	value: "algoliaKey1",
	description: "Algolia Search Key",
}, {
	ignoreChanges: ["value"]
});
export const algoliaWriteKey = new aws.ssm.Parameter("algoliaWriteKey", {
	name: "/argenpills/prod/algolia/write_key",
	type: "SecureString",
	value: "algoliaKey2",
	description: "Algolia Write Key",
}, {
	ignoreChanges: ["value"]
});
export const algoliaIndex = new aws.ssm.Parameter("algoliaIndex", {
	name: "/argenpills/prod/algolia/index_name",
	type: "String",
	value: "indexname",
	description: "Algolia Index Name",
}, {
	ignoreChanges: ["value"]
});