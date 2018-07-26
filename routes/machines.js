var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var config = require('../config/knex/knexfile');
var knex = require('knex')(config);
var path = require('path');

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
        };
        machines.push(machine);
    }

    console.log(machines);

    knex('machines').insert(machines).then(function(result) {
        res.json({sucess: true});
    }).catch(function(err) {
        res.json(err);
    });
})


module.exports = router;
