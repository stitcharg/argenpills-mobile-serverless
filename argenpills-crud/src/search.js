const { DynamoDBClient, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");

exports.Testeablehandler = async (event, context, client) => {
	let body;
	let statusCode = 200;
	let totalItems = 0; //will store the x-total-count for the /items

	const headers = {
		"Content-Type": "application/json",
		"X-Total-Count": totalItems
	};

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	const AP_TABLE = process.env.AP_TABLE;

	const queryParams = event.queryStringParameters;

	if (queryParams == null) {
		statusCode = 403;
		body = "Missing parameter";
	}
	else {
		const search = queryParams.s;

		if (search == null) {
			statusCode = 403;
			body = "Missing parameter";
		}
		else {

			const command = new ScanCommand({
				TableName: AP_TABLE,
				IndexName: "published-posted_date-index",
				FilterExpression: "contains(search_value, :c) and published = :published",
				ExpressionAttributeValues: {
					":published": 'x',
					":c": search.toLowerCase()
				}
			})
			body = await client.send(command);

			//set the total items
			headers["X-Total-Count"] = body.Count;

			//Prefix the items URL with the CDN, just to make it simpler to display
			body = body.Items.map(row => {
				if (row.image)
					row.image = CDN_IMAGES + row.image;

				if (row.lab_image)
					row.lab_image = CDN_IMAGES + row.lab_image;

				return row;
			});

			body = JSON.stringify(body);
		}
	}

	return {
		statusCode,
		body,
		headers
	};
};

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return Testeablehandler(event, context, client);
};





