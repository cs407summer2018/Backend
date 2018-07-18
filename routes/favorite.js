var express = require('express');
var router = express.Router();
var config = require('../config/knex/knexfile')
var knex = require('knex')(config);
var authHelper = require('../helpers/auth');
var path = require('path');

router.post('/addFavorite', async function(req, res, next) {
    var room = req.body.room;
    var fav = req.body.favorite;

    const accessToken = await authHelper.getAccessToken(req.cookies, res);

    let userName;
    if (req.cookies) {
        userName = req.cookies.graph_user_name;
    }

    if (accessToken && userName) {
        console.log("FAVORITE STRING: " + fav);
        if (fav == 1) {
            knex.raw('INSERT INTO favorites (user_id, room_id) VALUES ( \
                (SELECT id FROM users WHERE name = \''+ userName +'\' ), \
                (SELECT id FROM rooms WHERE room_number = \'' + room + '\') \
                );').then(function() {
                    res.json({sucess: true})
            })
        } else {
            knex.raw('DELETE FROM favorites WHERE \
                user_id = (SELECT id FROM users WHERE name = \'' + userName + '\') \
                and room_id = (SELECT id FROM rooms WHERE room_number = \'' + room + '\');')
                .then(function() {
                    res.json({sucess: true}) 
                })
        }

    } else {
        res.json({sucess: false})
    }   
});

module.exports = router