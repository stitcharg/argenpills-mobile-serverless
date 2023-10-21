const { CognitoIdentityProviderClient, AdminInitiateAuthCommand, InitiateAuthCommand, AuthFlowType } = require('@aws-sdk/client-cognito-identity-provider');

require('dotenv').config()

describe("Real Calls To Cognito (temp)", () => {

  beforeAll(async () => {
  });

  afterAll(async () => {
  });

it("really call cognito", async() => {

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

      const refreshToken = async ({clientId, userPoolId, token}) => {
        const client = new CognitoIdentityProviderClient({region: "us-east-1"});
      
        const command = new InitiateAuthCommand({
          ClientId: clientId,
          UserPoolId: userPoolId,
          AuthFlow: AuthFlowType.REFRESH_TOKEN,
          AuthParameters: { REFRESH_TOKEN: token },
        });
      
        const results = await client.send(command);
        
        console.log(results);
        return results;
      }
      
      // const results = await adminInitiateAuth({
      //   clientId: "t8msd1mupt210ssci5361vj6l", 
      //   userPoolId: "us-east-1_GmJ0REblC", 
      //   username: "Test", 
      //   password: "1234ABcD!"
      // });

      //  const results = refreshToken({
      //     clientId: "t8msd1mupt210ssci5361vj6l", 
      //     userPoolId: "us-east-1_GmJ0REblC", 
      //     token: "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.jDmNMB-do8MCYJxpjQzlKBktrjBn9jbDqW5KrY5IjqO-sN1oMeUHPtb_trde94rnC053MRImUmsm40047oEetrmMsVkUH4kMy3df6KUANKDiZjbDTEdh7Q_r4siRcSyLfawAsb5-KLhrJ17m2o0G3CFG0n18Qz62qAuzojT6deBnUp6tTcwexvTtWzHJrdP60VODgeX6WULOWJly2XYPdFRWzCyI16PPZnjgwVvnMdAJ1mSUpql9KIcLjjHn2T_N9ZpJZCqHOmWEcEgE9h_jpgv_wvmMD_QymNLeZS4bcdqUt_w209RQAQgD47P9VJLjCR64zkEmxRvZ7Zk6rr8-ew.Yp-7NwNHGOCePHmh.pEd9bPYWaAZY4zisxEpED4AEBmKhrER9XHS4OvZrjE1z2ItlTvWkCzb6bCLx90Ut9noeMZCVem0aJD7zNP_6yrgJ74f2V8BZNo1ndrZm06uGgM1kM4P_z-clcCgMhbztIOMGu0SkhUmYtuUxeXZsaycbf6LPZEIRhsi6wQtH1YmDkB1hDhJI9Tu6RBkPBZtri5hyiqOQNy0JkYzO1ZK--ZybkMfDop9nvDhPpbEG140KCRJ7TBydjhjpnKvGZL40F4ozNJIXtUc65dVmH6k-HNx4wdl1GduIfEyQ1JIoAUrgE5iwTAI68ACqS1Bnw1NB-wihCkxyivdxPdlN9BiNnCkEcmDTxTi6aZ5sIVCXRWRMggJ4JztJgf7-gRjm8Wwo0pmKKK45Ns67MoReOHG9gj1wNP0KWQowKaMMsTshl-MNpQvskAt3fKc_bXtXzqljU4s7W9snuy5Q7xrOjSjSCxjEZEKUHap4Kn3K8hBEBx6z3N1oca7XSyHhikRlP6QZ4ySohxlD0R8sWzfJv1qva6_i3QU3qZ5OE_qcVSDyf6WOpri7dj_tDpvJ4SWhq6-5YPR2rUcfUCfe62udbXufaFS_JNggJMrZqnlpbt9P_QvldykaaVpsZmNrk_c6oo6dlZal6uBUW17vHTrcWG4sYOM8FqGuwY3tJO3comROw-tEH4zYlpw_o3MTwk3yqGwFdXMM0b7ylNAHlxwUhe4cRVoeSmiipyNwhGvhxf6NTMLNf2dEzsNSaWzVM4g0vLiAjxPsc_sjJZ8Yjagp9FTm9Vn8N45PUXk2iqet3LBCQEtkLldW49V3W8yw05d-CKH1G3icHuG4NnoIgmeu4xX_BzZqUYwp_pbXpkvXo37wyv27nyLiy7U2qdewBcObPGrckG8dZ8xF9_hOh1n2fcIv2_sSyikD6vNpnAJEu1kxAMbx7_aAOspg3vX8Scictoy3ZEK9m05J9gk0Sq_745gQfHpJgPkKH9x_CkREi60KbhkBK3rFvSkTxwBtSou3grJa64ritxNyF19Ct6KQdy9adJ5A7s6AAOlnehMcZqGHducMSHF9fnA82q_GsbLd_5YQU3vYd7eM0PiOwXqcYCKL5Vgxsmgwfv2YhIj02xmaiTHruOyqlhe8ytMUvUHrUxazy4ONcdmmD8lqdphNVDFe2dYm7XrgViA6wqx0K8BpZh9uzNMvGkV9u3qCM7pQgESUEbrMvMAFiBHDaXnoT2Qas27RiFsjynD4TXMO7l_kjmPVeXjbsuno8TJea42WlSQ.gTEym6jh2APumFZ_zxyMeA"
      //  })

      //console.log(results);
  
})

});