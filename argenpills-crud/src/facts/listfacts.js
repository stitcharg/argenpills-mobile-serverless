const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.Testeablehandler = async (event, context, dynamoDBClient) => {
	try {
		const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

		// Create the params for DynamoDB scan
		const params = {
			TableName: process.env.TABLE_NAME
		};

		// Scan the table to get all items
		const data = await docClient.send(new ScanCommand(params));

		// Return success response
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data.Items)
		};
	} catch (error) {
		console.error("Error listing facts:", error);

		// Return error response
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Failed to list facts",
				error: error.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoDBClient);
};
