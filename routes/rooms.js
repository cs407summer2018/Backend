var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)
var path = require('path')

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

router.post('/avaliablity', function(req, res) {
    var avaliablity = "";
    let calendar = google.calendar('v3');
    calendar.events.list({
        auth: jwtClient,
        calendarId: machines[0].google_calender_id,
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
        });
});

router.post('/addRoom', function(req, res) {
    knex('room').insert(req.body).then(function(result) {
        res.json({sucess: true})
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building/:room', function(req, res) {
    
    // Check if building has machines'

    return knex.select().from('building')
        .rightOuterJoin('room', 'building.id', 'room.building_id')
        .where('abbrev', req.params.building)
        .andWhere('room_number', req.params.room).first()
        .then(function(room) {
            if (room != undefined) {
                knex.select().from('building')
                    .rightOuterJoin('room', 'building.id', 'room.building_id')
                    .rightOuterJoin('machine', 'room.id', 'machine.room_id')
                    .where('abbrev', req.params.building)
                    .andWhere('room_number', req.params.room)
                    .then(function(machines) {
                    if (machines.length > 0) {
                        var avaliablity = "";
                        let calendar = google.calendar('v3');
                        calendar.events.list({
                            auth: jwtClient,
                            calendarId: machines[0].google_calender_id,
                            timeMin: (new Date()).toISOString(),
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime',}, 
                            function (err, response) {
                                var startTime = new Date(response.data.items[0].start.dateTime);
                                var endTime = new Date(response.data.items[0].end.dateTime);
                                var timeNow = new Date();
                                if (startTime <= timeNow && timeNow <= endTime) {
                                    avaliablity = "Class in session"
                                } else {
                                    avaliablity = "open"
                                }
                                res.render('../views/room.ejs', {
                                    machines: machines,
                                    room: room,
                                    building: req.params.building,
                                    avaliablity: avaliablity
                                });
                            });
                        } else {
                            res.render('../views/room.ejs', {
                                machines: machines,
                                room: room,
                                building: req.params.building,
                                avaliablity: avaliablity
                            });
                        }

                    });
            } else {
                res.render('../views/error.ejs', {error: "invalid url"})
            }
        })


    knex.select().from('building')
    .rightOuterJoin('room', 'building.id', 'room.building_id')
    .rightOuterJoin('machine', 'room.id', 'machine.room_id')
    .where('abbrev', req.params.building)
    .andWhere('room_number', req.params.room)
    .then(function(machines) {
        console.log(machines);
        console.log(room);
        if (room != undefined) {
            res.render('../views/room.ejs', {
                machines: machines,
                room: room,
                building: req.params.building
            });
        } else {
            res.render('../views/error.ejs', {error: 'invalid url'});
        }

 
    });

 


});

module.exports = router