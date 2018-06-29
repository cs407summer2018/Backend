var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)
var path = require('path')

router.post('/addMachine', function(req, res) {
    var numOfMachines = req.body.numOfMachines;
    var prefix = req.body.prefix;
    var room_id = req.body.room_id;
    var machines = [];
    var i;

    for (i = 1; i < numOfMachines + 1; i++) {
        var name = i < 10 ? prefix + '0' + i.toString() : prefix + i.toString();
        var machine = {
            'room_id': room_id,
            'name': name
        }
        machines.push(machine);
    }

    console.log(machines);
    
    knex('machine').insert(machines).then(function(result) {
        res.json({sucess: true})
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building/:room/:machine', function(req, res) {

    knex.select().from('machine').where('name', req.params.machine).andWhere('room_id', function() {
        this.select('id').from('room').where('room_number', req.params.room)
        .andWhere('building_id', function() {
            this.select('id').from('building').where('abbrev', req.params.building);
        })
    }).then(function(machine) {
        if (machine.length > 0) {
            res.sendFile(path.join(__dirname, '../views', 'machines.html'));
        } else {
            res.sendFile(path.join(__dirname, '../views', 'error.html'));
        }
    });



});

module.exports = router