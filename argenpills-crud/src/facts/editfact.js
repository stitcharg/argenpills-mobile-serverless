const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

exports.Testeablehandler = async (event, context, dynamoDBClient) => {
	try {
		const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

		// Get the ID from path parameters
		const id = event.pathParameters.id;

		// Parse the request body
		const body = JSON.parse(event.body);

		// First, check if the item exists
		const getParams = {
			TableName: process.env.TABLE_NAME,
			Key: {
				Id: id
			}
		};

		const { Item } = await docClient.send(new GetCommand(getParams));

		if (!Item) {
			return {
				statusCode: 404,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					message: "Item not found"
				})
			};
		}

		// Create update expression and attribute values
		let updateExpression = "SET ";
		const expressionAttributeValues = {};
		const expressionAttributeNames = {};

		if (body.text !== undefined) {
			updateExpression += "#text = :text, ";
			expressionAttributeValues[":text"] = body.text;
			expressionAttributeNames["#text"] = "text";
		}

		if (body.used !== undefined) {
			updateExpression += "#used = :used, ";
			expressionAttributeValues[":used"] = body.used;
			expressionAttributeNames["#used"] = "used";
		}

		// Remove trailing comma and space
		updateExpression = updateExpression.slice(0, -2);

		// Create the params for DynamoDB update
		const updateParams = {
			TableName: process.env.TABLE_NAME,
			Key: {
				Id: id
			},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: "ALL_NEW"
		};

		// Update the item in DynamoDB
		const result = await docClient.send(new UpdateCommand(updateParams));

		// Return success response
		return {
			statusCode: 200,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Item updated successfully",
				item: result.Attributes
			})
		};
	} catch (error) {
		console.error("Error updating item:", error);

		// Return error response
		return {
			statusCode: 500,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				message: "Failed to update item",
				error: error.message
			})
		};
	}
};

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoDBClient);
};