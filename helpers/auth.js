const jwt = require('jsonwebtoken');

const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
const oauth2 = require('simple-oauth2').create(credentials);

function getAuthUrl() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  return returnVal;
}

async function getTokenFromCode(auth_code, res) {
  var result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });

  var token = oauth2.accessToken.create(result);
  saveValuesToCookie(token, res);

  return token.token.access_token;
}

function saveValuesToCookie(token, res) {
  // Parse the identity token
  console.log("saveVtoC");
  var user = jwt.decode(token.token.id_token);
  // Save the access token in a cookie
  res.cookie('graph_access_token', token.token.access_token, {maxAge: 3600000, httpOnly: true});
  // Save the user's name in a cookie
  res.cookie('graph_user_name', user.name, {maxAge: 3600000, httpOnly: true});
  // Save the refresh token in a cookie
  res.cookie('graph_refresh_token', token.token.refresh_token, {maxAge: 7200000, httpOnly: true});
  // Save the token expiration tiem in a cookie
  res.cookie('graph_token_expires', token.token.expires_at.getTime(), {maxAge: 3600000, httpOnly: true});
}

function clearCookies(res) {
  // Clear cookies
  // res.clearCookie('graph_access_token', {maxAge: 3600000, httpOnly: true});
  // res.clearCookie('graph_user_name', {maxAge: 3600000, httpOnly: true});
  // res.clearCookie('graph_refresh_token', {maxAge: 7200000, httpOnly: true});
  // res.clearCookie('graph_token_expires', {maxAge: 3600000, httpOnly: true});
}

async function getAccessToken(cookies, res) {
  
  if (cookies) {  
    var token = cookies.graph_access_token;
  }
  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }
  
  if (refresh_token) {
    var refresh_token = cookies.graph_refresh_token;
    var newToken = await oauth2.accessToken.create({refresh_token: refresh_token}).refresh();
    saveValuesToCookie(newToken, res);
    return newToken.token.access_token;
  }
  return null;

}

exports.getAccessToken = getAccessToken;

exports.clearCookies = clearCookies;

exports.saveValuesToCookie = saveValuesToCookie;

exports.getTokenFromCode = getTokenFromCode;

exports.getAuthUrl = getAuthUrl;