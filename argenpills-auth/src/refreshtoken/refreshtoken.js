const { CognitoIdentityProviderClient, InitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');

const CLIENT_ID = process.env.CLIENT_ID;
const POOL_ID = process.env.POOL_ID;

exports.Testeablehandler = async (event, context, cognitoClient) => {
  const parameters = JSON.parse(event.body);

  const { refreshToken } = parameters;

  const params = {
    AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
    ClientId: CLIENT_ID,
    UserPoolId: POOL_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };

  const response = {
    statusCode: 0,
    body: ""
  };

  try {
    const command = new InitiateAuthCommand(params);

    const cognitoResponse = await cognitoClient.send(command);

    response.statusCode = 200;
    response.body = JSON.stringify({
      token: cognitoResponse.AuthenticationResult.IdToken
    });

  } catch (err) {
    console.log("ERROR", err);
    response.statusCode = 401;
    response.body = JSON.stringify({ message: `Token refresh failed: ${err}` });
  }

  return response;
};

exports.handler = async (event, context) => {
  const cognitoClient = new CognitoIdentityProviderClient({});

  return exports.Testeablehandler(event, context, cognitoClient);
}
