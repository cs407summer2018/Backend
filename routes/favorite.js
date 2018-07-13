var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config);
var authHelper = require('../helpers/auth');
var path = require('path');

router.post('/addFavorite', async function(req, res, next) {
    var room = req.body.room;
    var favorite = req.body.favorite;

    const accessToken = await authHelper.getAccessToken(req.cookies, res);

    let userName;
    if (req.cookies) {
        userName = req.cookies.graph_user_name;
    }

    if (accessToken && userName) {
        return knex('users').where('name', userName)
        .update(room, favorite).then(function(result) {
            res.json({sucess: true})
        }).catch(function(err) {
            res.json(err);
        });
    } else {
        res.json({sucess: false})
    }   
});

module.exports = router