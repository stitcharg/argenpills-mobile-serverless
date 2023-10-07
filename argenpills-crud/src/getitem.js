const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

exports.Testeablehandler = async (event, context, client) => {
	let body;

	const headers = {
		"Content-Type": "application/json"
	};

	const AP_TABLE = process.env.AP_TABLE;

	const command = new GetItemCommand({
		TableName: AP_TABLE,
		Key: {
			id: event.pathParameters.id
		}
	});

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;


	try {
		const results = await client.send(command);
		body = results;

		var pill = body.Item;

		if (pill) {
			if (pill.image)
				pill.image = CDN_IMAGES + pill.image;

			if (pill.lab_image)
				pill.lab_image = CDN_IMAGES + pill.lab_image;
		}

		body = pill;

		return body;

	} catch (err) {
		console.error(err);
		throw new Error('Unable to get data');
	}
};

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return Testeablehandler(event, context, client);
};

