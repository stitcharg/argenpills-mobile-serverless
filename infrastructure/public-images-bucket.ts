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
	bucket = new aws.s3.Bucket("argenpills-public-images", {
		arn: "arn:aws:s3:::images.argenpills.info",
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
		hostedZoneId: "Z3AQBSTGFYJSTF",
		requestPayer: "BucketOwner",
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
	});
} else {
	console.error("Environment is not DEV or PROD");
}

// Create an Origin Access Identity
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("argenpills-OAI", {
	comment: "Origin Access Identity para acceder las imagenes",
});

// Create an S3 bucket policy to allow CloudFront to access the bucket
const bucketPolicy = new aws.s3.BucketPolicy("policy-bucket-images", {
	bucket: bucket!.id,
	policy: pulumi.all([bucket!.arn, originAccessIdentity.iamArn]).apply(([bucketArn, oaiIamArn]) => JSON.stringify({
		Version: "2012-10-17",
		Statement: [
			{
				Sid: "PublicReadGetObject",
				Effect: "Allow",
				Principal: {
					"AWS": oaiIamArn,
				},
				Action: [
					"s3:GetObject"
				],
				Resource: [
					`${bucketArn}/*`
				]
			}
		]
	})),
}, { dependsOn: [bucket!] });

// Create a CloudFront distribution
const cdn = new aws.cloudfront.Distribution("argenpills-images", {
	comment: "Argenpills Images Bucket CDN",
	enabled: true,
	origins: [
		{
			domainName: bucket!.bucketRegionalDomainName,
			originId: bucket!.id,
			s3OriginConfig: {
				originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
			},
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
});


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