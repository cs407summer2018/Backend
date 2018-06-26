// app.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var port = 3000;

app.listen(port);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});


module.exports = app;

