import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const sandboxImageCertificate = new aws.acm.Certificate("certificate-images-sandbox", {
    domainName: "images.sandbox.argenpills.info",
    validationMethod: "DNS",
});

const sandboxApiCertificate = new aws.acm.Certificate("certificate-api-sandbox", {
    domainName: "api.sandbox.argenpills.info",
    validationMethod: "DNS",
});

export const certificateAPI = sandboxApiCertificate;
export const certificate = sandboxImageCertificate;