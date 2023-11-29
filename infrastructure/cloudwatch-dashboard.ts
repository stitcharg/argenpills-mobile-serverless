import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {
    lambdaFnGetItem,
    lambdaFnAuth,
    lambdafnAuthRefreshToken,
    lambdaFnGetItems,
    lambdaFnDeleteItem,
    lambdaFnSearch,
    lambdaFnDashboard,
    lambdaFnEdit,
    lambdaFnAdd
} from './lambdafunctions';

const dashboardName = "argenpills-crud-dashboard";
const awsRegion = aws.config.requireRegion(); 

pulumi.all([
    lambdaFnGetItems.name, 
    lambdaFnSearch.name,
    lambdaFnAuth.name,
    lambdafnAuthRefreshToken.name]).apply(([lambdaGetItems, lambdaSearch, lambdaAuth, lambdaAuthRefreshToken]) => {
    const dashboardBody = JSON.stringify({
        "widgets": [
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/Lambda", "Invocations", "FunctionName", lambdaGetItems],
                        ["AWS/Lambda", "Invocations", "FunctionName", lambdaSearch]
                    ],
                    "view": "timeSeries",
                    "stacked": false,
                    "region": awsRegion,
                    "stat": "Sum",
                    "period": 300,
                    "title": "Items"
                }
            }
            ,
            {
                "type": "metric",
                "x": 12,
                "y": 0,
                "width": 6,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/Lambda", "Invocations", "FunctionName", lambdaAuth],
                        ["AWS/Lambda", "Invocations", "FunctionName", lambdaAuthRefreshToken]
                    ],
                    "view": "timeSeries",
                    "stacked": false,
                    "region": awsRegion,
                    "stat": "Sum",
                    "period": 300,
                    "title": "Authentication"
                }
            }
        ]
    });

    const dashboard = new aws.cloudwatch.Dashboard(dashboardName, {
        dashboardName: dashboardName,
        dashboardBody: dashboardBody,
    });

    return dashboard.dashboardName;
})



export const dashboardUrlCRUD = pulumi.interpolate`https://${awsRegion}.console.aws.amazon.com/cloudwatch/home?region=${awsRegion}#dashboards:name=${dashboardName}`;