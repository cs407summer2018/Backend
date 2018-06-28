var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)
var path = require('path')

router.get('/:building/:room', function(req, res) {
    // What should we return for invalid url? '/string/string'

    knex.select().from('machine').where('room_id', function() {
        this.select('id').from('room')
        .where('room_number', req.params.room)
        .andWhere('building_id', function() {
            this.select('id').from('building').where('abbrev', req.params.building);
        });
    }).then(function(rooms) {
        console.log(rooms)
        //res.send(rooms);
        //console.log(path.join(__dirname, '../views', 'index.html'))
        res.sendFile(path.join(__dirname, '../views', 'labdetails.html'));
    });

});

module.exports = router