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

router.get('/about', async function(req, res, next) {
  let parms = { title: 'Home', active: { home: true }, rows: []}
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

  res.render('../views/about.ejs', parms);
})

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(typeof req.next);
  let parms = { title: 'Home', active: { home: true }, rows: []}
  
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
        var filtered_row = results[0].filter(function(row){
          return row.room_id === room_id;
        })
        if (filtered_row.length == 0) {
          room.occurances = 0;
        } else {
          var occurances = filtered_row[0].occurances;
          room.occurances = occurances;
        }
        room.availability = (room.occurances == room.capacity) ? 'Full' : 'Open';

        let calendar = google.calendar('v3');
        calendar.events.list({
            auth: jwtClient,
            calendarId: room.google_calender_id,
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'}, 
            function (err, response) {
              if (err) {
                room.availability = 'Error';
              } else {
                var startTime = new Date(response.data.items[0].start.dateTime);
                var endTime = new Date(response.data.items[0].end.dateTime);
                var timeNow = new Date();
                if (startTime <= timeNow && timeNow <= endTime) {
                    room.availability = "Class";
                }
              }
            });
      })
      parms.rows = rooms
      if (userName) {
        knex.select().from('favorites').where('user_id', function() {
          this.select('id').from('users').where('name', userName)
        })
        .then(function(favorites) {
          rooms.forEach(function(room) {
            var room_id = room.id;
            var filtered_row = favorites.filter(function(favorite){
              return favorite.room_id === room_id;
            })
            if (filtered_row.length == 0) {
              room.favorited = 0;
            } else {
              room.favorited = 1;
            }
          })

          console.log(rooms);
          res.render('index.ejs', parms);
        })
      } else {
        res.render('index.ejs', parms);
      }
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

module.exports = router;