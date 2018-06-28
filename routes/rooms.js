var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)

router.get('/:building/:room', function(req, res) {

    knex.select().from('room').where('building_id', function() {
        this.select('id').from('building').where('abbrev', req.params.building).first();
    }).then(function(rooms) {
        res.send(rooms);
    });


    knex.select().from('machine').where('room_id', function() {
        this.select('id').from('room').where('room_number', req.params.room).first();
    })
    then(function(rooms) {
        res.send(rooms);
    });

});

module.exports = router