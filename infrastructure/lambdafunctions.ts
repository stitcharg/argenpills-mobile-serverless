import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { lambdaRole } from './roles';
import { dynamoTable, dynamoSearchTable } from "./dynamodb";
import { APuserPool, APuserPoolClient } from "./cognito";
import { publicImagesBucket } from "./public-images-bucket";

const config = new pulumi.Config();
const configImagesDomain = `https://${config.require("images")}`;

//GET ITEM
const FN_GETITEM = "argenpills-crud-getitem";
export const lambdaFnGetItem = new aws.lambda.Function(FN_GETITEM, {
	role: lambdaRole.arn,
	description: "AP CRUD: Traer una pastilla por ID",
	handler: "getitem.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/getitem"),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name,
			"CDN_IMAGES": configImagesDomain
		}
	}
});

// Override the retention days from default CW log
const logGroupNameGetItem = lambdaFnGetItem.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupGetItem = new aws.cloudwatch.LogGroup(`${FN_GETITEM}-log-group`, {
	name: logGroupNameGetItem,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnGetItem] });

//---------
const FN_AUTH = "argenpills-crud-auth";
export const lambdaFnAuth = new aws.lambda.Function(FN_AUTH, {
	role: lambdaRole.arn,
	description: "LAMBDA para autenticar usuarios a la API",
	handler: "auth.handler", // Entry file is named `x.js` and exports a `handler` function
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-auth/src/auth"),
	environment: {
		variables: {
			"POOL_ID": APuserPool.id,
			"CLIENT_ID": APuserPoolClient.id
		}
	}
});

// Override the retention days from default CW log
const logGroupNameAuth = lambdaFnAuth.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupAuth = new aws.cloudwatch.LogGroup(`${FN_AUTH}-log-group`, {
	name: logGroupNameAuth,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnAuth] });

//---------
const FN_REFRESHTOKEN = "argenpills-crud-auth-refreshtoken";
export const lambdafnAuthRefreshToken = new aws.lambda.Function(FN_REFRESHTOKEN, {
	role: lambdaRole.arn,
	description: "LAMBDA para refrescar el token de autenticacion",
	handler: "refreshtoken.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-auth/src/refreshtoken"),
	environment: {
		variables: {
			"POOL_ID": APuserPool.id,
			"CLIENT_ID": APuserPoolClient.id
		}
	}
});

// Override the retention days from default CW log
const logGroupNameAuthRefreshToken = lambdafnAuthRefreshToken.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupAuthRefreshToken = new aws.cloudwatch.LogGroup(`${FN_REFRESHTOKEN}-log-group`, {
	name: logGroupNameAuthRefreshToken,
	retentionInDays: 3,
}, { dependsOn: [lambdafnAuthRefreshToken] });


//---------
const FN_GETITEMS = "argenpills-crud-getitems"
export const lambdaFnGetItems = new aws.lambda.Function(FN_GETITEMS, {
	role: lambdaRole.arn,
	description: "AP CRUD: Traer todas las pastillas publicadas",
	handler: "getitems.handler", // Entry file is named `x.js` and exports a `handler` function
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/getitems"),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name,
			"CDN_IMAGES": configImagesDomain
		}
	}
});

// Override the retention days from default CW log
const logGroupNameGetItems = lambdaFnGetItems.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupGetItems = new aws.cloudwatch.LogGroup(`${FN_GETITEMS}-log-group`, {
	name: logGroupNameGetItems,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnGetItems] });


//---------
const FN_DELETEITEM = "argenpills-crud-deleteitem"
export const lambdaFnDeleteItem = new aws.lambda.Function(FN_DELETEITEM, {
	role: lambdaRole.arn,
	description: "AP CRUD: Borra la pastilla. Requiere auth",
	handler: "deleteitem.handler", // Entry file is named `x.js` and exports a `handler` function
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/deleteitem"),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name
		}
	}
});

// Override the retention days from default CW log
const logGroupNameDeleteItem = lambdaFnDeleteItem.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupDeleteItem = new aws.cloudwatch.LogGroup(`${FN_DELETEITEM}-log-group`, {
	name: logGroupNameDeleteItem,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnDeleteItem] });


//---------
const FN_SEARCH = "argenpills-crud-search";
export const lambdaFnSearch = new aws.lambda.Function(FN_SEARCH, {
	role: lambdaRole.arn,
	description: "AP CRUD: Buscar por palabra clave",
	handler: "search.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/search"),
	environment: {
		variables: {
			"AP_TABLE": dynamoSearchTable.name,
			"CDN_IMAGES": configImagesDomain
		}
	}
});

// Override the retention days from default CW log
const logGroupNameSearch = lambdaFnSearch.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupSearch = new aws.cloudwatch.LogGroup(`${FN_SEARCH}-log-group`, {
	name: logGroupNameSearch,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnSearch] });


//---------
const FN_DASHBOARD = "argenpills-crud-dashboard";
export const lambdaFnDashboard = new aws.lambda.Function(FN_DASHBOARD, {
	role: lambdaRole.arn,
	description: "AP CRUD: Dashboard",
	handler: "dashboard.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/dashboard"),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name
		}
	}
});

// Override the retention days from default CW log
const logGroupNameDashboard = lambdaFnDashboard.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupDashboard = new aws.cloudwatch.LogGroup(`${FN_DASHBOARD}-log-group`, {
	name: logGroupNameDashboard,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnDashboard] });

//---------

const FN_EDIT = "argenpills-crud-edit";
export const lambdaFnEdit = new aws.lambda.Function(FN_EDIT, {
	role: lambdaRole.arn,
	description: "AP CRUD: Edita un item",
	handler: "edititem/edititem.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	memorySize: 512,
	code: new pulumi.asset.AssetArchive({
		edititem: new pulumi.asset.FileArchive("../argenpills-crud/src/edititem"),
		lib: new pulumi.asset.FileArchive("../argenpills-crud/src/lib"),
		node_modules: new pulumi.asset.FileArchive("../node_modules")
	}),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name,
			"CDN_IMAGES": configImagesDomain,
			"S3_BUCKET": publicImagesBucket.id
		}
	}
});

// Override the retention days from default CW log
const logGroupNameEdit = lambdaFnEdit.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupEdit = new aws.cloudwatch.LogGroup(`${FN_EDIT}-log-group`, {
	name: logGroupNameEdit,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnEdit] });

//---------

const FN_ADD = "argenpills-crud-add";
export const lambdaFnAdd = new aws.lambda.Function(FN_ADD, {
	role: lambdaRole.arn,
	description: "AP CRUD: Agrega un item",
	handler: "additem/additem.handler",
	memorySize: 512,
	runtime: aws.lambda.Runtime.NodeJS18dX,
	code: new pulumi.asset.AssetArchive({
		additem: new pulumi.asset.FileArchive("../argenpills-crud/src/additem"),
		lib: new pulumi.asset.FileArchive("../argenpills-crud/src/lib"),
		node_modules: new pulumi.asset.FileArchive("../node_modules")
	}),
	environment: {
		variables: {
			"AP_TABLE": dynamoTable.name,
			"CDN_IMAGES": configImagesDomain,
			"S3_BUCKET": publicImagesBucket.id
		}
	}
});

// Override the retention days from default CW log
const logGroupNameAdd = lambdaFnAdd.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupAdd = new aws.cloudwatch.LogGroup(`${FN_ADD}-log-group`, {
	name: logGroupNameAdd,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnAdd] });


//---------
const FN_AIBOT = "argenpills-aibot-history";
export const lambdaFnAiBotHistory = new aws.lambda.Function(FN_AIBOT, {
	role: lambdaRole.arn,
	description: "AP: Ver historico de consultas del bot de IA",
	handler: "aibothistory.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	timeout: 10,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/aibothistory")
});

// Override the retention days from default CW log
const logGroupNameAiBotHistory = lambdaFnAiBotHistory.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupAiBotSearch = new aws.cloudwatch.LogGroup(`${FN_AIBOT}-log-group`, {
	name: logGroupNameAiBotHistory,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnAiBotHistory] });


//---------
const FN_AITRAINING = "argenpills-aibot-training";
export const lambdaFnAiBotTraining = new aws.lambda.Function(FN_AITRAINING, {
	role: lambdaRole.arn,
	description: "AP: API para entrenar el bot de AI",
	handler: "trainingdata.handler",
	runtime: aws.lambda.Runtime.NodeJS18dX,
	timeout: 10,
	code: new pulumi.asset.FileArchive("../argenpills-crud/src/trainingdata")
});

// Override the retention days from default CW log
const logGroupNameAiBotTraining = lambdaFnAiBotTraining.name.apply(name => `/aws/lambda/${name}`);

const lambdaLogGroupAiBotTraning = new aws.cloudwatch.LogGroup(`${FN_AITRAINING}-log-group`, {
	name: logGroupNameAiBotTraining,
	retentionInDays: 3,
}, { dependsOn: [lambdaFnAiBotTraining] });
