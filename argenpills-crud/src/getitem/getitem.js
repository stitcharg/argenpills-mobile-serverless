const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {
	let body;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
	};

	if (event == null || event.pathParameters?.id == null) {
		return {
			statusCode: 400,
			body: JSON.stringify({ message: `"Mising ID Parameter"` })
		}
	}

	const AP_TABLE = process.env.AP_TABLE;
	const ITEM_ID = event.pathParameters.id;

	const command = new GetItemCommand({
		TableName: AP_TABLE,
		Key: {
			id: { S: ITEM_ID }
		}
	});

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	try {
		const results = await client.send(command);
		body = results;

		if (body.Item == null) {
			//item not found
			return {
				headers,
				statusCode: 404,
				body: JSON.stringify({ message: `Item ${ITEM_ID} not found` })
			};
		}

		var pill = unmarshall(body.Item);

		if (pill) {
			if (pill.image)
				pill.image = CDN_IMAGES + pill.image;

			if (pill.lab_image)
				pill.lab_image = CDN_IMAGES + pill.lab_image;
		}

		body = pill;

		return {
			headers,
			statusCode: 200,
			body: JSON.stringify(body)
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

