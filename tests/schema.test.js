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
    mockTableDescription } = require('./mockData');

require('dotenv').config()

jest.mock('@aws-sdk/client-dynamodb');
jest.mock("@aws-sdk/client-s3");

const mockedDynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });
const mockedS3 = new S3Client({});

const CDN_IMAGES = process.env.CDN_IMAGES;

describe('Argenpills CRUD (Schema tests)', () => {
    beforeEach(() => {
        DynamoDBClient.prototype.send.mockReset();
    });

    it('should return schema error when invalid payload', async () => {

        const body = {
            payload: "x"
        };

        const bodyString = JSON.stringify(body);

        const event = {
            "body": bodyString
        };

        const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

        expect(result.statusCode).toBe(400);

    });

    it('should return schema error when wrong url is sent in payload', async () => {

        const body = {
            "published": "x",
            "ap_url": "invalid",
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

        const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

        const errorMessage = JSON.parse(result.body);

        expect(result.statusCode).toBe(400);

        expect(errorMessage[0].message === '"ap_url" must be a valid uri');

    });

    it('should return schema error when missing published in payload', async () => {

        const body = {
            "ap_url": "invalid",
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

        const result = await AddItemHandler(event, null, mockedDynamoDb, mockedS3);

        const errorMessage = JSON.parse(result.body);

        expect(result.statusCode).toBe(400);

        //        console.log(errorMessage);

        expect(errorMessage[0].message === '"published" is required');

    });
});

