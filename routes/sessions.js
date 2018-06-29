var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config)
var path = require('path')

// These routes are just for testing 

router.post('/addSession', function(req, res) {

})

router.post('/removeSession', function(req, res) {

})

router.post('/getUsage', function(req, res) {
    knex.select().from('session').whereNull('end_time').andWhere('machine_id', req.body.machine_id).first()
    .then(function(session) {
        if (session == undefined) {
            res.json({machine_usage: false})
        } else {
            res.json({machine_usage: true})
        }
    })
});

module.exports = router