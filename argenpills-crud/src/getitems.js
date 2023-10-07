const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

exports.Testeablehandler = async (event, context, client) => {
	let body;
	let totalItems = 0; //will store the x-total-count for the /items

	const headers = {
		"Content-Type": "application/json",
		"X-Total-Count": totalItems
	};

	const AP_TABLE = process.env.AP_TABLE;

	const command = new QueryCommand({
		TableName: AP_TABLE,
		IndexName: "published-posted_date-index",
		KeyConditionExpression: "published = :published",
		ExpressionAttributeValues: {
			":published": 'x'
		},
		ScanIndexForward: false
	});

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	try {
		const results = await client.send(command);

		//set the total items
		headers["X-Total-Count"] = results.Count;

		//Prefix the items URL with the CDN, just to make it simpler to display
		body = results.Items.map(row => {
			if (row.image)
				row.image = CDN_IMAGES + row.image;

			if (row.lab_image)
				row.lab_image = CDN_IMAGES + row.lab_image;

			return row;
		});

		return {
			headers,
			body: JSON.stringify(body)
		};

	} catch (err) {
		console.error(err);
		throw new Error('Unable to query data');
	}
};

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return Testeablehandler(event, context, client);
};

