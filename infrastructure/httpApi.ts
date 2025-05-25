import * as aws from "@pulumi/aws";

export const httpApi = new aws.apigatewayv2.Api("argenpills-crud", {
	protocolType: "HTTP",
	corsConfiguration: {
		allowOrigins: ['*'],
		allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
		allowHeaders: ['Authorization', 'Content-type'],
		exposeHeaders: ['x-total-count']
	},
});

export const httpApiId = httpApi;