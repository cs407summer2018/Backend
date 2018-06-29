var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Home', active: { home: true } };
  const accessToken = await authHelper.getAccessToken(req.cookie, res);

  let userName;
  if (req.cookie) {
    userName = req.cookie.graph_user_name;
  } 

  if (accessToken && userName) {
    parms.user = userName;
    parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
  } else {
    parms.signInUrl = authHelper.getAuthUrl();
    parms.debug = parms.signInUrl;
    parms.user = null;
  }

  res.render('index.ejs', parms);
});

module.exports = router;