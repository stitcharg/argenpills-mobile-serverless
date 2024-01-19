const { DynamoDBClient, GetItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {
	let body;
	let statusCode = 200;
	let totalItems = 0; //will store the x-total-count for the /items

	const pageSize = parseInt(event.queryStringParameters?.pageSize) || 10;
	const lastKey = event.queryStringParameters?.lastKey;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
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

			const params = {
				TableName: AP_TABLE,
				IndexName: "word-index",
				KeyConditionExpression: "word = :c",
				ExpressionAttributeValues: {
					":c": { S: search.toLowerCase() }
				},
				Limit: pageSize,
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

			const command = new QueryCommand(params)

			//TODO: revisar la paginacion, porque creo que con el nuevo indice no anda bien. Pero por ahora zafa
			const { Items, Count, LastEvaluatedKey } = await client.send(command);

			const searchResults = Items.map(unmarshall);

			results = searchResults.map(item => {
				//Deserialize the JSON and return it
				return JSON.parse(item.record);
			});

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
					data: body,
					LastEvaluatedKey: (Count === 0 ? null : LastEvaluatedKey)
				})
			};
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
	return exports.Testeablehandler(event, context, client);
};
