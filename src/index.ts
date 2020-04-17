let metadataUri = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration";
let clientId = "4a1aa1d5-c567-49d0-ad0b-cd957a47f842";
let clientSecret = "not-used";
let scopes = ["user.read"];

import { Issuer } from 'openid-client';

async function getAccessToken() {
  let issuer = await Issuer.discover(metadataUri);

  // Azure AD does not respond with the device auth endpoint in the discovery metadata!
  // We must instead compute it from the token endpoint - this is what MSAL does...
  let deviceEndpoint = issuer.metadata.token_endpoint.replace("token", "devicecode");
  issuer["device_authorization_endpoint"] = deviceEndpoint;

  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret
  });

  const handle = await client.deviceAuthorization({
    scope: scopes.join(' ')
  });
  console.log('Verification URI: ', handle.verification_uri);
  console.log('User code: ', handle.user_code);

  let tokenSet = await handle.poll();

  return tokenSet.access_token;
};

getAccessToken().then(token => {
  //console.log('Token: %s', token);
  console.log('Token length: %d', token.length);
}).catch(reason => {
  console.log("Failed: %s", reason)
});
