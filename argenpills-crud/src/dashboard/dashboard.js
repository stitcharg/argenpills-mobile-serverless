const { DynamoDBClient, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { subMonths, format, parseISO } = require('date-fns');
//const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {

	const headers = {
		"Content-Type": "application/json; charset=utf-8",
	};

	const AP_TABLE = process.env.AP_TABLE;
	const AP_AIBOT_HISTORY_TABLE = process.env.AP_AIBOT_HISTORY_TABLE;

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
		const results = {
			headers,
			statusCode: 200,
			body: JSON.stringify({
				colors: pillData.data.ByColors,
				dates: pillData.data.ByDates,
				ai: aiData.data.ByDates
			})
		}


		return results;
	}

	const fullError = pillData.error + " / " + aiData.error;

	return {
		headers,
		statusCode: 500,
		data: {
			body: JSON.stringify({ message: fullError })
		}
	};

	async function getAIData() {

		return await client
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
		return await client
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
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, client);
};

