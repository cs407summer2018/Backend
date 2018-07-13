var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)

const util = require('util')



/* GET home page. */
router.get('/', async function(req, res, next) {
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