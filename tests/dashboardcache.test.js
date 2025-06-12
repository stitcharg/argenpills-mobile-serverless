const { Testeablehandler: DashboardCacheHandler } = require('../argenpills-crud/src/dashboardcache/dashboardcache');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { mockDashboardColors, mockDashboardAIhistory } = require('./mockData');

require('dotenv').config();

jest.mock('@aws-sdk/client-dynamodb');
jest.mock("@aws-sdk/client-s3");

describe('Dashboard Cache Writer Tests', () => {
	let dynamoClient;
	let s3Client;

	beforeEach(() => {
		dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
		s3Client = new S3Client({ region: process.env.AWS_REGION });
		DynamoDBClient.prototype.send.mockReset();
		S3Client.prototype.send.mockReset();
	});

	it('should write dashboard data to S3 cache', async () => {
		// Mock DynamoDB responses
		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockResolvedValueOnce(mockDashboardAIhistory);

		// Mock S3 put response
		S3Client.prototype.send.mockResolvedValue({});

		const result = await DashboardCacheHandler(null, null, dynamoClient, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);
		expect(body.message).toBe('Cache updated successfully');
		expect(body.data.colors).toBeDefined();
		expect(body.data.dates).toBeDefined();
		expect(body.data.ai).toBeDefined();
		expect(body.data.lastUpdated).toBeDefined();

		// Verify S3 put was called with correct parameters
		expect(S3Client.prototype.send).toHaveBeenCalledWith(
			expect.objectContaining({
				input: expect.objectContaining({
					Bucket: process.env.BUCKET_CACHE,
					Key: 'dashboard-cache.json',
					ContentType: 'application/json'
				})
			})
		);
	});

	it('should handle DynamoDB pill data retrieval failure', async () => {
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

		DynamoDBClient.prototype.send.mockRejectedValue(dynamoError);

		const result = await DashboardCacheHandler(null, null, dynamoClient, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toContain(dynamoError.message);
	});

	it('should handle DynamoDB AI data retrieval failure', async () => {
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

		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockRejectedValueOnce(dynamoError);

		const result = await DashboardCacheHandler(null, null, dynamoClient, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toContain(dynamoError.message);
	});

	it('should handle S3 write failure', async () => {
		// Mock successful DynamoDB responses
		DynamoDBClient.prototype.send = jest.fn()
			.mockResolvedValueOnce(mockDashboardColors)
			.mockResolvedValueOnce(mockDashboardAIhistory);

		// Mock S3 failure
		const s3Error = new Error('Failed to write to S3');
		S3Client.prototype.send.mockRejectedValue(s3Error);

		const result = await DashboardCacheHandler(null, null, dynamoClient, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toBe('Error writing to cache');
		expect(body.error).toBe('Failed to write to S3');
	});
});