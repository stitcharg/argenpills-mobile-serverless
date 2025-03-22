const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require('crypto');

exports.Testeablehandler = async (event, context, dynamoDBClient) => {
	const id = randomUUID(); // generate guid

	try {
		const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

		// Parse the request body
		const body = JSON.parse(event.body);

		// Create the item with the required structure
		const item = {
			Id: id,
			Text: body.Text,
			Used: body.Used !== undefined ? body.Used : 0 // Default to 0 if not provided
		};

		// Create the params for DynamoDB
		const params = {
			TableName: process.env.TABLE_NAME,
			Item: item
		};

		// Put the item in DynamoDB
		await docClient.send(new PutCommand(params));

		// Return success response
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Item added successfully",
				item: item
			})
		};
	} catch (error) {
		console.error("Error adding item:", error);

		// Return error response
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Failed to add item",
				error: error.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoDBClient);
};