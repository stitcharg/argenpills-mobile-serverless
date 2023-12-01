import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { imagesCDN } from "./public-images-bucket";

const config = new pulumi.Config();
const configZoneDomain = config.require("zone");
const stack = pulumi.getStack();

const hostedZoneId = aws.route53.getZone({ name: `${configZoneDomain}.` }, { async: true }).then(zone => zone.zoneId);

// Create a DNS record for images.sandbox.domain.com to point to the CloudFront distribution
export const cdnRecord = hostedZoneId.then(zoneId => new aws.route53.Record("cdnRecord", {
    name: "images",
    zoneId: zoneId,
    type: "CNAME",
    records: [imagesCDN.domainName],
    ttl: 300,
}));

export function registerApiDomain(apiGatewayDomain:aws.apigatewayv2.DomainName) {
    
    const dnsRecord = new aws.route53.Record("apiRecord", {
        zoneId: hostedZoneId,
        name: "api",
        type: "A",
        aliases: [{
            name: apiGatewayDomain.domainNameConfiguration.apply(dnc => dnc.targetDomainName),
            zoneId: apiGatewayDomain.domainNameConfiguration.apply(dnc => dnc.hostedZoneId),
            evaluateTargetHealth: true,
        }],
    });
}