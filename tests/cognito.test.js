const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, InitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');
const { Testeablehandler: AuthenticateHandler } = require('../argenpills-auth/src/auth/auth');
const { Testeablehandler: RefreshTokenHandler } = require('../argenpills-auth/src/refreshtoken/refreshtoken');

const { mockCognitoData } = require('./mockCognitoData');

require('dotenv').config()

jest.mock('@aws-sdk/client-cognito-identity-provider');

const mockedCognitoIdentityClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

describe("Should authenticate in cognito", () => {

  beforeAll(async () => {
  });

  afterAll(async () => {
  });

  it("should authenticate", async () => {

    const event = {
      body: JSON.stringify({
        username: "Test",
        password: "12345"
      }
      )
    }

    CognitoIdentityProviderClient.prototype.send = jest.fn().mockResolvedValue(mockCognitoData);

    const result = await AuthenticateHandler(event, null, mockedCognitoIdentityClient);

    expect(result.statusCode).toBe(200);

    const parsedBody = JSON.parse(result.body);

    expect(parsedBody.token).toBeDefined();
    expect(parsedBody.refreshToken).toBeDefined();

  });

  it("should refresh token", async () => {

    const event = {
      body: JSON.stringify(
        {
          refreshToken: "eyJjdHkiOiJKV1QiLC..."
        }
      )
    }

    CognitoIdentityProviderClient.prototype.send = jest.fn().mockResolvedValue(mockCognitoData);

    const result = await RefreshTokenHandler(event, null, mockedCognitoIdentityClient);

    expect(result.statusCode).toBe(200);

    const parsedBody = JSON.parse(result.body);

    expect(parsedBody.token).toBeDefined();
  })

});