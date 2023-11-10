const { DynamoDBClient, QueryCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {
	let body;
	let totalItems = 0; //will store the x-total-count for the /items

	const pageSize = parseInt(event.queryStringParameters?.pageSize) || 10;
	const lastKey = event.queryStringParameters?.lastKey;

	const headers = {
		"Content-Type": "application/json",
		"X-Total-Count": totalItems
	};

	const AP_TABLE = process.env.AP_TABLE;
	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	let params = {
		Limit: pageSize,
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
	};

	// Add the ExclusiveStartKey using lastKey for pagination
	if (lastKey) {
		try {
			const command = new GetItemCommand({
				TableName: AP_TABLE,
				Key: {
					id: { S: lastKey }
				}
			});
			const results = await client.send(command);

			var pillData = unmarshall(results.Item);

			params.ExclusiveStartKey = {
				"posted_date": {
					"S": pillData.posted_date
				},
				"id": {
					"S": lastKey
				},
				"published": {
					"S": pillData.published
				}
			};

		} catch (err) {
			console.log("ERROR GETTING LASTSHOWNKEY", err);

			return {
				headers,
				statusCode: 500,
				body: JSON.stringify({
					message: err
				})
			};
		}
	}

	const command = new QueryCommand(params);

	try {
		const myResults = await client.send(command);

		const { Items, Count, LastEvaluatedKey } = await client.send(command);

		const results = Items.map(unmarshall);

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
			statusCode: 200,
			body: JSON.stringify({
				body,
				LastEvaluatedKey
			})
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

