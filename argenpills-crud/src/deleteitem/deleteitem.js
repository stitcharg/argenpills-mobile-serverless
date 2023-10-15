const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {
	let body;

	const headers = {
		"Content-Type": "application/json"
	};

	if (event == null || event.pathParameters?.id == null) {
		return { 
			statusCode: 500,
			body: "Mising ID Parameter"
		}
	}

	const AP_TABLE = process.env.AP_TABLE;
    const ITEM_ID = event.pathParameters.id;

	const command = new DeleteItemCommand({
		TableName: AP_TABLE,
		Key: {
			id: {S: ITEM_ID }
		}
	});

	try {
		const results = await client.send(command);
        
		return {
			statusCode: 200,
			body: JSON.stringify({
                message: `Item ${ITEM_ID} deleted`
            })
		};

	} catch (err) {
		console.error(err);
		throw new Error('Unable to get data');
	}
};

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, client);
};

