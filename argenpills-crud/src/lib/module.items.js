const { PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const UPL_IMAGE = 1;
const UPL_TEST = 2;

// This method is both to create and update
exports.updateItem = async (id, body, DynamoDBClient, s3Client) => {
	let statusCode = 200;

	const headers = {
		"Content-Type": "application/json"
	};

	console.log(body);
	let requestJSON = JSON.parse(body);
	const AP_TABLE = process.env.AP_TABLE;

	const uploadedImageKey = await ProcessUploads(s3Client, requestJSON.upl_image, UPL_IMAGE);
	const uploadedLabKey = await ProcessUploads(s3Client, requestJSON.upl_lab, UPL_TEST);

	if (uploadedImageKey != null)
		requestJSON.image = "/" + uploadedImageKey;

	if (uploadedLabKey != null)
		requestJSON.lab_image = "/" + uploadedLabKey;

	const putCommand = new PutItemCommand({
		TableName: AP_TABLE,
		Item: {
			id: id,
			name: requestJSON.name,
			color: requestJSON.color,
			posted_date: requestJSON.posted_date,
			image: requestJSON.image,
			load: requestJSON.load,
			substance: requestJSON.substance,
			warning: requestJSON.warning,
			notes: requestJSON.notes,
			ap_url: requestJSON.ap_url,
			lab_url: requestJSON.lab_url,
			lab_image: requestJSON.lab_image,
			search_value: requestJSON.name.toLowerCase() + " " + requestJSON.color.toLowerCase(),
			published: 'x',
			multiple_batchs: requestJSON.multiple_batchs
		}
	});

	try {
		//update
		const results = await DynamoDBClient.send(putCommand);

		//re-read the information
		const getCommand = new GetItemCommand({
			TableName: AP_TABLE,
			Key: {
				id: id
			}
		});

		const getResult = await DynamoDBClient.send(getCommand);
		body = getResult.Item;
	} catch (err) {
		statusCode = 400;
		body = err.message;
	} finally {
		console.log("BODY", body);

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

	console.log("uploadedresults", uploadedResults);

	return uploadedResults.Key;
};


const UploadImage = async function (s3Client, imageToUpload, prefix) {
	//console.log(`Parameters: ImagetoUpload ${imageToUpload} | event ${event}`);

	const randomID = parseInt(Math.random() * 10000000);
	const Key = `${prefix}/${randomID}.jpg`;

	console.log("Key:", Key);

	const bucket = process.env.S3_BUCKET;

	//The key already has the "/" before the path
	const fullBucketPath = "s3://" + bucket + "/" + Key;

	console.log("Upload full bucket path:", fullBucketPath);

	try {
		let binaryFile = new Buffer.from(imageToUpload, 'base64');

		let params =
		{
			Bucket: bucket,
			Key: Key,
			Body: binaryFile,
			ContentType: 'image/jpg'
		};

		let s3Response = await s3Client.upload(params).promise();
		// request successed

		console.log(`File uploaded to S3 at ${s3Response.Bucket} bucket. File location: ${s3Response.Location}`);

		//We return the key (so we can use the CDN to serve the images)
		return { Status: "OK", Key: Key };
	}
	// request failed
	catch (ex) {
		console.error(ex);
		return { Status: "ERROR" };
	}
}