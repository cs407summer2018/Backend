var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)

const util = require('util')


var {google} = require('googleapis');
var privatekey = require("../config/privatekey.json");

// configure a JWT auth client
let jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets',
     'https://www.googleapis.com/auth/drive',
     'https://www.googleapis.com/auth/calendar']);

jwtClient.authorize(function (err, tokens) {
if (err) {
    console.log(err);
return;
} else {
    console.log("Successfully connected!");
}
});


/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(typeof req.next);
  let parms = { title: 'Home', active: { home: true }, 
    rows: [
    {
      building: 'LWSN', room: 'B131', machineName: 'sac', OS: 'Linux', Availability: 'Open', Fraction: '3/26'
    },
    {
      building: 'LWSN', room: 'B146', machineName: 'moore', OS: 'Linux', Availability: 'Open', Fraction: '1/25'
    },
    {
      building: 'HAAS', room: 'G040', machineName: 'pod', OS: 'Linux', Availability: 'Full', Fraction: '26/26'
    },
    {
      building: 'LWSN', room: 'G056', machineName: 'sslab', OS: 'Linux', Availability: 'Open', Fraction: '10/26'
    }
    ]
  }
  
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
  .then(function(rooms) {
    parms.rows = rooms
    console.log(parms);
    res.render('index.ejs', parms);
  }).catch(function(err) {
    res.json({error: 'error3'});
  });

});
/**
 * 
 * 

rooms.forEach(function(room) {
  knex.select('name').from('machines').where('room_id', room.id).first()
  .then(function(result) {
    if (result != undefined) {
      room.machineName = result.name;
    }
    knex.select('OS').from('specifications').where('room_id', room.id).first()
    .then(function(result) {
      room.OS = result.OS;
    })
  })
})
*/
module.exports = router;