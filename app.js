// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
var session = require('express-session');

require('dotenv').config();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
  secret: 'jjgjdjt',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false, maxAge: 60000}
}));

var index = require('./routes/index');
var authorize = require('./routes/authorize');
app.use('/', index);
app.use('/authorize', authorize);

var port = 3000;

app.listen(port);

// app.get('/', function(req, res){
// 	res.sendFile('index.ejs', {signInUrl:"moonsun"});
// });


module.exports = app;
