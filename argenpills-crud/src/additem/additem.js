const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { updateItem } = require("../lib/module.items")
const { randomUUID } = require('crypto');

exports.Testeablehandler = async (event, context, dynamoDBClient, s3Client) => {
	const id = randomUUID();   //generate guid

	return updateItem(id, event, dynamoDBClient, s3Client)
}

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	const s3Client = new S3Client({});
	return exports.Testeablehandler(event, context, dynamoDBClient, s3Client);
};
