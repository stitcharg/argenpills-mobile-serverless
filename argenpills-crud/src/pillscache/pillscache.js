const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, dynamoClient, s3Client) => {
	const headers = {
		"Content-Type": "application/json; charset=utf-8",
	};

	const AP_TABLE = process.env.AP_TABLE;
	const BUCKET_CACHE = process.env.BUCKET_CACHE;
	const CDN_IMAGES = process.env.CDN_IMAGES;

	// Query for the latest 50 published items
	const params = {
		TableName: AP_TABLE,
		IndexName: "published-posted_date-index",
		KeyConditionExpression: "#published = :published",
		ExpressionAttributeNames: {
			'#published': 'published'
		},
		ExpressionAttributeValues: {
			":published": { S: 'x' }
		},
		ScanIndexForward: false,
		Limit: 50
	};

	const command = new QueryCommand(params);

	try {
		const { Items } = await dynamoClient.send(command);
		const results = Items.map(unmarshall);

		// Prefix image URLs
		const processed = results.map(row => {
			if (row.image)
				row.image = CDN_IMAGES + row.image;
			if (row.lab_image)
				row.lab_image = CDN_IMAGES + row.lab_image;
			return row;
		});

		const formattedResults = {
			data: processed
		}

		// Write to S3
		await s3Client.send(new PutObjectCommand({
			Bucket: BUCKET_CACHE,
			Key: 'pills-cache-50.json',
			Body: JSON.stringify(formattedResults),
			ContentType: 'application/json'
		}));

		return {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				message: "Pills cache updated successfully",
				count: processed.length
			})
		};
	} catch (err) {
		console.error("Error updating pills cache:", err);
		return {
			headers,
			statusCode: 500,
			body: JSON.stringify({
				message: "Error updating pills cache",
				error: err.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	const s3Client = new S3Client({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoClient, s3Client);
};
