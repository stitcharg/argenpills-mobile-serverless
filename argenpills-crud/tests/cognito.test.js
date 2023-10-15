const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');


describe("Should authenticate in cognito", () => {

  beforeAll(async () => {
    // Setup code, if needed.
    // Populate the table with test data
  });

  afterAll(async () => {
    // Teardown code, if needed.
    // Cleanup the table
  });

  it("displays all tables", async() => {

    const adminInitiateAuth = ({ clientId, userPoolId, username, password }) => {
      console.log("clientId", clientId);
        const client = new CognitoIdentityProviderClient({});
      
        const command = new AdminInitiateAuthCommand({
          ClientId: clientId,
          UserPoolId: userPoolId,
          AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
          AuthParameters: { USERNAME: username, PASSWORD: password },
        });
      
        return client.send(command);
      };
      
      await adminInitiateAuth({
        clientId: "t8msd1mupt210ssci5361vj6l", 
        userPoolId: "us-east-1_GmJ0REblC", 
        username: "Test", 
        password: "1234ABcD!"
      });
});

});