const { Testeablehandler: GetItemsHandler } = require('../src/getitems');
const { Testeablehandler: GetItemHandler } = require('../src/getitem');
const { Testeablehandler: SearchItemsHandler } = require('../src/search');
const { Testeablehandler: AddItemHandler } = require('../src/additem');
const { Testeablehandler: EditItemHandler } = require('../src/edititem');

const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { mockSearchResults, mockGetItemsResponse, mockSingleItemResponse, mockPutItemResult } = require('./mockData');

require('dotenv').config()

jest.mock('@aws-sdk/client-dynamodb');
jest.mock("@aws-sdk/client-s3");

const mockedDynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });
const mockedS3 = new S3Client({});

describe('Argenpills CRUD', () => {
	it('should retrieve data successfully', async () => {
		const event = {
			routeKey: "GET /items"
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockGetItemsResponse);

		const result = await GetItemsHandler(event, null, mockedDynamoDb);

		expect(result.headers["X-Total-Count"]).toBe(2);
	});

	it('should retrieve one item successfully', async () => {

		const event = {
			routeKey: "GET /item",
			pathParameters: {
				id: "206374e8-2a14-4d9a-a9c0-70293aa6e7db"
			}
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSingleItemResponse);

		const result = await GetItemHandler(event, null, mockedDynamoDb);

		expect(result.name).toBe("Pepe");
	});


	it('should retrieve an item when searching', async () => {

		const event = {
			queryStringParameters: {
				s: "amarillo"
			},
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSearchResults);

		const result = await SearchItemsHandler(event, null, mockedDynamoDb);

		expect(result.headers["X-Total-Count"]).toBe(1);
	});

	it('should return http status 403 when searching without parameters', async () => {

		const event = {};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSearchResults);

		const result = await SearchItemsHandler(event, null, mockedDynamoDb);

		expect(result.statusCode).toBe(403);
	});

	it('should return http status 403 when searching for empty string', async () => {

		const event = {
			queryStringParameters: {
			},
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSearchResults);

		const result = await SearchItemsHandler(event, null, mockedDynamoDb);

		expect(result.statusCode).toBe(403);
	});

	it('should return added item', async () => {

		const body = {
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"search_value": "pepe amarillo",
			"notes": "Nota de ejemplo",
			"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		};

		const bodyString = JSON.stringify(body);

		const event = {
			"body": bodyString
		};

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'PutItemCommand') {
				return Promise.resolve(mockPutItemResult);
			}
			if (command.constructor.name === 'GetItemCommand') {
				return Promise.resolve(mockSingleItemResponse);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

		expect(result.statusCode).toBe(200);
	});

	it('should return edited item', async () => {

		const ID = "996374e8-2a14-4d8a-a9c0-70293aa6e7db";

		const body = {
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"search_value": "pepe amarillo",
			"notes": "Nota de ejemplo",
			"id": ID,
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		};

		var mockedEditedItem = mockSingleItemResponse;
		mockedEditedItem.Item.id = ID;

		const bodyString = JSON.stringify(body);

		const event = {
			pathParameters: {
				id: "996374e8-2a14-4d8a-a9c0-70293aa6e7db"
			},
			"body": bodyString
		};

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'PutItemCommand') {
				return Promise.resolve(mockPutItemResult);
			}
			if (command.constructor.name === 'GetItemCommand') {
				return Promise.resolve(mockSingleItemResponse);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await EditItemHandler(event, null, mockedDynamoDb, mockedS3);

		expect(result.statusCode).toBe(200);

		var resultObject = JSON.parse(result.body);

		expect(resultObject.id).toBe(ID);
	});
});



