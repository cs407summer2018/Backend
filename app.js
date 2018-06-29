// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
var session = require('express-session');

require('dotenv').config();

var buildings = require('./routes/buildings');
var rooms = require('./routes/rooms');
var machines = require('./routes/machines');
var index = require('./routes/index');
var authorize = require('./routes/authorize');

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    secret: 'jjgjdjt',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, maxAge: 60000}
}));

app.use('/authorize', authorize);
app.use('/', index);
app.use('/', buildings);
app.use('/', rooms);
app.use('/', machines);


var port = 3000;

app.listen(port);

module.exports = app;
