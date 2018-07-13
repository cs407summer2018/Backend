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
    
    knex('machines').insert(machines).then(function(result) {
        res.json({sucess: true})
    }).catch(function(err) {
        res.json(err);
    });
})

router.get('/:building/:room/:machine', function(req, res) {
    
    return knex.select().from('machines')
        .rightOuterJoin('rooms', 'machines.room_id', 'rooms.id')
        .rightOuterJoin('specifications', 'rooms.id', 'specifications.room_id')
        .where('machines.name', req.params.machine)
        .andWhere('rooms.room_number', req.params.room)
        .andWhere('building_id', function() {
            this.select('id').from('buildings').where('abbrev', req.params.building);
        }).first()
        .then(function(machine) {     
            if (machine != undefined) {
                knex.select().from('usages').whereNull('end_time').andWhere('machine_id', function() {
                    this.select('id').from('machines').where('machines.name', machine.name);
                }).first()
                .then(function(session){
                    if (session == undefined) {
                        res.render('../views/machine.ejs', {machine: machine, building: req.params.building, session: "not in use"});
                    } else {
                        res.render('../views/machine.ejs', {machine: machine, building: req.params.building, session: "in use"});
                    }
                })
            } else {
                res.render('../views/error.ejs', {error: "invalid url"})
            }
        })
      
});

module.exports = router