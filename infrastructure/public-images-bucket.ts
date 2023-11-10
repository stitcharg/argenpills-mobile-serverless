import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { certificate } from "./certificates";

const bucket = new aws.s3.Bucket("argenpills-public-images", {
    bucket: "images.sanbox.argenpills.info",  // Explicit bucket name here
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

// Create an Origin Access Identity
const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity("argenpills-OAI", {
    comment: "Origin Access Identity para acceder las imagenes",
});

// Create an S3 bucket policy to allow CloudFront to access the bucket
const bucketPolicy = new aws.s3.BucketPolicy("policy-bucket-images", {
    bucket: bucket.id,
    policy: pulumi.all([bucket.arn, originAccessIdentity.iamArn]).apply(([bucketArn, oaiIamArn]) => JSON.stringify({
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
}, { dependsOn: [bucket] });

// Create a CloudFront distribution
const cdn = new aws.cloudfront.Distribution("argenpills-images", {
    comment: "Argenpills Images Bucket CDN",
    enabled: true,
    origins: [
        {
            domainName: bucket.bucketRegionalDomainName,
            originId: bucket.id,
            s3OriginConfig: {
                originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
            },
        },
    ],
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        targetOriginId: bucket.id,
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
        "images.sandbox.argenpills.info"
    ],
    isIpv6Enabled: true,
    priceClass: "PriceClass_100",
    viewerCertificate: {
        acmCertificateArn: certificate.arn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021"
    },
});

const hostedZoneId = aws.route53.getZone({ name: "sandbox.argenpills.info." }, { async: true }).then(zone => zone.zoneId);

// Create a DNS record for images.sandbox.domain.com to point to the CloudFront distribution
const cdnRecord = hostedZoneId.then(zoneId => new aws.route53.Record("cdnRecord", {
    name: "images",
    zoneId: zoneId,
    type: "CNAME",
    records: [cdn.domainName],
    ttl: 300,
}));

//Export the info
export const publicImagesBucket = bucket;
export const imagesCDN = cdn;