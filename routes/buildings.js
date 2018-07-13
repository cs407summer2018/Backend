const express = require('express');
const router = express.Router();
var config = require('../config/knex/knexfile');
var authHelper = require('../helpers/auth');
var knex = require('knex')(config);
var path = require('path');

router.post('/addBuilding', function(req, res) {
    knex('buildings').insert(req.body).then(function(result) {
        res.json({sucess: true})
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building', async function(req, res, next) {

    let parms = { title: 'Home', active: { home: true }};

    const accessToken = await authHelper.getAccessToken(req.cookies, res);

    let userName;
    if (req.cookies) {
      userName = req.cookies.graph_user_name;
    } 
  
  
    if (accessToken && userName) {
      parms.user = userName;
      parms.debug = `User: ${userName}\nAccess Token: ${accessToken}\n`;
      parms.signInUrl = null;
    } else {
      parms.signInUrl = authHelper.getAuthUrl();
      parms.debug = parms.signInUrl;
      parms.user = null;
    }

    knex.select().from('buildings')
  .rightOuterJoin('rooms', 'buildings.id', 'rooms.building_id')
  .where('abbrev', req.params.building)
  .then(function(rooms) {
    console.log(rooms);
    if (rooms.length > 0 ) {
       
        res.render('../views/building.ejs', {rooms: rooms, building: req.params.building, parms: parms});
    } else {
        res.render('../views/error.ejs', {error: "invalid url"})
    }
  }).catch(function(err) {
    res.json({error: 'error3'});
  });

    knex.select().from('rooms').where('building_id', function() {
        this.select('id').from('buildings').where('abbrev', req.params.building).first();
    }).then(function(rooms) {
       
    });  
})

module.exports = router;