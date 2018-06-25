// app.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var port = 3000;

app.listen(port, '172.31.8.239');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});


module.exports = app;

