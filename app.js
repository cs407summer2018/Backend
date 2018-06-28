// app.js

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var buildings = require('./routes/buildings');
var rooms = require('./routes/rooms')
var machines = require('./routes/machines')

var port = 3000;

app.listen(port);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.use(bodyParser.json());

app.use('/', buildings);
app.use('/', rooms);
app.use('/', machines);


module.exports = app;

