const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

const multiPartParser = require('./multipart-form-parser');
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const UPL_IMAGE = 1;
const UPL_TEST = 2;

//https://livefiredev.com/aws-lambda-how-to-access-post-parameters-nodejs/

// This method is both to create and update
exports.updateItem = async (id, event, dynamoDBClient, s3Client) => {
	let statusCode = 200;

	const headers = {
		"Content-Type": "application/json"
	};

	let body;
	let parsedFields;

	if (event.isBase64Encoded)
		parsedFields = multiPartParser.parse(event);
	else
		parsedFields = JSON.parse(event.body);

	const AP_TABLE = process.env.AP_TABLE;
	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	const uploadedImageKey = await ProcessUploads(s3Client, parsedFields.upl_image, UPL_IMAGE);
	const uploadedLabKey = await ProcessUploads(s3Client, parsedFields.upl_lab, UPL_TEST);

	if (uploadedImageKey != null)
		parsedFields.image = "/" + uploadedImageKey;

	if (uploadedLabKey != null)
		parsedFields.lab_image = "/" + uploadedLabKey;

	const itemToSave = {
		id: id,
		name: parsedFields.name,
		color: parsedFields.color,
		posted_date: parsedFields.posted_date,
		image: parsedFields.image,
		load: parsedFields.load,
		substance: parsedFields.substance,
		warning: parsedFields.warning,
		notes: parsedFields.notes,
		ap_url: parsedFields.ap_url,
		lab_url: parsedFields.lab_url,
		lab_image: parsedFields.lab_image,
		search_value: parsedFields.name.toLowerCase() + " " + parsedFields.color.toLowerCase(),
		multiple_batchs: parsedFields.multiple_batchs,
		published: 'x'
	};

	const putCommand = new PutItemCommand({
		TableName: AP_TABLE,
		Item: marshall(itemToSave, { removeUndefinedValues: true })
	});

	try {
		//update
		await dynamoDBClient.send(putCommand);

		console.log("Item updated in DynamoDb");

		//re-read the information
		const getCommand = new GetItemCommand({
			TableName: AP_TABLE,
			Key: {
				id: { S: id }
			}
		});

		const getResult = await dynamoDBClient.send(getCommand);

		body = unmarshall(getResult.Item);

		if (body.image)
			body.image = CDN_IMAGES + body.image;

		if (body.lab_image)
			body.lab_image = CDN_IMAGES + body.lab_image;

	} catch (err) {
		statusCode = 400;
		body = err.message;
	} finally {
		body = JSON.stringify(body);
	}

	return {
		statusCode,
		body,
		headers
	};
}

const ProcessUploads = async function (s3Client, picturesObject, type) {

	if (picturesObject == null) return null;  //no images uploads

	let prefix = "pills";
	if (type == UPL_TEST) prefix = "tests";

	const uploadedResults = await UploadImage(s3Client, picturesObject, prefix);

	return uploadedResults.Key;
};


const UploadImage = async function (s3Client, imageToUpload, prefix) {
	const randomID = parseInt(Math.random() * 10000000);
	const Key = `${prefix}/${randomID}.jpg`;

	console.log("Key:", Key);

	const bucket = process.env.S3_BUCKET;

	//The key already has the "/" before the path
	const fullBucketPath = "s3://" + bucket + "/" + Key;

	console.log("Upload full bucket path:", fullBucketPath);

	try {
		let binaryFile = fs.readFileSync(imageToUpload.path);

		let uploadParams =
		{
			Bucket: bucket,
			Key: Key,
			Body: binaryFile,
			ContentType: imageToUpload.contentType
		};

		let s3Response = await s3Client.send(new PutObjectCommand(uploadParams));

		// request successed
		console.log(`File uploaded to S3 at ${bucket} bucket. File location: ${fullBucketPath}`);

		//We return the key (so we can use the CDN to serve the images)
		return { Status: "OK", Key: Key };
	}
	// request failed
	catch (ex) {
		console.error(ex);
		return { Status: "ERROR" };
	}
}