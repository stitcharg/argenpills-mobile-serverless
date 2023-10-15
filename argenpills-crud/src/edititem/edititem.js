const { updateItem } = require("../lib/module.items")

exports.Testeablehandler = async (event, context, dynamoDBClient, s3Client) => {
	const id = event.pathParameters.id;

	return updateItem(id, event.body, dynamoDBClient, s3Client)
}

exports.handler = async (event, context) => {
	const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
	const s3Client = new S3Client({});
	return Testeablehandler(event, context, dynamoDBClient, s3Client);
};