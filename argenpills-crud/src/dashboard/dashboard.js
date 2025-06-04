const { DynamoDBClient, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { subMonths, format, parseISO, differenceInHours } = require('date-fns');
//const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, s3Client) => {
	const headers = {
		"Content-Type": "application/json; charset=utf-8",
	};

	const BUCKET_CACHE = process.env.BUCKET_CACHE;

	try {
		const response = await s3Client.send(new GetObjectCommand({
			Bucket: BUCKET_CACHE,
			Key: 'dashboard-cache.json'
		}));

		const cacheData = JSON.parse(await response.Body.transformToString());

		return {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				colors: cacheData.colors,
				dates: cacheData.dates,
				ai: cacheData.ai
			})
		};
	} catch (error) {
		console.error("Error reading from cache:", error);
		return {
			headers,
			statusCode: 500,
			body: JSON.stringify({
				message: "Error reading from cache",
				error: error.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const s3Client = new S3Client({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, s3Client);
};

