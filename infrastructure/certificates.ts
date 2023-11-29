import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ENV_DEV, ENV_PROD } from './consts'

const config = new pulumi.Config();
const configImagesDomain = config.require("images");
const configAPIHost = config.require("api");

let sandboxImageCertificate, sandboxApiCertificate;
const nameImages = "certificate-images-sandbox";
const nameApi = "certificate-api-sandbox";

if (ENV_DEV) {
    sandboxImageCertificate = new aws.acm.Certificate(nameImages, {
        domainName: configImagesDomain,
        validationMethod: "DNS",
    });
} else {
    sandboxImageCertificate = new aws.acm.Certificate(nameImages, {
        domainName: configImagesDomain,
        validationMethod: "DNS",
    }, { import: "arn:aws:acm:us-east-1:259724533417:certificate/9a4c63c7-ba6a-460c-828a-2ac49192b88a"});
}

if (ENV_DEV) {
    sandboxApiCertificate = new aws.acm.Certificate(nameApi, {
        domainName: configAPIHost,
        validationMethod: "DNS",
    });    
} else {
    sandboxApiCertificate = new aws.acm.Certificate(nameApi, {
        domainName: configAPIHost,
        validationMethod: "DNS",
    }, { import: "arn:aws:acm:us-east-1:259724533417:certificate/ec1e42b9-045b-494f-b45c-f7d740e6afc2"});    
}


export const certificateAPI = sandboxApiCertificate;
export const certificate = sandboxImageCertificate;