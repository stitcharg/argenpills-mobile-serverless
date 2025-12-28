import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { certificate } from "./certificates";
import { ENV_DEV, ENV_PROD } from './consts'

const config = new pulumi.Config();
const configImagesDomain = config.require("images");
const stack = pulumi.getStack();

let bucket: aws.s3.Bucket;
if (stack === ENV_DEV) {
	bucket = new aws.s3.Bucket("argenpills-public-images", {
		bucket: configImagesDomain,  // Explicit bucket name here
		acl: "private", // Make it private so only CloudFront can access it
		serverSideEncryptionConfiguration: {
			rule: {
				applyServerSideEncryptionByDefault: {
					sseAlgorithm: "AES256",
				},
			},
		},
		versioning: {
			enabled: true,
		},
	});
} else if (stack === ENV_PROD) {
	bucket = aws.s3.Bucket.get("argenpills-public-images", "images.argenpills.info", {
		bucket: "images.argenpills.info",
		corsRules: [{
			allowedHeaders: ["*"],
			allowedMethods: [
				"PUT",
				"POST",
				"DELETE",
			],
			allowedOrigins: ["*"],
		}],
		serverSideEncryptionConfiguration: {
			rule: {
				applyServerSideEncryptionByDefault: {
					sseAlgorithm: "AES256",
				},
			},
		},
		versioning: {
			enabled: true,
		},
	}, {
		protect: true,
		retainOnDelete: true,
	});
} else {
	console.error("Environment is not DEV or PROD");
}

// Create an Origin Access Control (OAC) - newer and more secure than OAI
// Note: We only create OAC, not the legacy OAI, since we're migrating to OAC
const originAccessControl = new aws.cloudfront.OriginAccessControl("argenpills-OAC", {
	originAccessControlOriginType: "s3",
	signingBehavior: "always",
	signingProtocol: "sigv4",
	description: "Origin Access Control para acceder las imagenes",
});

// Create an S3 bucket policy to allow CloudFront to access the bucket
const bucketPolicy = new aws.s3.BucketPolicy("policy-bucket-images", {
	bucket: bucket!.id,
	policy: bucket!.arn.apply(bucketArn => JSON.stringify({
		Version: "2012-10-17",
		Statement: [
			{
				Sid: "AllowCloudFrontServicePrincipal",
				Effect: "Allow",
				Principal: {
					Service: "cloudfront.amazonaws.com"
				},
				Action: "s3:GetObject",
				Resource: `${bucketArn}/*`
			},
			{
				Sid: "AllowLegacyOAI",
				Effect: "Allow",
				Principal: {
					AWS: "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3H3PSP24PXR5Q"
				},
				Action: "s3:GetObject",
				Resource: `${bucketArn}/*`
			}
		]
	})),
}, { dependsOn: [bucket!, originAccessControl] });

// Create a CloudFront distribution
const cdn = stack === ENV_DEV
	? new aws.cloudfront.Distribution("argenpills-images", {
		comment: "Argenpills Images Bucket CDN",
		enabled: true,
		origins: [
			{
				domainName: bucket!.bucketRegionalDomainName,
				originId: bucket!.id,
				originAccessControlId: originAccessControl.id,
			},
		],
		defaultRootObject: "index.html",
		defaultCacheBehavior: {
			targetOriginId: bucket!.id,
			allowedMethods: ["GET", "HEAD"],
			cachedMethods: ["GET", "HEAD"],
			forwardedValues: {
				queryString: false,
				cookies: {
					forward: "none",
				},
			},
			viewerProtocolPolicy: "allow-all",
		},
		restrictions: {
			geoRestriction: {
				restrictionType: "none",
			},
		},
		aliases: [
			configImagesDomain
		],
		isIpv6Enabled: true,
		priceClass: "PriceClass_100",
		viewerCertificate: {
			acmCertificateArn: certificate.arn,
			sslSupportMethod: "sni-only",
			minimumProtocolVersion: "TLSv1.2_2021"
		},
	})
	: aws.cloudfront.Distribution.get("argenpills-images", "E8L1CGEYQZFCQ", {});


// Cache bucket
const cache = new aws.s3.Bucket("argenpills-cache", {
	bucket: `argenpills-cache-${stack}`,
	serverSideEncryptionConfiguration: {
		rule: {
			applyServerSideEncryptionByDefault: {
				sseAlgorithm: "AES256",
			},
		},
	},
	versioning: {
		enabled: true,
	},
});



//Export the info
export const publicImagesBucket = bucket!;
export const imagesCDN = cdn;
export const cacheBucket = cache;