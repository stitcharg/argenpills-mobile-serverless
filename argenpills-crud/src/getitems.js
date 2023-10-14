const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

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
		KeyConditionExpression: "#published = :published",
		ExpressionAttributeNames: {
			'#published': 'published' 
		},	
		ExpressionAttributeValues: {
			":published": { S: 'x' }
		},
		ScanIndexForward: false
	});

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	try {		
		const { Items, Count } = await client.send(command);

		console.log(Items);

		const results = Items.map(unmarshall);

		console.log(results);

		//set the total items
		headers["X-Total-Count"] = Count;

		//Prefix the items URL with the CDN, just to make it simpler to display
		body = results.map(row => {
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
		console.log("ERROR", err);
		throw new Error('Unable to query data');
	}
};

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, client);
};

