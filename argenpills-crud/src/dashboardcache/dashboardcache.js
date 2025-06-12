const { DynamoDBClient, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { subMonths, format, parseISO } = require('date-fns');
//const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, dynamoClient, s3Client) => {
	const headers = {
		"Content-Type": "application/json; charset=utf-8",
	};

	const AP_TABLE = process.env.AP_TABLE;
	const AP_AIBOT_HISTORY_TABLE = process.env.AP_AIBOT_HISTORY_TABLE;
	const BUCKET_CACHE = process.env.BUCKET_CACHE;

	const scanParams = {
		TableName: AP_TABLE
	};

	const scanCommand = new ScanCommand(scanParams);

	const pillData = await getPillData();

	const today = new Date();
	const oneMonthAgo = format(subMonths(today, 1), "yyyy-MM-dd");

	const aiscanParams = {
		TableName: AP_AIBOT_HISTORY_TABLE,
		IndexName: "index-telegram-bot-history",
		ExpressionAttributeValues: {
			":date":
			{
				"S": oneMonthAgo
			}
		},
		FilterExpression: "createdAtDate >= :date",
		ExpressionAttributeNames: {
			"#DT": "createdAtDate"
		},
		ProjectionExpression: "#DT"
	};

	const aiQueryCommand = new ScanCommand(aiscanParams);

	const aiData = await getAIData();

	if (pillData.result && aiData.result) {
		const cacheData = {
			colors: pillData.data.ByColors,
			dates: pillData.data.ByDates,
			ai: aiData.data.ByDates,
			lastUpdated: format(today, "yyyy-MM-dd HH:mm:ss")
		};

		// Write to S3 cache
		try {
			await s3Client.send(new PutObjectCommand({
				Bucket: BUCKET_CACHE,
				Key: 'dashboard-cache.json',
				Body: JSON.stringify(cacheData),
				ContentType: 'application/json'
			}));

			return {
				headers,
				statusCode: 200,
				body: JSON.stringify({
					message: "Cache updated successfully",
					data: cacheData
				})
			};
		} catch (s3Error) {
			console.error("Error writing to cache:", s3Error);
			return {
				headers,
				statusCode: 500,
				body: JSON.stringify({
					message: "Error writing to cache",
					error: s3Error.message
				})
			};
		}
	}

	const fullError = pillData.error + " / " + aiData.error;

	return {
		headers,
		statusCode: 500,
		body: JSON.stringify({ message: fullError })
	};

	async function getAIData() {

		return await dynamoClient
			.send(aiQueryCommand)
			.then((data) => {
				const aiItems = data.Items;

				const groupedByDate = groupHistoryByDate(aiItems);

				return {
					result: true,
					data: {
						ByDates: groupedByDate
					}
				};
			})
			.catch((err) => {
				console.error("Error scanning for items:", err);

				return {
					result: false,
					error: JSON.stringify(err)
				};
			});
	}

	async function getPillData() {
		return await dynamoClient
			.send(scanCommand)
			.then((data) => {
				const items = data.Items;

				const colorCounts = getColors(items);
				const groupedByDate = groupByDate(items);

				return {
					result: true,
					data: {
						ByColors: colorCounts,
						ByDates: groupedByDate
					}
				};
			})
			.catch((err) => {
				console.error("Error scanning for items:", err);

				return {
					result: false,
					error: JSON.stringify(err)
				};
			});
	}
};

function getColors(items) {
	const colorCounts = {};

	items.forEach((item) => {
		const color = item.color.S;

		if (!colorCounts[color]) {
			colorCounts[color] = 1;
		} else {
			colorCounts[color]++;
		}
	});

	return colorCounts;
}

function groupByDate(items) {
	const groupedItems = {};

	items.forEach((item) => {
		const datePublished = item.posted_date.S;
		const monthYear = datePublished.substring(0, 7); // Extract "yyyy-mm" from the date

		if (!groupedItems[monthYear]) {
			groupedItems[monthYear] = 1
		} else {
			groupedItems[monthYear]++;
		}
	});

	// Sorting the data by date
	const sortedData = Object.fromEntries(
		Object.entries(groupedItems).sort()
	);

	return Object.keys(sortedData).map((key) => ({ date: key, value: sortedData[key] }));
}

function groupHistoryByDate(items) {
	const groupedItems = {};

	items.forEach((item) => {
		const datePublished = item.createdAtDate.S;

		const dailyGroup = datePublished.substring(0, 10); // Extract "yyyy-mm-dd" from the date

		if (!groupedItems[dailyGroup]) {
			groupedItems[dailyGroup] = 1
		} else {
			groupedItems[dailyGroup]++;
		}
	});

	// Sorting the data by date
	const sortedData = Object.fromEntries(
		Object.entries(groupedItems).sort()
	);

	return Object.keys(sortedData).map((key) => ({ date: simplifyKey(key), value: sortedData[key] }));
}

function simplifyKey(key) {
	var keyDate = parseISO(key);

	return format(keyDate, "dd-MM-yy");
}

exports.handler = async (event, context) => {
	const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	const s3Client = new S3Client({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, dynamoClient, s3Client);
};

