const express = require('express');
const router = express.Router();
var config = require('../config/knex/knexfile');
var knex = require('knex')(config);
var path = require('path');

router.post('/addBuilding', function(req, res) {
    knex('building').insert(req.body).then(function(result) {
        res.json({sucess: true})
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building', function(req, res) {
    knex.select().from('room').where('building_id', function() {
        this.select('id').from('building').where('abbrev', req.params.building).first();
    }).then(function(rooms) {
        if (rooms.length > 0 ) {
            res.render('../views/building.ejs', {rooms: rooms, building: req.params.building});
        } else {
            res.render('../views/error.ejs', {error: "invalid url"})
        }
    });  
})

module.exports = router;