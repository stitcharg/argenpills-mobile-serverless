const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

exports.Testeablehandler = async (event, context, dynamoDBClient) => {
	try {
		const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

		// Get the ID from path parameters
		const id = event.pathParameters && event.pathParameters.id;

		if (!id) {
			return {
				statusCode: 400,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					message: "Missing 'id' in path parameters"
				})
			};
		}

		// Create the params for DynamoDB delete
		const params = {
			TableName: process.env.TABLE_NAME,
			Key: {
				Id: id
			}
		};

		// Delete the item from DynamoDB
		await docClient.send(new DeleteCommand(params));

		// Return success response
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Fact deleted successfully"
			})
		};
	} catch (error) {
		console.error("Error deleting fact:", error);

		// Return error response
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Failed to delete fact",
				error: error.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoDBClient);
};
