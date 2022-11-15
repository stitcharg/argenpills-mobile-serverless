const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION })

const cognito = new AWS.CognitoIdentityServiceProvider();

const CLIENT_ID = process.env.CLIENT_ID;
const POOL_ID = process.env.POOL_ID;

exports.handler = async (event, context) => {

	const bodyParams = JSON.parse(event.body);

	const username = bodyParams.username;
	const password = bodyParams.password;

	const params = {
		AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
		UserPoolId: POOL_ID,
		ClientId: CLIENT_ID,
		AuthParameters: {
			USERNAME: username,
			PASSWORD: password
		}
	};

	const response = {
		statusCode: 0,
		body: ""
	};

	try {
		const cognitoResponse = await cognito.adminInitiateAuth(params).promise();

		response.statusCode = 200;
		response.body = JSON.stringify({
			token: cognitoResponse.AuthenticationResult.IdToken
		});
	} catch {
		response.statusCode = 401;
		response.body = "Invalid username / password";
	}

	return response;
};
