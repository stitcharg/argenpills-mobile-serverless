const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
AWS.config.update({ region: process.env.AWS_REGION });

const handlerWithDependencies = async (event, context, s3Client) => {
    let body;
    const headers = {
        "Content-Type": "application/json",
    };

    const uploadImage = event.body;
    //console.log("Upload: BODY:", body);

    const uploadedPicture = await UploadImage(event, uploadImage, s3Client);

    if (uploadedPicture.Status == "OK") {
        console.log("uploaded", uploadedPicture);

        statusCode = 200;
        body = { status: "Uploaded " + uploadedPicture.Key };
    } else {
        statusCode = 500;
        body = { status: "Error uploading the image" };
    }

    return {
        statusCode,
        body,
        headers
    };
};

const UploadImage = async function (event, imageToUpload, prefix, s3Client) {
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

        let uploadParams =
        {
            Bucket: bucket,
            Key: Key,
            Body: binaryFile,
            ContentType: 'image/jpg'
        };

        // Upload file to S3
        const run = async () => {
            try {
                const data = await s3Client.send(new PutObjectCommand(uploadParams));
                console.log(`File uploaded to S3 at ${s3Response.Bucket} bucket. File location: ${s3Response.Location}`);
            } catch (err) {
                console.error("Error uploading to S3:", err);
            }
        };

        run();
        //We return the key (so we can use the CDN to serve the images)
        return { Status: "OK", Key: Key };
    }
    // request failed
    catch (ex) {
        console.error(ex);
        return { Status: `ERROR: ${ex}` };
    }
};

exports.handler = async (event, context) => {
    const s3Client = new S3Client({ region: REGION });

    return handlerWithDependencies(event, context, s3Client);
};

exports.handlerWithDependencies = handlerWithDependencies;