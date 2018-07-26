const express = require('express');
const router = express.Router();
var config = require('../config/knex/knexfile');
var authHelper = require('../helpers/auth');
var knex = require('knex')(config);
var path = require('path');

router.post('/addBuilding', function(req, res) {
    knex('buildings').insert(req.body).then(function(result) {
        res.json({sucess: true});
    }).catch(function(err) {
        res.json(err);
    });
});

router.get('/:building', async function(req, res, next) {
    let parms = { title: 'Home', active: { home: true }};
    const accessToken = await authHelper.getAccessToken(req.cookies, res);

    let userName;
    if (req.cookies) {
      userName = req.cookies.graph_user_name;
    }


    if (accessToken && userName) {
      parms.user = userName;
      parms.debug = `User: ${userName}\nAccess Token: ${accessToken}\n`;
      parms.signInUrl = null;
    } else {
      parms.signInUrl = authHelper.getAuthUrl();
      parms.debug = parms.signInUrl;
      parms.user = null;
    }

    knex.select().from('buildings')
  .rightOuterJoin('rooms', 'buildings.id', 'rooms.building_id')
  .where('abbrev', req.params.building)
  .then(function(rooms) {
    console.log(rooms);
    if (rooms.length > 0 ) {
        knex.raw('select id, room_id, count(room_id) as occurances from machines where id in \
    (select distinct machine_id as id from usages \
     where end_time is null and \
     machine_id in (select id from machines where room_id in (select id from rooms)) \
     order by machine_id) \
    group by room_id \
    order by room_id;').then(function(results) {
      rooms.forEach(function(room) {
        var room_id = room.id;
        var asd = results[0];
        console.log(asd);
        var filtered_row = asd.filter(function(row){
          console.log(row.room_id);
          console.log(room_id);
          return row.room_id === room_id;
        });
        if (filtered_row.length == 0) {
          console.log(filtered_row);
          console.log(filtered_row.lenth);
          room.occurances = 0;
        } else {
          var occurances = filtered_row[0].occurances;
          room.occurances = occurances;
        }
      });
      console.log(rooms);
        parms.rows = rooms;
        parms.building = req.params.building;
        parms.rooms = rooms;
        res.render('../views/building.ejs', parms);
    });

    } else {
      parms.error = "invalid url";
      res.render('../views/error.ejs', parms);
    }
  }).catch(function(err) {
    res.json({error: 'error3'});
  });

    knex.select().from('rooms').where('building_id', function() {
        this.select('id').from('buildings').where('abbrev', req.params.building).first();
    }).then(function(rooms) {

    });
});

module.exports = router;
