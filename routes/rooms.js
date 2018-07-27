var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var config = require('../config/knex/knexfile');
var knex = require('knex')(config);
var path = require('path');

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

router.post('/rooms/availability', function(req, res) {
    var availability = "wait";
    knex.select('google_calender_id').from('rooms').where('room_number', req.body.room).first().then(function(result) {
        let calendar = google.calendar('v3');
        calendar.events.list({
            auth: jwtClient,
            calendarId: result.google_calender_id,
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'},
            function (err, response) {
                if (err) {
                    availability = 'Error';
                } else {
                    var startTime = new Date(response.data.items[0].start.dateTime);
                    var endTime = new Date(response.data.items[0].end.dateTime);
                    var timeNow = new Date();
                    if (startTime <= timeNow && timeNow <= endTime) {
                        availability = "Class In Session";
                    } else {
                        availability = "Open";
                    }
                }
                res.json({availability: availability});
            });

    });
   
});

router.post('/addRoom', function(req, res) {
    knex('room').insert(req.body).then(function(result) {
        res.json({sucess: true});
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building/:room', async function(req, res) {
    let parms = { title: 'Home', active: { home: true }, rows: [] };
    const accessToken = await authHelper.getAccessToken(req.cookies, res);

    let userName;
    if (req.cookies) {
        userName = req.cookies.graph_user_name;
    }

    if (accessToken && userName) {
        parms.user = userName;
        //parms.debug = `User: ${userName}\nAccess Token: ${accessToken}\n`;
        parms.signInUrl = null;
    } else {
        parms.signInUrl = authHelper.getAuthUrl();
        //parms.debug = parms.signInUrl;
        parms.user = null;
    }
    knex.select().from('rooms')
    .rightOuterJoin('buildings', 'rooms.building_id', 'buildings.id')
    .rightOuterJoin('specifications', "rooms.id", "specifications.room_id")
    .where('abbrev', req.params.building)
    .andWhere('room_number', req.params.room).first()
    .then(function(room) {
        if (room != undefined) {
            knex.select().from('machines')
            .where('room_id', function() {
                this.select('id').from('rooms').where('room_number', room.room_number);
            })
            .then(function(machines) {
                knex.raw('select * from usages where end_time is null and device LIKE \'%tty%\'')
                .then(async function(results) {
                    machines.forEach(async function(machine) {
                        var machine_id = machine.id;
                        var filtered_row = results[0].filter(function(row){
                            return row.machine_id === machine_id;
                        });
                        if (filtered_row.length == 0) {
                            machine.usage = false;
                        } else {
                            machine.usage = true;
                        }
                    });
                    if (machines.length > 0) {
                        var availability = "";
                        let calendar = google.calendar('v3');
                        let calendar_options = {
                            auth: jwtClient,
                            calendarId: machines[0].google_calender_id,
                            timeMin: (new Date()).toISOString(),
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime'};
                        calendar.events.list(
                            calendar_options,
                            function (err, response) {
                                if (err) {
                                    res.render('../views/error.ejs',
                                                error=err);
                                }
                                var startTime = new Date(response.data.items[0].start.dateTime);
                                var endTime = new Date(response.data.items[0].end.dateTime);
                                var timeNow = new Date();
                                if (startTime <= timeNow && timeNow <= endTime) {
                                    availability = "Class In Session";
                                } else {
                                    availability = "Open";
                                }
                                parms.machines = machines;
                                parms.room = room;
                                parms.building = req.params.building;
                                parms.availability = availability;
                                res.render('../views/room.ejs', parms);
                            });
                    } else {
                        parms.machines = machines;
                        parms.room = room;
                        parms.building = req.params.building;
                        parms.availability = availability;
                        res.render('../views/room.ejs', parms);
                    }
                });
            });
        } else {
          parms.error = "invalid url";
          res.render('../views/error.ejs', parms);
          //res.render('../views/error.ejs', {error: "invalid url"});
        }
    });


   
});

module.exports = router;
