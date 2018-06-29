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
    
    knex.select().from('machine').where('room_id', function() {
        this.select('id').from('room')
        .where('room_number', req.params.room)
        .andWhere('building_id', function() {
            this.select('id').from('building').where('abbrev', req.params.building);
        });
    }).then(function(machines) {
        console.log(machines)
        if (machines.length > 0 ) {
            //res.sendFile(path.join(__dirname, '../views', 'labdetails.html'));
            res.render('../views/room.ejs', {
                machines: machines, 
                room: req.params.room, 
                building: req.params.building});
        } else {
            res.sendFile(path.join(__dirname, '../views', 'error.html'));
        }
    });

});

module.exports = router