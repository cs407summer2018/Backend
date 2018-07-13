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
    knex.raw('select id, room_id, count(room_id) as occurances from machines where id in \
    (select distinct machine_id as id from usages \
     where end_time is null and \
     machine_id in (select id from machines where room_id in (select id from rooms)) \
     order by machine_id) \
    group by room_id \
    order by room_id;').then(function(results) {
      rooms.forEach(function(room) {
        var room_id = room.id;
        var asd = results[0];
        console.log(asd);
        var filtered_row = asd.filter(function(row){
          console.log(row.room_id);
          console.log(room_id);
          return row.room_id === room_id;
        })
        if (filtered_row.length == 0) {
          console.log(filtered_row);
          console.log(filtered_row.lenth);
          room.occurances = 0;
        } else {
          var occurances = filtered_row[0].occurances;
          room.occurances = occurances;
        }
      })
      console.log(rooms);
      parms.rows = rooms
  
      res.render('index.ejs', parms);
    })

  }).catch(function(err) {
    res.json({error: 'error3'});
  });

});
 



var recurse = function (rooms, idx, req, res, parms) {
  if (idx < rooms.length) {
    var room = rooms[idx];
    // make api call for room
    var avaliablity = "";
    let calendar = google.calendar('v3');
    calendar.events.list({
        auth: jwtClient,
        calendarId: room.google_calender_id,
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',}, 
        function (err, response) {
            var startTime = new Date(response.data.items[0].start.dateTime);
            var endTime = new Date(response.data.items[0].end.dateTime);
            var timeNow = new Date();
            if (startTime <= timeNow && timeNow <= endTime) {
                avaliablity = "Class In Session"
            } else {
                avaliablity = "Open"
            }
            room.avaliablity = avaliablity;
            console.log(avaliablity);
            recurse(rooms, idx+1, req, res, parms);
        });
  } else {
    res.render('index.ejs', parms);
  }
}


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