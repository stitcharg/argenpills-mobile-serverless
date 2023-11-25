import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const configImagesDomain = config.require("images");
const configAPIHost = config.require("api");

const sandboxImageCertificate = new aws.acm.Certificate("certificate-images-sandbox", {
    domainName: configImagesDomain,
    validationMethod: "DNS",
});

const sandboxApiCertificate = new aws.acm.Certificate("certificate-api-sandbox", {
    domainName: configAPIHost,
    validationMethod: "DNS",
});

export const certificateAPI = sandboxApiCertificate;
export const certificate = sandboxImageCertificate;