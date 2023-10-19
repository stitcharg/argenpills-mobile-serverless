const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { Readable } = require('stream');
const parse = require('csv-parser');
const fs = require('fs');
const path = require('path');

const region = 'us-east-1';
const tableName = 'argenpills-pills-8c4b3e0'; 
const csvFilePath = path.resolve(__dirname, 'pills.csv');

const client = new DynamoDBClient({ region });

const stream = fs.createReadStream(csvFilePath).pipe(parse());

const putItem = async (item) => {
    const params = {
        TableName: tableName,
        Item: item,
    };

    try {
        console.log(JSON.stringify(item));
        await client.send(new PutItemCommand(params));
        console.log('Successfully added item to DynamoDB:', item);
    } catch (error) {
        console.error('Error:', error);
    }
};

stream.on('data', (row) => {
    console.log(`Adding item ${row.id}...`);
    const item = {
        'id': { S:row.id }
    };

    item['ap_url'] = { S: row.ap_url };
    item['color'] = { S: row.color };
    item['image'] = { S: row.image };
    item['lab_image'] = { S: row.lab_image };
    item['lab_url'] = { S: row.lab_url };
    item['load'] = { N: parseNumber(row.load) };
    item['multiple_batchs'] = { BOOL: parseBoolean(row.multiple_batchs) };
    item['name'] = { S: row.name };
    item['notes'] = { S: row.notes };
    item['posted_date'] = { S: row.posted_date };
    item['published'] = { S: row.published };
    item['search_value'] = { S: row.search_value };
    item['substance'] = { N: parseNumber(row.substance) };
    item['warning'] = { N: parseNumber(row.warning) };
    
    putItem(item);

    console.log(`Item added`);
});

stream.on('end', () => {
  console.log('CSV import completed.');
});

function parseNumber(value) {
    if (value == "") return "0";

    return value;
}

function parseBoolean(value) {
    return (value!="");
}
