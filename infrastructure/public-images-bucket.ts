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
		defaultCacheBehavior: {
			targetOriginId: bucket!.id,
			viewerProtocolPolicy: "redirect-to-https",
			allowedMethods: ["GET", "HEAD"],
			cachedMethods: ["GET", "HEAD"],
			forwardedValues: {
				queryString: false,
				cookies: {
					forward: "none",
				},
			},
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

// Create an S3 bucket policy to allow CloudFront to access the bucket
// For DEV: Uses OAC (Origin Access Control) - modern approach
// For PROD: Uses legacy OAI (Origin Access Identity) - needs manual migration
const bucketPolicy = new aws.s3.BucketPolicy("policy-bucket-images", {
	bucket: bucket!.id,
	policy: pulumi.all([bucket!.arn, cdn.arn]).apply(([bucketArn, distributionArn]) => {
		const statements: any[] = [
			{
				Sid: "AllowCloudFrontServicePrincipal",
				Effect: "Allow",
				Principal: {
					Service: "cloudfront.amazonaws.com"
				},
				Action: "s3:GetObject",
				Resource: `${bucketArn}/*`,
				Condition: {
					StringEquals: {
						"AWS:SourceArn": distributionArn
					}
				}
			}
		];

		// For PROD: Also allow legacy OAI (Origin Access Identity) since distribution uses it
		// Note: The OAI ARN format uses "cloudfront" as a special account identifier (not a real account ID)
		if (stack === ENV_PROD) {
			statements.push({
				Sid: "AllowLegacyOAI",
				Effect: "Allow",
				Principal: {
					AWS: "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3H3PSP24PXR5Q"
				},
				Action: "s3:GetObject",
				Resource: `${bucketArn}/*`
			});
		}

		return JSON.stringify({
			Version: "2012-10-17",
			Statement: statements
		});
	}),
}, { dependsOn: [bucket!, originAccessControl, cdn] });


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