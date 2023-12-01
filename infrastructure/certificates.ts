import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ENV_DEV, ENV_PROD } from './consts'

const config = new pulumi.Config();
const configImagesDomain = config.require("images");
const configAPIHost = config.require("api");
const stack = pulumi.getStack();

let sandboxImageCertificate, sandboxApiCertificate;
const nameImages = "certificate-images-sandbox";
const nameApi = "certificate-api-sandbox";

if (stack === ENV_DEV) {
    sandboxImageCertificate = new aws.acm.Certificate(nameImages, {
        domainName: configImagesDomain,
        validationMethod: "DNS",
    });
} else {
    //arn:aws:acm:us-east-1:REDACTED:certificate/9a4c63c7-ba6a-460c-828a-2ac49192b88a
    sandboxImageCertificate = new aws.acm.Certificate("certificate-images-sandbox", {
        domainName: configImagesDomain,
        keyAlgorithm: "RSA_2048",
        options: {
            certificateTransparencyLoggingPreference: "ENABLED",
        },
        subjectAlternativeNames: [configImagesDomain],
        validationMethod: "DNS",
    }, {
        protect: true,
    });
}

if (stack === ENV_DEV) {
    sandboxApiCertificate = new aws.acm.Certificate(nameApi, {
        domainName: configAPIHost,
        validationMethod: "DNS",
    });    
} else {
    //arn:aws:acm:us-east-1:REDACTED:certificate/ec1e42b9-045b-494f-b45c-f7d740e6afc2
    sandboxApiCertificate = new aws.acm.Certificate("certificate-api-sandbox", {
        domainName: configAPIHost,
        keyAlgorithm: "RSA_2048",
        options: {
            certificateTransparencyLoggingPreference: "ENABLED",
        },
        subjectAlternativeNames: [configAPIHost],
        validationMethod: "DNS",
    }, {
        protect: true,
    });
}


export const certificateAPI = sandboxApiCertificate;
export const certificate = sandboxImageCertificate;