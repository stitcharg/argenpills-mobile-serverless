const { Testeablehandler: GetItemsHandler } = require('../argenpills-crud/src/getitems/getitems');
const { Testeablehandler: GetItemHandler } = require('../argenpills-crud/src/getitem/getitem');
const { Testeablehandler: SearchItemsHandler } = require('../argenpills-crud/src/search/search');
const { Testeablehandler: AddItemHandler } = require('../argenpills-crud/src/additem/additem');
const { Testeablehandler: EditItemHandler } = require('../argenpills-crud/src/edititem/edititem');
const { Testeablehandler: DeleteItemHandler } = require('../argenpills-crud/src/deleteitem/deleteitem');
const { Testeablehandler: DashboardHandler } = require('../argenpills-crud/src/dashboard/dashboard');

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { mockSearchResults,
	mockGetItemsResponse,
	mockSingleItemResponse,
	mockPutItemResult,
	mockItemNotFound,
	mockDashboardColors,
	mockPagedDataSecondPage,
	mockPagedData,
	mockTableDescription,
	mockSingleItemResponseSpecialChars } = require('./mockData');

require('dotenv').config()

jest.mock('@aws-sdk/client-dynamodb');
jest.mock("@aws-sdk/client-s3");

const mockedDynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });
const mockedS3 = new S3Client({});

const CDN_IMAGES = process.env.CDN_IMAGES;

describe('Argenpills CRUD', () => {
	beforeEach(() => {
		DynamoDBClient.prototype.send.mockReset();
	});

	it('should retrieve data successfully', async () => {
		const event = {};

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'DescribeTableCommand') {
				return Promise.resolve(mockTableDescription);
			}
			if (command.constructor.name === 'QueryCommand') {
				return Promise.resolve(mockGetItemsResponse);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await GetItemsHandler(event, null, mockedDynamoDb);

		expect(result.headers["X-Total-Count"]).toBe(9);
	});

	it('should return 404 to retrieve an unexisting item', async () => {
		const event = {
			pathParameters: {
				id: "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			}
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockItemNotFound);

		const result = await GetItemHandler(event, null, mockedDynamoDb);

		expect(result.statusCode).toBe(404);
	});

	it('should fail retrieve one item (no id)', async () => {
		const event = {};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSingleItemResponse);

		const result = await GetItemHandler(event, null, mockedDynamoDb);

		expect(result.statusCode).toBe(400);
	});

	it('should retrieve one item successfully', async () => {

		const event = {
			pathParameters: {
				id: "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			}
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSingleItemResponse);

		const result = await GetItemHandler(event, null, mockedDynamoDb);

		const body = JSON.parse(result.body);

		expect(body.name).toBe("Pepe");
	});


	it('should retrieve an item when searching', async () => {

		const event = {
			queryStringParameters: {
				s: "amarillo"
			},
		};

		//replace the id of the existing mocking data
		const lastItem = mockSingleItemResponse;
		lastItem.Item.id = { S: "7a6a496e-a916-4e32-92bb-df5eb64e02db" };
		lastItem.Item.posted_date = { S: '2023-01-16' }

		mockPagedData.Count = 1;

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'GetItemCommand') {
				return Promise.resolve(lastItem);
			}
			if (command.constructor.name === 'ScanCommand') {
				return Promise.resolve(mockPagedData);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

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

	it('should return added item with special characters', async () => {

		const body = {
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"notes": "Acentos y éáíñ",
			"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
			"posted_date": "2023-01-01",
			"name": "Pepe éáíñ",
			"color": "amarillo éáíñ"
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
				return Promise.resolve(mockSingleItemResponseSpecialChars);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

		expect(result.statusCode).toBe(200);
		expect(body.name).toBe("Pepe éáíñ");
	});

	it('should add item without images and return added item', async () => {

		const body = {
			"published": "x",
			"ap_url": "https://argenpills.org/showthread.php?tid=111",
			"image": "/pills/0.jpg",
			"notes": "Nota de ejemplo",
			"id": "206374e8-2a14-4d8a-a9c0-70293aa6e7db",
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		};

		const bodyString = JSON.stringify(body);

		const event = {
			"body": bodyString,
			"isBase64Encoded": false
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

	it('should add item with 1 image and return values', async () => {

		const event = {
			headers: {
				accept: '*/*',
				authorization: 'Bearer eyJraWQiOi...g',
				'content-length': '1301',
				'content-type': 'multipart/form-data; boundary=X-INSOMNIA-BOUNDARY',
				host: 'api.sandbox.argenpills.info',
			},
			body: 'LS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InB1Ymxpc2hlZCINCg0KeA0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImFwX3VybCINCg0KaHR0cHM6Ly9hcmdlbnBpbGxzLm9yZy9zaG93dGhyZWFkLnBocD90aWQ9NzM0Nw0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InBvc3RlZF9kYXRlIg0KDQoyMDIzLTExLTA1DQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0ibmFtZSINCg0KUElYRUwgYmxhbmNhDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0ibm90ZXMiDQoNCkFCQ0QNCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJtdWx0aXBsZV9iYXRjaHMiDQoNCmZhbHNlDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0iY29sb3IiDQoNCkJsYW5jYQ0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InVwbF9pbWFnZSI7IGZpbGVuYW1lPSJwaXhlbC5wbmciDQpDb250ZW50LVR5cGU6IGltYWdlL3BuZw0KDQrvv71QTkcNChoNCu+/ve+/ve+/vQ0KSUhEUu+/ve+/ve+/vQHvv73vv73vv70BCAbvv73vv73vv70fFcSJ77+977+977+9BHNCSVQICAgIfAhk77+977+977+977+9DQpJREFUCO+/vWPvv73vv73vv70/77+9BWMCfhvvv71ueO+/ve+/ve+/ve+/vUlFTkTvv71CYO+/vQ0KLS1YLUlOU09NTklBLUJPVU5EQVJZLS0NCg==',
			isBase64Encoded: true
		}

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
			"notes": "Nota de ejemplo",
			"id": ID,
			"posted_date": "2023-01-01",
			"name": "Pepe",
			"color": "amarillo"
		};

		var mockedEditedItem = mockSingleItemResponse;
		mockedEditedItem.Item.id = { S: ID };

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

	it('should delete the item', async () => {

		const event = {
			pathParameters: {
				id: "787f23d3-7f90-4394-8ea8-af32e1ad3e6a"
			}
		};

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockSingleItemResponse);

		const result = await DeleteItemHandler(event, null, mockedDynamoDb);

		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);
	});

	it('should retrieve dashboard information (colors)', async () => {

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockDashboardColors);

		const result = await DashboardHandler(null, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);

		expect(body.colors.roja).toBe(1);
	});

	it('should retrieve dashboard information (by date)', async () => {

		DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockDashboardColors);

		const result = await DashboardHandler(null, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);

		expect(body.dates.length).toBe(2);
	});

	it('should paginate records successfully (no pagesize parameter)', async () => {
		const event = {
		};

		mockTableDescription.Table.ItemCount = 5;

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'DescribeTableCommand') {
				return Promise.resolve(mockTableDescription);
			}
			if (command.constructor.name === 'QueryCommand') {
				return Promise.resolve(mockPagedData);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await GetItemsHandler(event, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.headers["X-Total-Count"]).toBe(5);

		expect(body.LastEvaluatedKey).toBeDefined();
	});

	it('should paginate records successfully (pagesize = 5)', async () => {
		const event = {
			queryStringParameters: {
				pageSize: 5
			}
		};

		mockTableDescription.Table.ItemCount = 5;

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'DescribeTableCommand') {
				return Promise.resolve(mockTableDescription);
			}
			if (command.constructor.name === 'QueryCommand') {
				return Promise.resolve(mockPagedData);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		//DynamoDBClient.prototype.send = jest.fn().mockResolvedValue(mockPagedData);

		const result = await GetItemsHandler(event, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.headers["X-Total-Count"]).toBe(5);
		expect(body.LastEvaluatedKey).toBeDefined();
	});

	it('should paginate records successfully (page 2, pagesize 2)', async () => {
		const event = {
			queryStringParameters: {
				pageSize: 2,
				lastKey: "7a6a496e-a916-4e32-92bb-df5eb64e02db"
			}
		};

		//replace the id of the existing mocking data
		const lastItem = mockSingleItemResponse;
		lastItem.Item.id = { S: "7a6a496e-a916-4e32-92bb-df5eb64e02db" };
		lastItem.Item.posted_date = { S: '2023-01-16' }

		mockTableDescription.Table.ItemCount = 3;

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'GetItemCommand') {
				return Promise.resolve(lastItem);
			}
			if (command.constructor.name === 'QueryCommand') {
				return Promise.resolve(mockPagedDataSecondPage);
			}
			if (command.constructor.name === 'DescribeTableCommand') {
				return Promise.resolve(mockTableDescription);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await GetItemsHandler(event, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.headers["X-Total-Count"]).toBe(3);
		expect(body.LastEvaluatedKey).toBeDefined();
	});

	it('should edit item with 2 images and return values', async () => {

		const pillPath = "/pills/pill.jpg";
		const labPath = "/pills/lab.jpg";

		const event = {
			headers: {
				accept: '*/*',
				authorization: 'Bearer eyJraWQiOi...g',
				'content-length': '1722',
				'content-type': 'multipart/form-data; boundary=X-INSOMNIA-BOUNDARY',
				host: 'api.sandbox.argenpills.info',
			},
			body: 'LS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InB1Ymxpc2hlZCINCg0KeA0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImFwX3VybCINCg0KaHR0cHM6Ly9hcmdlbnBpbGxzLm9yZy9zaG93dGhyZWFkLnBocD90aWQ9NzM0Nw0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InBvc3RlZF9kYXRlIg0KDQoyMDIzLTEwLTAzDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0ibmFtZSINCg0KZWRpdCBJbnRlciBNaWFtaQ0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9Im5vdGVzIg0KDQpTb24gcm9zYSBjaGlsbMOzbi4gTm8gcGFyZWNlbiB0ZW5lciBidWVuIGxhcXVlYWRvLiBObyBzYWJlbW9zIHNpIHRpZW5lbiBsw61uZWEgZGl2aXNvcmlhLg0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9Im11bHRpcGxlX2JhdGNocyINCg0KZmFsc2UNCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJpZCINCg0KMTIwYzU4MGYtOTk1MS00MTY4LThhOTktNzZhZDg3Y2E2ZTgyDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0iY29sb3IiDQoNClJvc2ENCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJ1cGxfaW1hZ2UiOyBmaWxlbmFtZT0icGl4ZWwucG5nIg0KQ29udGVudC1UeXBlOiBpbWFnZS9wbmcNCg0K77+9UE5HDQoaDQrvv73vv73vv70NCklIRFLvv73vv73vv70B77+977+977+9AQgG77+977+977+9HxXEie+/ve+/ve+/vQRzQklUCAgICHwIZO+/ve+/ve+/ve+/vQ0KSURBVAjvv71j77+977+977+9P++/vQVjAn4b77+9bnjvv73vv73vv73vv71JRU5E77+9QmDvv70NCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJ1cGxfbGFiIjsgZmlsZW5hbWU9InBpeGVsLnBuZyINCkNvbnRlbnQtVHlwZTogaW1hZ2UvcG5nDQoNCu+/vVBORw0KGg0K77+977+977+9DQpJSERS77+977+977+9Ae+/ve+/ve+/vQEIBu+/ve+/ve+/vR8VxInvv73vv73vv70Ec0JJVAgICAh8CGTvv73vv73vv73vv70NCklEQVQI77+9Y++/ve+/ve+/vT/vv70FYwJ+G++/vW5477+977+977+977+9SUVORO+/vUJg77+9DQotLVgtSU5TT01OSUEtQk9VTkRBUlktLQ0K',
			isBase64Encoded: true
		}

		var editedItem = mockSingleItemResponse;
		editedItem.Item.lab_image = { S: labPath };
		editedItem.Item.image = { S: pillPath };

		DynamoDBClient.prototype.send = jest.fn().mockImplementation((command) => {
			if (command.constructor.name === 'PutItemCommand') {
				return Promise.resolve(mockPutItemResult);
			}
			if (command.constructor.name === 'GetItemCommand') {
				return Promise.resolve(editedItem);
			}
			return Promise.reject(new Error("Unrecognized command"));
		});

		const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

		expect(result.statusCode).toBe(200);

		body = JSON.parse(result.body);

		expect(body.image).toBeDefined();
		expect(body.image).toBe(CDN_IMAGES + pillPath);

		expect(body.lab_image).toBeDefined();
		expect(body.lab_image).toBe(CDN_IMAGES + labPath);
	});

});

