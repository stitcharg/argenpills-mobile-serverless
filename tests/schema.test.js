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

    it('should add item with 1 image and return values', async () => {

        const event = {
            headers: {
                accept: '*/*',
                authorization: 'Bearer eyJraWQiOi...g',
                'content-length': '1301',
                'content-type': 'multipart/form-data; boundary=X-INSOMNIA-BOUNDARY',
                host: 'api.sandbox.argenpills.info',
            },
            body: 'LS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InB1Ymxpc2hlZCINCg0KeA0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9ImFwX3VybCINCg0KaHR0cHM6Ly9hcmdlbnBpbGxzLm9yZy9zaG93dGhyZWFkLnBocD90aWQ9NzM0Nw0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9InNlYXJjaF92YWx1ZSINCg0KUElYRUwgYmxhbmNhDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0icG9zdGVkX2RhdGUiDQoNCjIwMjMtMTEtMDUNCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIg0KDQpQSVhFTCBibGFuY2ENCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJub3RlcyINCg0KQUJDRA0KLS1YLUlOU09NTklBLUJPVU5EQVJZDQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9Im11bHRpcGxlX2JhdGNocyINCg0KZmFsc2UNCi0tWC1JTlNPTU5JQS1CT1VOREFSWQ0KQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJjb2xvciINCg0KQmxhbmNhDQotLVgtSU5TT01OSUEtQk9VTkRBUlkNCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0idXBsX2ltYWdlIjsgZmlsZW5hbWU9InBpeGVsLnBuZyINCkNvbnRlbnQtVHlwZTogaW1hZ2UvcG5nDQoNCu+/vVBORw0KGg0K77+977+977+9DQpJSERS77+977+977+9Ae+/ve+/ve+/vQEIBu+/ve+/ve+/vR8VxInvv73vv73vv70Ec0JJVAgICAh8CGTvv73vv73vv73vv70NCklEQVQI77+9Y++/ve+/ve+/vT/vv70FYwJ+G++/vW5477+977+977+977+9SUVORO+/vUJg77+9DQotLVgtSU5TT01OSUEtQk9VTkRBUlktLQ0K',
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

});

