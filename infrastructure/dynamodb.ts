import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ENV_DEV, ENV_PROD } from './consts'

import { lambdaRole } from "./roles";

const stack = pulumi.getStack();

let dynamoTable: aws.dynamodb.Table;
let dynamoReferenceTable: aws.dynamodb.Table;
let dynamoSearchTable: aws.dynamodb.Table;

if (stack === ENV_DEV) {
	// Create a DynamoDB table
	dynamoTable = new aws.dynamodb.Table("argenpills-pills", {
		attributes: [
			{ name: "id", type: "S" },
			{ name: "posted_date", type: "S" },
			{ name: "published", type: "S" },
		],
		hashKey: "id",
		readCapacity: 1,
		writeCapacity: 1,
		globalSecondaryIndexes: [
			{
				name: "published-posted_date-index",
				hashKey: "published",
				rangeKey: "posted_date",
				readCapacity: 1,
				writeCapacity: 1,
				projectionType: "ALL",
			},
		],
		streamEnabled: true,
		streamViewType: "NEW_AND_OLD_IMAGES"
	},
		{
			replaceOnChanges: ["attributes"]
		});
} else {
	dynamoTable = new aws.dynamodb.Table("argenpills-pills", {
		attributes: [
			{
				name: "published",
				type: "S",
			},
			{
				name: "posted_date",
				type: "S",
			},
			{
				name: "id",
				type: "S",
			},
		],
		globalSecondaryIndexes: [{
			hashKey: "published",
			name: "published-posted_date-index",
			projectionType: "ALL",
			rangeKey: "posted_date",
			readCapacity: 1,
			writeCapacity: 1,
		}],
		hashKey: "id",
		name: "argenpills",
		pointInTimeRecovery: {
			enabled: false,
		},
		readCapacity: 1,
		streamEnabled: true,
		streamViewType: "NEW_IMAGE",
		tags: {
			project: "ap",
		},
		ttl: {
			attributeName: "",
		},
		writeCapacity: 1,
	}, {
		protect: true,
	});
}

// Create a DynamoDB table
dynamoReferenceTable = new aws.dynamodb.Table("argenpills-pills-telegram", {
	name: "argenpills-pills-telegram",
	attributes: [
		{ name: "id", type: "S" }
	],
	hashKey: "id",
	readCapacity: 1,
	writeCapacity: 1
});

// Create search index table
dynamoSearchTable = new aws.dynamodb.Table("argenpills-pills-search", {
	name: "argenpills-pills-search",
	attributes: [
		{ name: "word", type: "S" },
		{ name: "id", type: "S" },
		{ name: "posted_date", type: "S" }
	],
	hashKey: "id",
	rangeKey: "word",
	readCapacity: 1,
	writeCapacity: 1,
	globalSecondaryIndexes: [{
		hashKey: "word",
		rangeKey: "posted_date",
		name: "word-index",
		nonKeyAttributes: ["record"],
		projectionType: "INCLUDE",
		readCapacity: 1,
		writeCapacity: 1,
	}],
});


// Attach DynamoDB access policy to Lambda role
new aws.iam.RolePolicy("lambdaDynamoPolicy", {
	role: lambdaRole.id,
	policy: pulumi.all([dynamoTable.arn,
	dynamoReferenceTable.arn,
	dynamoSearchTable.arn]).apply(([tableArn]) => JSON.stringify({
		Version: "2012-10-17",
		Statement: [{
			Action: [
				"dynamodb:GetItem",
				"dynamodb:PutItem",
				"dynamodb:UpdateItem",
				"dynamodb:DeleteItem",
				"dynamodb:Query",
				"dynamodb:Scan",
				"dynamodb:DescribeTable"
			],
			Effect: "Allow",
			Resource: [
				tableArn,
				`${tableArn}/index/*`
			],
		}],
	})),
});

export { dynamoTable, dynamoReferenceTable, dynamoSearchTable }