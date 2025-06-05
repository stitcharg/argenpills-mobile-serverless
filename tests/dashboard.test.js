const { Testeablehandler: DashboardHandler } = require('../argenpills-crud/src/dashboard/dashboard');
const { S3Client } = require("@aws-sdk/client-s3");

jest.mock("@aws-sdk/client-s3");

describe('Dashboard S3 cache tests', () => {
	let s3Client;

	beforeEach(() => {
		s3Client = new S3Client({ region: 'us-east-1' });
		S3Client.prototype.send.mockReset();
	});

	it('should return cached dashboard data from S3', async () => {
		const mockCache = {
			colors: { roja: 2, azul: 1 },
			dates: [{ date: '2024-06', value: 2 }],
			ai: [{ date: '01-06-24', value: 3 }]
		};
		S3Client.prototype.send.mockResolvedValue({
			Body: {
				transformToString: async () => JSON.stringify(mockCache)
			}
		});

		const result = await DashboardHandler(null, null, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(200);
		expect(body.colors.roja).toBe(2);
		expect(body.dates.length).toBe(1);
		expect(body.ai[0].value).toBe(3);
	});

	it('should return 500 if S3 read fails', async () => {
		S3Client.prototype.send.mockRejectedValue(new Error('S3 error!'));

		const result = await DashboardHandler(null, null, s3Client);
		const body = JSON.parse(result.body);

		expect(result.statusCode).toBe(500);
		expect(body.message).toMatch(/Error reading from cache/);
		expect(body.error).toMatch(/S3 error/);
	});
});