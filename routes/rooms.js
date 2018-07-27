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
                    var fullRoom = true;
                    machines.forEach(async function(machine) {
                        var machine_id = machine.id;
                        var filtered_row = results[0].filter(function(row){
                            return row.machine_id === machine_id;
                        });
                        if (filtered_row.length == 0) {
                            machine.usage = false;
                            fullRoom = false;
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
                                    params.error = err;
                                    res.render('../views/error.ejs', params);
                                }
                                var startTime = new Date(response.data.items[0].start.dateTime);
                                var endTime = new Date(response.data.items[0].end.dateTime);
                                var timeNow = new Date();
                                if (startTime <= timeNow && timeNow <= endTime) {
                                    availability = "Class In Session";
                                } else {
                                    availability = "Open";
                                }
                                if (fullRoom) {
                                    availability = "Full";
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


router.post('/rooms/predictions', async function(req, res) {
    var room = req.body.room;
    var timeNow = new Date();
    var timeWeekAgo = new Date();
    timeWeekAgo.setDate(timeNow.getDate() - 8);
    var timeWeekAgoString = timeWeekAgo.toISOString().slice(0, 19).replace('T', ' ');
    var secondsInHour = 3600000;
    var hoursInWeek = 192;
    console.log()
    console.log("timeNow: " + timeNow.toISOString().slice(0, 19).replace('T', ' '));
    var arrayOfTimesPast = new Array(hoursInWeek).fill(0);

    knex.raw('select * from usages \
    where start_time >= STR_TO_DATE(\''+ timeWeekAgoString + '\', \'%Y-%m-%d %H:%i:%s\') \
    and device like \'%tty%\'\
    and machine_id in ( select id from machines where room_id = (select id from rooms where room_number=\'' + room + '\'))')
    .then(function(results) {
        //console.log(results);
        results[0].forEach(function(usage) {
            /*
            console.log(usage.id);
            console.log("start_time: " + usage.start_time.toISOString().slice(0, 19).replace('T', ' '));
            if (usage.end_time != undefined) {
                console.log("end_time: " + usage.end_time.toISOString().slice(0, 19).replace('T', ' '));
            } else {
                console.log("end_time: null");
            }
            */
            var hoursSinceStart = Math.ceil(Math.abs(timeNow - usage.start_time) / secondsInHour); // diff in hours rounded up
            var hoursSinceEnd = usage.end_time == null ? null : Math.abs(timeNow - usage.end_time) / secondsInHour; // diff in hours
        
            //console.log(hoursSinceStart);
            //console.log(hoursSinceEnd);

            arrayOfTimesPast[hoursInWeek - hoursSinceStart]++;
            hoursSinceStart--;

            while(hoursSinceStart > hoursSinceEnd && hoursSinceStart >= 0) {
                arrayOfTimesPast[hoursInWeek - hoursSinceStart]++;
                hoursSinceStart--;
            }
        });
        
        //arrayOfTimesPast.forEach(function(item, idx) { console.log("hour: " + idx + " usages: " + item); })

        var arrayOfTimesFutre = arrayOfTimesPast.slice().reverse();

        //arrayOfTimesPast.forEach(function(item, idx) { console.log("hour: " + idx + " usages: " + item); })

        var timesData = arrayOfTimesPast.concat(arrayOfTimesFutre);

        //timesData.forEach(function(item, idx) { console.log("hour: " + idx + " usages: " + item); })

        res.json({timesData: timesData, sucess: true});


    })


    /*
    arrayOfTimesPast.forEach(function(time, idx) {
        console.log("idx: " + idx + " time: " + time);
    });
    res.json({sucess: true});
    */
});

module.exports = router;
