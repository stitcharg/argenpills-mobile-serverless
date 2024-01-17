import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ENV_DEV, ENV_PROD } from './consts'
import { registerApiDomain } from './domains';
import { APuserPool, APuserPoolClient } from "./cognito";
import { CWAPILogs, CWLambdaLogs } from "./logs";
import { imagesCDN, publicImagesBucket } from './public-images-bucket';
import { certificateAPI } from "./certificates";
import { apiGatewayLoggingRole } from "./roles";
import { dynamoTable, dynamoReferenceTable, dynamoSearchTable } from "./dynamodb";
import {
	lambdaFnGetItem,
	lambdaFnAuth,
	lambdafnAuthRefreshToken,
	lambdaFnGetItems,
	lambdaFnDeleteItem,
	lambdaFnSearch,
	lambdaFnDashboard,
	lambdaFnEdit,
	lambdaFnAdd
} from './lambdafunctions';
import { dashboardUrlCRUD } from './cloudwatch-dashboard';

// Reading configuration from files
const config = new pulumi.Config();
const configAPIHost = config.require("api");
const stack = pulumi.getStack();

new aws.iam.RolePolicyAttachment("apiGatewayLoggingPolicyAttachment", {
	role: apiGatewayLoggingRole.name,
	policyArn: aws.iam.ManagedPolicies.AmazonAPIGatewayPushToCloudWatchLogs,
});

// Set CloudWatch role ARN globally for API Gateway
new aws.apigateway.Account("apiGatewayAccount", {
	cloudwatchRoleArn: apiGatewayLoggingRole.arn,
});

const httpApi = new aws.apigatewayv2.Api("argenpills-crud", {
	protocolType: "HTTP",
	corsConfiguration: {
		allowOrigins: ['*'],
		allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
		allowHeaders: ['Authorization', 'Content-type'],
		exposeHeaders: ['x-total-count']
	},
});

// Define routes and their corresponding Lambda functions
const routes = [
	{ path: "/items", method: "GET", lambda: lambdaFnGetItems, name: "GetItems", authenticate: false },
	{ path: "/items/{id}", method: "GET", lambda: lambdaFnGetItem, name: "GetItem", authenticate: false },
	{ path: "/search", method: "GET", lambda: lambdaFnSearch, name: "Search", authenticate: false },
	{ path: "/authenticate", method: "POST", lambda: lambdaFnAuth, name: "Authenticate", authenticate: false },
	{ path: "/refreshtoken", method: "POST", lambda: lambdafnAuthRefreshToken, name: "RefreshToken", authenticate: true },
	{ path: "/items/{id}", method: "DELETE", lambda: lambdaFnDeleteItem, name: "DeleteItem", authenticate: true },
	{ path: "/dashboard", method: "GET", lambda: lambdaFnDashboard, name: "Dashboard", authenticate: false },
	{ path: "/items/{id}", method: "PUT", lambda: lambdaFnEdit, name: "EditItem", authenticate: true },
	{ path: "/items", method: "POST", lambda: lambdaFnAdd, name: "AddItem", authenticate: true },
]

const customAuthorizer = new aws.apigatewayv2.Authorizer("CognitoAuhorizer", {
	apiId: httpApi.id,
	authorizerType: "JWT",
	identitySources: ["$request.header.Authorization"],
	jwtConfiguration: {
		audiences: [APuserPoolClient.id],
		issuer: pulumi.interpolate`https://${APuserPool.endpoint}`,
	}
});

//We need to create a dependency to update the deploy
const routeArray: aws.apigatewayv2.Route[] = [];

for (const { path, method, lambda, name, authenticate } of routes) {
	const integration = new aws.apigatewayv2.Integration(`${name}Integration`, {
		apiId: httpApi.id,
		integrationType: "AWS_PROXY",
		description: name,
		integrationUri: lambda.arn,
		payloadFormatVersion: "2.0"
	});

	let route;
	if (authenticate) {
		route = new aws.apigatewayv2.Route(`${method}${path.replace(/\//g, '')}SecureRoute`, {
			apiId: httpApi.id,
			routeKey: `${method} ${path}`,
			target: pulumi.interpolate`integrations/${integration.id}`,
			authorizationType: "JWT",
			authorizerId: customAuthorizer.id
		});
	} else {
		route = new aws.apigatewayv2.Route(`${method}${path.replace(/\//g, '')}Route`, {
			apiId: httpApi.id,
			routeKey: `${method} ${path}`,
			target: pulumi.interpolate`integrations/${integration.id}`,
		});
	}

	routeArray.push(route);

	new aws.lambda.Permission(`${name}InvokePermission`, {
		action: "lambda:InvokeFunction",
		function: lambda,
		principal: "apigateway.amazonaws.com",
	});

	new aws.lambda.Permission(`${name}allowCloudWatch`, {
		action: "lambda:InvokeFunction",
		function: lambda,
		principal: "logs.amazonaws.com"
	});
}

// Associate the CloudWatch Log Group with the Lambda function
new aws.cloudwatch.LogSubscriptionFilter("argenpills-crud-debug", {
	logGroup: CWLambdaLogs.name,
	filterPattern: "",
	destinationArn: lambdafnAuthRefreshToken.arn,
});

// Aggregate all the route URNs into a single output
const allRoutes = pulumi.all(routeArray);

// Create a Deployment
const currentTimestamp = new Date().toISOString();
const deployment = new aws.apigatewayv2.Deployment("ap-crud-deploy", {
	apiId: httpApi.id,
	description: `Deployment at ${currentTimestamp}`,
});

// Create a custom domain name
const customDomain = new aws.apigatewayv2.DomainName("api-custom-domain", {
	domainName: configAPIHost,

	domainNameConfiguration: {
		certificateArn: certificateAPI.arn,
		endpointType: "REGIONAL",
		securityPolicy: "TLS_1_2",
	}
});
registerApiDomain(customDomain);


let stage: aws.apigatewayv2.Stage;

if (stack === ENV_DEV) {
	// Create a Stage
	stage = new aws.apigatewayv2.Stage("dev", {
		apiId: httpApi.id,
		name: "dev",
		deploymentId: deployment.id,
		autoDeploy: true,
		accessLogSettings: {
			destinationArn: CWAPILogs.arn,
			format: "$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] \"$context.httpMethod $context.resourcePath $context.protocol\" $context.status $context.responseLength $context.requestId"
		},
		description: `Deployment at ${currentTimestamp}`,
	}, { dependsOn: allRoutes });
} else {
	stage = new aws.apigatewayv2.Stage("v1", {
		apiId: httpApi.id,
		name: "v1",
		deploymentId: deployment.id,
		autoDeploy: true,
		accessLogSettings: {
			destinationArn: CWAPILogs.arn,
			format: "$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] \"$context.httpMethod $context.resourcePath $context.protocol\" $context.status $context.responseLength $context.requestId"
		},
		description: `Deployment at ${currentTimestamp}`,
	}, { dependsOn: allRoutes });
}

// Create an API mapping that connects the custom domain name to your HTTP API
const apiMapping = new aws.apigatewayv2.ApiMapping("api-mapping", {
	apiId: httpApi.id,
	domainName: customDomain.domainName,
	stage: stage.name,
	apiMappingKey: (stack === ENV_PROD ? "v1" : "")
});


// Export 
export const APuserPoolId = APuserPool.id;
export const APuserPoolClientId = APuserPoolClient.id;

export const tableName = dynamoTable.name;
export const tableTelegramReference = dynamoReferenceTable.name;
export const tableSearch = dynamoSearchTable.name;
export const apiUrl = stage.invokeUrl;

export const CDNImages = imagesCDN.domainName;
export const bucketImages = publicImagesBucket.id;

export const APIHost = customDomain.domainName;

export const dashboardCRUD = dashboardUrlCRUD;