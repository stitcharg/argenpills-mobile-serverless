const { DynamoDBClient, QueryCommand, GetItemCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// In-memory cache
const cache = {
	items: new Map(),
	count: null,
	lastUpdated: null
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

exports.Testeablehandler = async (event, context, client) => {
	let body;
	let totalItems = 0; //will store the x-total-count for the /items

	const pageSize = parseInt(event.queryStringParameters?.pageSize) || 10;
	const lastKey = event.queryStringParameters?.lastKey;

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
		"X-Total-Count": totalItems
	};

	const AP_TABLE = process.env.AP_TABLE;
	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	// Check if cache is valid
	const now = Date.now();
	if (cache.lastUpdated && (now - cache.lastUpdated) < CACHE_TTL) {
		const cacheKey = `${pageSize}:${lastKey || 'first'}`;
		const cachedResult = cache.items.get(cacheKey);

		if (cachedResult) {
			return {
				...cachedResult,
				headers: {
					...cachedResult.headers,
					"X-Cache": "HIT"
				}
			};
		}
	}

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
		headers["X-Total-Count"] = await countItems(client, AP_TABLE);

		//Prefix the items URL with the CDN, just to make it simpler to display
		body = results.map(row => {
			if (row.image)
				row.image = CDN_IMAGES + row.image;

			if (row.lab_image)
				row.lab_image = CDN_IMAGES + row.lab_image;

			return row;
		});

		const response = {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				data: body,
				LastEvaluatedKey: (LastEvaluatedKey ? LastEvaluatedKey.id.S : null)
			})
		};

		// Update cache
		const cacheKey = `${pageSize}:${lastKey || 'first'}`;
		cache.items.set(cacheKey, response);
		cache.lastUpdated = now;

		return response;

	} catch (err) {
		console.log("ERROR", err);
		throw new Error('Unable to query data');
	}
};

async function countItems(client, tableName) {
	// Check if count is cached and valid
	const now = Date.now();
	if (cache.count !== null && cache.lastUpdated && (now - cache.lastUpdated) < CACHE_TTL) {
		return cache.count;
	}

	const params = new DescribeTableCommand({
		TableName: tableName
	});

	try {
		const response = await client.send(params);
		const count = response.Table.ItemCount;

		// Update cache
		cache.count = count;
		cache.lastUpdated = now;

		return count;
	} catch (ex) {
		console.log("ERROR COUNTING ITEMS", ex);
		return 0;
	}
}

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, client);
};

