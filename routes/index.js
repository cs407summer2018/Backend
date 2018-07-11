var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)

const util = require('util')



/* GET home page. */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Home', active: { home: true } };
  const accessToken = await authHelper.getAccessToken(req.cookies, res);

  let userName;
  if (req.cookies) {
    userName = req.cookies.graph_user_name;
  } 

  if (accessToken && userName) {
    parms.user = userName;
    parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
    parms.signInUrl = null;
  } else {
    parms.signInUrl = authHelper.getAuthUrl();
    parms.debug = parms.signInUrl;
    parms.user = null;
  }

  knex.select().from('building')
  .rightOuterJoin('room', 'building.id', 'room.building_id')
  .then(function(rooms) {
    parms.rooms = rooms
    res.render('index.ejs', parms);
  })
});

module.exports = router;