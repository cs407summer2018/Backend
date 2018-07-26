// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
var session = require('express-session');
var nodeMailer = require('nodemailer');

require('dotenv').config();

var favorite = require('./routes/favorite');
var buildings = require('./routes/buildings');
var rooms = require('./routes/rooms');
var machines = require('./routes/machines');
var sessions = require('./routes/sessions');
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


app.use(express.static('public'));
app.use('/favorite', favorite);
app.use('/authorize', authorize);
app.use('/', index);
app.use('/', rooms);
app.use('/', machines);
app.use('/', sessions);
app.use('/', buildings);

app.post('/send-email', function (req, res) {
  let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'hihms95@gmail.com',
          pass: 'anstjs95!'
      }
  });
  let mailOptions = {
      from: req.body.from, // sender address
      to: req.body.to, // list of receivers
      subject: req.body.subject, // Subject line
      text: req.body.message, // plain text body
      //html: '<b>NodeJS Email Tutorial</b>' // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
          //res.render('index.ejs');
          //res.render('index.ejs', parms);
      });
  });




var port = 3000;

app.listen(port);


module.exports = app;
