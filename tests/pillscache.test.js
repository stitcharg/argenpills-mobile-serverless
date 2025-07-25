const { Testeablehandler } = require('../argenpills-crud/src/pillscache/pillscache.js');

describe('pillscache Testeablehandler', () => {
	let dynamoClientMock, s3ClientMock;
	const mockItems = [
		{
			image: 'img1.jpg',
			lab_image: 'lab1.jpg',
			id: '1',
			posted_date: '2024-06-01',
			published: 'x'
		},
		{
			image: 'img2.jpg',
			id: '2',
			posted_date: '2024-05-30',
			published: 'x'
		}
	];

	beforeEach(() => {
		process.env.AP_TABLE = 'test-table';
		process.env.BUCKET_CACHE = 'test-bucket';
		process.env.CDN_IMAGES = 'https://cdn.example.com/';

		// Mock DynamoDBClient
		dynamoClientMock = {
			send: jest.fn().mockResolvedValue({
				Items: mockItems.map(item => {
					// Simulate DynamoDB marshalling
					const marshalled = {};
					for (const key in item) {
						marshalled[key] = { S: item[key] };
					}
					return marshalled;
				})
			})
		};

		// Mock S3Client
		s3ClientMock = {
			send: jest.fn().mockResolvedValue({})
		};
	});

	it('should write the latest 50 items to S3 and return success', async () => {
		const event = {};
		const context = {};

		const response = await Testeablehandler(event, context, dynamoClientMock, s3ClientMock);

		expect(dynamoClientMock.send).toHaveBeenCalled();
		expect(s3ClientMock.send).toHaveBeenCalled();

		// Check S3 PutObjectCommand payload
		const s3Call = s3ClientMock.send.mock.calls[0][0];
		expect(s3Call.input.Bucket).toBe('test-bucket');
		expect(s3Call.input.Key).toBe('pills-cache-50.json');
		const body = JSON.parse(s3Call.input.Body);
		expect(Array.isArray(body.data)).toBe(true);
		expect(body.data.length).toBe(mockItems.length);
		expect(body.data[0].image).toBe('https://cdn.example.com/img1.jpg');
		expect(body.data[0].lab_image).toBe('https://cdn.example.com/lab1.jpg');
		expect(body.data[1].image).toBe('https://cdn.example.com/img2.jpg');

		// Check response
		expect(response.statusCode).toBe(200);
		const parsed = JSON.parse(response.body);
		expect(parsed.message).toBe("Pills cache updated successfully");
		expect(parsed.count).toBe(mockItems.length);
		// No data property in response body
	});

	it('should handle errors gracefully', async () => {
		dynamoClientMock.send.mockRejectedValueOnce(new Error('DynamoDB error'));
		const event = {};
		const context = {};

		const response = await Testeablehandler(event, context, dynamoClientMock, s3ClientMock);

		expect(response.statusCode).toBe(500);
		const parsed = JSON.parse(response.body);
		expect(parsed.message).toBe("Error updating pills cache");
		expect(parsed.error).toBe("DynamoDB error");
	});
});