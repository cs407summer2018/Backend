const express = require('express');
const router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)

router.get('/:building', function(req, res) {

    knex.select().from('room').where('building_id', function() {
        this.select('id').from('building').where('abbrev', req.params.building).first();
    }).then(function(rooms) {
        res.send(rooms);
    });
    
})

module.exports = router;