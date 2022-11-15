const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });

const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const UPL_IMAGE = 1;
const UPL_TEST = 2;

exports.handler = async (event, context) => {
	let body;
	let statusCode = 200;
	let totalItems = 0; //will store the x-total-count for the /items
	let addMode = true;

	console.log("Event: ", event);

	console.log("Route: ", event.routeKey);

	const headers = {
		"Content-Type": "application/json",
		"x-total-count": totalItems
	};

	//This is the URL where the images are hosted. In this case is a CF distribution
	const CDN_IMAGES = process.env.CDN_IMAGES;

	try {
		switch (event.routeKey) {
			////////////////////////////////////////////////////
			case "POST /upload":
				const uploadImage = event.body;
				//console.log("Upload: BODY:", body);

				const uploadedPicture = await UploadImage(event, uploadImage);

				if (uploadedPicture.Status == "OK") {
					console.log("uploaded", uploadedPicture);

					statusCode = 200;
					body = { status: "Uploaded " + uploadedPicture.Key };
				} else {
					statusCode = 500;
					body = { status: "Error uploading the image" };
				}
				break;
			////////////////////////////////////////////////////
			case "DELETE /items/{id}":

				//TODO Delete the images from S3?
				await dynamo
					.delete({
						TableName: "argenpills",
						Key: {
							id: event.pathParameters.id
						}
					})
					.promise();
				body = `Deleted item ${event.pathParameters.id}`;

				break;

			//////////////////////////////////////////////////////
			case "GET /items/{id}":
				body = await dynamo
					.get({
						TableName: "argenpills",
						Key: {
							id: event.pathParameters.id
						}
					})
					.promise();

				var pill = body.Item;

				if (pill) {
					if (pill.image)
						pill.image = CDN_IMAGES + pill.image;

					if (pill.lab_image)
						pill.lab_image = CDN_IMAGES + pill.lab_image;
				}

				body = pill;
				break;
			//////////////////////////////////////////////////////        
			case "GET /items":

				/*
			    
		  QueryParam = {
			   TableName: 'YOUR TABLE NAME HERE',
			   IndexName: 'YOUR INDEX NAME HERE', //IF YOUR CREATED NEW INDEX
			   KeyConditionExpression: "UserId = :UserId  ", //YOUR PRIMARY KEY
			   ExpressionAttributeValues: {
				  ":UserId": UserId,
			   },
			   ScanIndexForward: false, //DESC ORDER, Set 'true' if u want asc order 
			   ExclusiveStartKey: LastEvalVal, //Pagination - LastEvaluatedKeyPair
			   Limit: 10 //DataPerReq
			}        
			    
				*/

				body = await dynamo.query({
					TableName: "argenpills",
					IndexName: "published-posted_date-index",
					KeyConditionExpression: "published = :published",
					ExpressionAttributeValues: {
						":published": 'x'
					},
					ScanIndexForward: false
				}).promise();

				//set the total items
				headers["X-Total-Count"] = body.Count;

				//Prefix the items URL with the CDN, just to make it simpler to display
				body = body.Items.map(row => {
					if (row.image)
						row.image = CDN_IMAGES + row.image;

					if (row.lab_image)
						row.lab_image = CDN_IMAGES + row.lab_image;

					return row;
				});

				break;
			//////////////////////////////////////////////////////        
			case "GET /search":

				const queryParams = event.queryStringParameters;

				if (queryParams == null) {
					statusCode = 403;
					body = "Missing parameter";
				}
				else {
					const search = queryParams.s;

					if (search == null) {
						statusCode = 403;
						body = "Missing parameter";
					}
					else {
						console.log("Search: ", search);
						/*
						  body = await dynamo.scan({ 
							TableName: "argenpills",
							IndexName: "published-posted_date-index",
							FilterExpression: "( contains(#n, :c) or contains(color, :c) ) and published = :published", 
							ExpressionAttributeValues: {
							  ":published": 'x',
							  ":c" : search
							},
							ExpressionAttributeNames: {
							  "#n": 'name'
							}
							}).promise();
						    
							*/

						body = await dynamo.scan({
							TableName: "argenpills",
							IndexName: "published-posted_date-index",
							FilterExpression: "contains(search_value, :c) and published = :published",
							ExpressionAttributeValues: {
								":published": 'x',
								":c": search.toLowerCase()
							},
						}).promise();

						//set the total items
						headers["X-Total-Count"] = body.Count;

						//Prefix the items URL with the CDN, just to make it simpler to display
						body = body.Items.map(row => {
							if (row.image)
								row.image = CDN_IMAGES + row.image;

							if (row.lab_image)
								row.lab_image = CDN_IMAGES + row.lab_image;

							return row;
						});

					}
				}
				break;
			//////////////////////////////////////////////////////           
			case "PUT /items/{id}":
				addMode = false;
			case "POST /items":
				var id;
				console.log("Parameters: ", event.pathParameters);

				if (addMode && event.pathParameters == null)
					id = AWS.util.uuid.v4();   //generate guid
				else
					id = event.pathParameters.id;

				let requestJSON = JSON.parse(event.body);

				//console.log("Parsed JSON", requestJSON);

				const uploadedImageKey = await ProcessUploads(event, requestJSON.upl_image, UPL_IMAGE);
				const uploadedLabKey = await ProcessUploads(event, requestJSON.upl_lab, UPL_TEST);

				if (uploadedImageKey != null)
					requestJSON.image = "/" + uploadedImageKey;

				if (uploadedLabKey != null)
					requestJSON.lab_image = "/" + uploadedLabKey;


				await dynamo
					.put({
						TableName: "argenpills",
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
					})
					.promise();

				console.log(`Item ${id} added or updated`);

				body = await dynamo
					.get({
						TableName: "argenpills",
						Key: {
							id: id
						}
					})
					.promise();

				body = body.Item;

				break;

			default:
				throw new Error(`Unsupported route: "${event.routeKey}"`);
		}
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
};

const ProcessUploads = async function (event, picturesObject, type) {

	if (picturesObject == null) return null;  //no images uploads

	let prefix = "pills";
	if (type == UPL_TEST) prefix = "tests";

	const uploadedResults = await UploadImage(event, picturesObject, prefix);

	console.log("uploadedresults", uploadedResults);

	return uploadedResults.Key;
};


const UploadImage = async function (event, imageToUpload, prefix) {
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

		let s3Response = await s3.upload(params).promise();
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
};
