var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)
var path = require('path')

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
                        res.render('../views/room.ejs', {
                            machines: machines,
                            room: room,
                            building: req.params.building
                        });
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