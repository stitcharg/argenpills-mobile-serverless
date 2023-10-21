const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');

const CLIENT_ID = process.env.CLIENT_ID;
const POOL_ID = process.env.POOL_ID;

exports.Testeablehandler = async (event, context, cognitoClient) => {
	const bodyParams = JSON.parse(event.body);

	const username = bodyParams.username;
	const password = bodyParams.password;

	const params = {
		AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
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
		const command = new AdminInitiateAuthCommand(params);
		const cognitoResponse = await cognitoClient.send(command);

		response.statusCode = 200;
		response.body = JSON.stringify({
			token: cognitoResponse.AuthenticationResult.IdToken,
			refreshToken: cognitoResponse.AuthenticationResult.RefreshToken
		});
	} catch (err) {
		console.log("ERROR", err);
		response.statusCode = 401;
		response.body = "Invalid username / password";
	}

	return response;
};

exports.handler = async (event, context) => {
	const cognitoClient = new CognitoIdentityProviderClient({});

	return exports.Testeablehandler(event, context, cognitoClient);
}
