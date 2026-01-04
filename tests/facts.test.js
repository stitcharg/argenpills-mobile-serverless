// Mock the AWS modules with virtual: true so Jest doesn't try to resolve them from disk.
// This is necessary because the source files require these modules, but they are not present
// in the test directory's node_modules resolution path in this specific project structure.

const mockSend = jest.fn();
const mockFrom = jest.fn().mockReturnValue({ send: mockSend });

// Mock @aws-sdk/client-dynamodb
jest.mock("@aws-sdk/client-dynamodb", () => {
	return {
		DynamoDBClient: jest.fn()
	};
}, { virtual: true });

// Mock @aws-sdk/lib-dynamodb
jest.mock("@aws-sdk/lib-dynamodb", () => {
	return {
		DynamoDBDocumentClient: {
			from: mockFrom
		},
		PutCommand: jest.fn().mockImplementation((params) => ({ input: params })),
		GetCommand: jest.fn().mockImplementation((params) => ({ input: params })),
		UpdateCommand: jest.fn().mockImplementation((params) => ({ input: params })),
		ScanCommand: jest.fn().mockImplementation((params) => ({ input: params })),
		DeleteCommand: jest.fn().mockImplementation((params) => ({ input: params }))
	};
}, { virtual: true });

const addFactHandler = require('../argenpills-crud/src/facts/addfact.js');
const editFactHandler = require('../argenpills-crud/src/facts/editfact.js');
const listFactsHandler = require('../argenpills-crud/src/facts/listfacts.js');
const getFactHandler = require('../argenpills-crud/src/facts/getfact.js');
const deleteFactHandler = require('../argenpills-crud/src/facts/deletefact.js');

describe('Facts Handlers', () => {
	let dynamoClientMock;

	beforeEach(() => {
		process.env.TABLE_NAME = 'test-table';

		// Reset mocks before each test
		mockSend.mockReset();
		mockFrom.mockClear();

		// Ensure mockFrom returns our client with the mockSend
		mockFrom.mockReturnValue({ send: mockSend });

		// This object is what is passed to the handler as 'dynamoDBClient'
		dynamoClientMock = {};
	});

	describe('addfact Testeablehandler', () => {
		it('should add a new fact successfully', async () => {
			const event = {
				body: JSON.stringify({
					text: 'This is a test fact',
					used: 1
				})
			};
			const context = {};

			// Mock successful put (returns empty object typically)
			mockSend.mockResolvedValueOnce({});

			const response = await addFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Item added successfully");
			expect(responseBody.item.text).toBe('This is a test fact');
			expect(responseBody.item.used).toBe(1);
			expect(responseBody.item.Id).toBeDefined();

			// Verify DynamoDB call
			expect(mockFrom).toHaveBeenCalledWith(dynamoClientMock);
			expect(mockSend).toHaveBeenCalled();

			// Check the command that was sent
			const putCommandCall = mockSend.mock.calls[0][0];
			expect(putCommandCall.input.TableName).toBe('test-table');
			expect(putCommandCall.input.Item.text).toBe('This is a test fact');
		});

		it('should use default Used value if not provided', async () => {
			const event = {
				body: JSON.stringify({
					text: 'Fact without used'
				})
			};
			const context = {};

			mockSend.mockResolvedValueOnce({});

			const response = await addFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.item.used).toBe(0);
		});

		it('should handle DynamoDB errors gracefully', async () => {
			const event = {
				body: JSON.stringify({
					text: 'Error fact'
				})
			};
			const context = {};

			mockSend.mockRejectedValueOnce(new Error('DB Error'));

			const response = await addFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(500);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Failed to add item");
			expect(responseBody.error).toBe("DB Error");
		});
	});

	describe('editfact Testeablehandler', () => {
		const factId = 'test-id-123';

		it('should update an existing fact successfully', async () => {
			const event = {
				pathParameters: { id: factId },
				body: JSON.stringify({
					text: 'Updated fact text',
					used: 5
				})
			};
			const context = {};

			// Mock GetCommand response (item exists)
			mockSend.mockResolvedValueOnce({
				Item: { Id: factId, text: 'Old text', used: 0 }
			});

			// Mock UpdateCommand response
			mockSend.mockResolvedValueOnce({
				Attributes: { Id: factId, text: 'Updated fact text', used: 5 }
			});

			const response = await editFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Item updated successfully");
			expect(responseBody.item.text).toBe('Updated fact text');
			expect(responseBody.item.used).toBe(5);

			expect(mockSend).toHaveBeenCalledTimes(2);
		});

		it('should return 404 if item does not exist', async () => {
			const event = {
				pathParameters: { id: factId },
				body: JSON.stringify({
					text: 'Updated fact text'
				})
			};
			const context = {};

			// Mock GetCommand response (item missing)
			mockSend.mockResolvedValueOnce({
				Item: undefined
			});

			const response = await editFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(404);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Item not found");
		});

		it('should only update provided fields', async () => {
			const event = {
				pathParameters: { id: factId },
				body: JSON.stringify({
					used: 10
				})
			};
			const context = {};

			// Mock GetCommand response
			mockSend.mockResolvedValueOnce({
				Item: { Id: factId, text: 'Original', used: 1 }
			});

			// Mock UpdateCommand response
			mockSend.mockResolvedValueOnce({
				Attributes: { Id: factId, text: 'Original', used: 10 }
			});

			await editFactHandler.Testeablehandler(event, context, dynamoClientMock);

			// Check UpdateCommand params
			const updateCall = mockSend.mock.calls[1][0];
			const updateParams = updateCall.input;

			expect(updateParams.UpdateExpression).toContain('#used = :used');
			expect(updateParams.UpdateExpression).not.toContain('#text = :text');
			expect(updateParams.ExpressionAttributeValues[':used']).toBe(10);
			expect(updateParams.ExpressionAttributeValues[':text']).toBeUndefined();
		});

		it('should handle DynamoDB errors during get', async () => {
			const event = {
				pathParameters: { id: factId },
				body: JSON.stringify({})
			};
			const context = {};

			mockSend.mockRejectedValueOnce(new Error('Get Error'));

			const response = await editFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(500);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Failed to update item");
		});
	});

	describe('listfacts Testeablehandler', () => {
		it('should return list of facts successfully', async () => {
			const event = {};
			const context = {};

			const mockItems = [
				{ Id: '1', text: 'Fact 1', used: 0 },
				{ Id: '2', text: 'Fact 2', used: 5 }
			];

			// Mock ScanCommand response
			mockSend.mockResolvedValueOnce({
				Items: mockItems
			});

			const response = await listFactsHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(Array.isArray(responseBody)).toBe(true);
			expect(responseBody.length).toBe(2);
			expect(responseBody[0].text).toBe('Fact 1');

			// Verify ScanCommand was used
			expect(mockSend).toHaveBeenCalled();
			const scanCall = mockSend.mock.calls[0][0];
			expect(scanCall.input.TableName).toBe('test-table');
		});

		// ... existing listfacts error test matches

		it('should handle DynamoDB errors gracefully', async () => {
			const event = {};
			const context = {};

			mockSend.mockRejectedValueOnce(new Error('Scan Error'));

			const response = await listFactsHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(500);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Failed to list facts");
			expect(responseBody.error).toBe("Scan Error");
		});
	});

	describe('getfact Testeablehandler', () => {
		it('should return a fact successfully', async () => {
			const factId = 'fact-1';
			const event = {
				pathParameters: { id: factId }
			};
			const context = {};
			const mockItem = { Id: factId, text: 'Fact 1', used: 0 };

			// Mock GetCommand response
			mockSend.mockResolvedValueOnce({
				Item: mockItem
			});

			const response = await getFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.Id).toBe(factId);
			expect(responseBody.text).toBe('Fact 1');

			// Verify GetCommand was used
			expect(mockSend).toHaveBeenCalled();
			const getCall = mockSend.mock.calls[0][0];
			expect(getCall.input.TableName).toBe('test-table');
			expect(getCall.input.Key.Id).toBe(factId);
		});

		// ... existing getfact tests ...
		it('should return 404 if fact not found', async () => {
			const factId = 'fact-missing';
			const event = {
				pathParameters: { id: factId }
			};
			const context = {};

			// Mock GetCommand response with no item
			mockSend.mockResolvedValueOnce({
				Item: undefined
			});

			const response = await getFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(404);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Fact not found");
		});

		it('should return 400 if id missing', async () => {
			const event = {
				pathParameters: {}
			};
			const context = {};

			const response = await getFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(400);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toContain("Missing 'id'");
		});

		it('should handle DynamoDB errors gracefully', async () => {
			const factId = 'fact-error';
			const event = {
				pathParameters: { id: factId }
			};
			const context = {};

			mockSend.mockRejectedValueOnce(new Error('Get Error'));

			const response = await getFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(500);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Failed to get fact");
		});
	});

	describe('deletefact Testeablehandler', () => {
		it('should delete a fact successfully', async () => {
			const factId = 'fact-1';
			const event = {
				pathParameters: { id: factId }
			};
			const context = {};

			// Mock DeleteCommand response
			mockSend.mockResolvedValueOnce({});

			const response = await deleteFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(200);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Fact deleted successfully");

			// Verify DeleteCommand was used
			expect(mockSend).toHaveBeenCalled();
			const deleteCall = mockSend.mock.calls[0][0];
			expect(deleteCall.input.TableName).toBe('test-table');
			expect(deleteCall.input.Key.Id).toBe(factId);
		});

		// ... existing deletefact tests ...
		it('should return 400 if id missing', async () => {
			const event = {
				pathParameters: {}
			};
			const context = {};

			const response = await deleteFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(400);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toContain("Missing 'id'");
		});

		it('should handle DynamoDB errors gracefully', async () => {
			const factId = 'fact-error';
			const event = {
				pathParameters: { id: factId }
			};
			const context = {};

			mockSend.mockRejectedValueOnce(new Error('Delete Error'));

			const response = await deleteFactHandler.Testeablehandler(event, context, dynamoClientMock);

			expect(response.statusCode).toBe(500);
			const responseBody = JSON.parse(response.body);
			expect(responseBody.message).toBe("Failed to delete fact");
		});
	});
});
