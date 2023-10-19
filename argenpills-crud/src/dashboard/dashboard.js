const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
//const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

exports.Testeablehandler = async (event, context, client) => {

	const headers = {
		"Content-Type": "application/json"
	};

	const AP_TABLE = process.env.AP_TABLE;

    const scanParams = {
        TableName: AP_TABLE
      };

    const scanCommand = new ScanCommand(scanParams);

	const results = await client
        .send(scanCommand)
        .then((data) => {
            const items = data.Items;

            const colorCounts = getColors(items);
            const groupedByDate = groupByDate(items);

            return {
                headers,
                statusCode: 200,
                body: JSON.stringify( {colors: colorCounts, dates: groupedByDate})
            };            
        })
        .catch((err) => {
            console.error("Error scanning for items:", err);

            return {
                headers,
                statusCode: 500,
                body: JSON.stringify({message: err})
            };            
        });

    return results;
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
    
    return groupedItems;
}

exports.handler = async (event, context) => {
	const client = new DynamoDBClient({ region: process.env.AWS_REGION });
	return exports.Testeablehandler(event, context, client);
};

