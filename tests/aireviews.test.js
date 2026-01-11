// tests/aireviews.test.js
const { Testeablehandler: AIReviewsHandler } = require('../argenpills-crud/src/aireviews/aireviews');
const { Testeablehandler: PostForumHandler } = require('../argenpills-crud/src/aireviews/postforum');
const { SSMClient } = require("@aws-sdk/client-ssm");

jest.mock("@aws-sdk/client-ssm");

describe('AI Reviews Handlers', () => {
	let mockedSSM;
	let originalFetch;

	beforeEach(() => {
		SSMClient.prototype.send.mockReset();
		mockedSSM = new SSMClient({ region: 'us-east-1' });

		// Mock global fetch
		originalFetch = global.fetch;
		global.fetch = jest.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe('aireviews.js handler', () => {
		it('should fetch reviews successfully', async () => {
			const event = {
				queryStringParameters: {
					date: '2023-10-27',
					posted: 'true'
				}
			};

			SSMClient.prototype.send.mockImplementation((command) => {
				if (command.constructor.name === 'GetParameterCommand') {
					if (command.input.Name === '/argenpills/prod/aireviews/reviews_endpoint') {
						return Promise.resolve({ Parameter: { Value: 'https://api.example.com' } });
					}
					if (command.input.Name === '/argenpills/prod/aireviews/reviews_token') {
						return Promise.resolve({ Parameter: { Value: 'test-token' } });
					}
				}
				return Promise.reject(new Error("Unrecognized command"));
			});

			global.fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([{ id: 1, title: 'Review 1' }])
			});

			const result = await AIReviewsHandler(event, null, mockedSSM);

			expect(result.statusCode).toBe(200);
			const body = JSON.parse(result.body);
			expect(body.data.length).toBe(1);
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.example.com/list?date=2023-10-27&posted=true',
				expect.objectContaining({
					headers: {
						'x-api-secret-token': 'test-token'
					}
				})
			);
		});

		it('should handle API errors', async () => {
			const event = {};

			SSMClient.prototype.send.mockResolvedValue({ Parameter: { Value: 'val' } });
			global.fetch.mockResolvedValue({
				ok: false,
				status: 500
			});

			const result = await AIReviewsHandler(event, null, mockedSSM);

			expect(result.statusCode).toBe(500);
			const body = JSON.parse(result.body);
			expect(body.message).toContain('API responded with status: 500');
		});
	});

	describe('postforum.js handler', () => {
		it('should post review to forum successfully', async () => {
			const event = {
				body: JSON.stringify({
					photoId: '12345'
				})
			};

			SSMClient.prototype.send.mockImplementation((command) => {
				const name = command.input.Name;
				if (name === '/argenpills/prod/aireviews/reviews_endpoint') {
					return Promise.resolve({ Parameter: { Value: 'https://api.example.com' } });
				}
				if (name === '/argenpills/prod/aireviews/reviews_token') {
					return Promise.resolve({ Parameter: { Value: 'test-token' } });
				}
			});

			global.fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			const result = await PostForumHandler(event, null, mockedSSM);

			expect(result.statusCode).toBe(200);
			const body = JSON.parse(result.body);
			expect(body.data.success).toBe(true);
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.example.com/postreviewtoforum',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'x-api-secret-token': 'test-token'
					}),
					body: JSON.stringify({ photoId: '12345' })
				})
			);
		});

		it('should handle SSM errors', async () => {
			const event = { queryStringParameters: { photoId: '123' } };

			SSMClient.prototype.send.mockRejectedValue(new Error('SSM error'));

			const result = await PostForumHandler(event, null, mockedSSM);

			expect(result.statusCode).toBe(500);
			const body = JSON.parse(result.body);
			expect(body.message).toBe('SSM error');
		});
	});
});
