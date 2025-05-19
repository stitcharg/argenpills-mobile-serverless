const { Testeablehandler: DashboardHandler } = require('../argenpills-crud/src/dashboard/dashboard');

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { mockDashboardColors, mockDashboardAIhistory } = require('./mockData');

require('dotenv').config()

jest.mock('@aws-sdk/client-dynamodb');
jest.mock("@aws-sdk/client-s3");

const mockedDynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });


describe('Argenpills CRUD (Dashboard tests)', () => {
	let mockedDynamoDb;

	beforeEach(() => {
		// Create a new instance for each test
		mockedDynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });
		// Reset the mock
		DynamoDBClient.prototype.send.mockReset();
	});

	it('should retrieve dashboard information (colors)', async () => {

		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockResolvedValueOnce(mockDashboardAIhistory);

		const result = await DashboardHandler(null, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);

		expect(body.colors.roja).toBe(1);
	});

	it('should retrieve dashboard information (by date)', async () => {

		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockResolvedValueOnce(mockDashboardAIhistory);

		const result = await DashboardHandler(null, null, mockedDynamoDb);

		body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);

		expect(body.dates.length).toBe(2);
	});

	it('should retrieve ai history information (by date)', async () => {

		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockResolvedValueOnce(mockDashboardAIhistory);

		const result = await DashboardHandler(null, null, mockedDynamoDb);;

		body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);

		expect(body.ai.length).toBe(1);
		expect(body.ai[0].value).toBe(3);
	});

	it('should handle pill data retrieval failure', async () => {
		const dynamoError = {
			name: 'DynamoDBError',
			message: 'Error scanning for items: DynamoDB error',
			$metadata: {
				httpStatusCode: 500,
				requestId: 'test-request-id',
				attempts: 1,
				totalRetryDelay: 0
			}
		};

		// Mock the send method to return a Promise
		mockedDynamoDb.send = jest.fn().mockRejectedValue(dynamoError);

		const result = await DashboardHandler(null, null, mockedDynamoDb);

		const body = JSON.parse(result.data.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toContain(dynamoError.message);
	});

	it('should handle AI data retrieval failure', async () => {
		const dynamoError = {
			name: 'DynamoDBError',
			message: 'Error scanning for items: DynamoDB error',
			$metadata: {
				httpStatusCode: 500,
				requestId: 'test-request-id',
				attempts: 1,
				totalRetryDelay: 0
			}
		};

		// Mock the send method to return a Promise
		mockedDynamoDb.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockRejectedValueOnce(dynamoError);

		const result = await DashboardHandler(null, null, mockedDynamoDb);
		const body = JSON.parse(result.data.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toContain(dynamoError.message);
	});
});