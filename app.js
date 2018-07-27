// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

var session = require('express-session');
var nodeMailer = require('nodemailer');
var config = require('./config/knex/knexfile');
var knex = require('knex')(config);
var fs = require('fs');
var busboy = require('connect-busboy');


require('dotenv').config();

var favorite = require('./routes/favorite');
var buildings = require('./routes/buildings');
var rooms = require('./routes/rooms');
var machines = require('./routes/machines');
var sessions = require('./routes/sessions');
var index = require('./routes/index');
var authorize = require('./routes/authorize');

var authHelper = require('./helpers/auth');

app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());

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

app.post('/windows-status', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<!doctype html><html><head><title>response</title></head><body>');
            res.write('<h1>Data received!</h1>');
            res.end('</body></html>');
        });
    });
});

app.post('/send-email', function (req, res) {

  // let parms = { title: 'Home', active: { home: true }, rows: []};
  // const accessToken = await authHelper.getAccessToken(req.cookies, res);

  // let userName;
  // if (req.cookies) {
  //     userName = req.cookies.graph_user_name;
  // }

  // if (accessToken && userName) {
  //     parms.user = userName;
  //     parms.debug = `User: ${userName}\nAccess Token: ${accessToken}\n`;
  //     parms.signInUrl = null;
  // } else {
  //     parms.signInUrl = authHelper.getAuthUrl();
  //     parms.debug = parms.signInUrl;
  //     parms.user = null;
  // }


  let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'purduelabstats@gmail.com',
          pass: 'nrm2018summer'
      }
  });
  console.log("eeee: "+ req.cookies.graph_user_name);
  var user_email = req.cookies.graph_user_name + "@purdue.edu"
  
  

  if (req.body.machine) {
    console.log("Machine: "+ req.body.machine);
    knex.raw('SELECT email FROM users WHERE id in ( \
SELECT user_id FROM usages WHERE machine_id = ( \
SELECT id AS machine_id FROM machines WHERE name = "'+req.body.machine+'" \
) AND device LIKE \'%tty%\' AND end_time IS NULL);').then(function(results) {
        //var result = results[0];
        //console.log("results: "+ result);
        console.log("results: "); 
        var email = results[0].email;
        console.log(email); 
        let mailOptions = {
      from: 'purduelabstats@gmail.com', // sender address
      // to: req.body.to, // list of receivers
      to: 'hihms95@gmail.com', // list of receivers
      cc: user_email, // sender is CC'ed
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
          res.redirect(req.get('referer'));
  });

    });
      
  } else if (req.body.room) {
    console.log("Rooom: "+ req.body.room);
    knex.raw('SELECT email FROM users WHERE id in ( \
SELECT user_id FROM usages WHERE machine_id IN ( \
SELECT id AS machine_id FROM machines WHERE room_id IN ( \
SELECT id FROM rooms WHERE room_number = "B146") \
) AND device LIKE \'%tty%\' AND end_time IS NULL);').then(function(results) {
        //var result = results[0];
        //console.log("results: "+ result);
        console.log("results: "); 
        //var email = results[0].email;
        console.log(results); 
        var emailObjects = results[0];
        var emails = emailObjects.map((item) => { return item.email });
        console.log("emails");
        console.log(emails);

        let mailOptions = {
      from: 'purduelabstats@gmail.com', // sender address
      // to: req.body.to, // list of receivers
      to: 'hihms95@gmail.com', // list of receivers
      cc: user_email, // sender is CC'ed
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
          //res.render('./views/index.ejs', {user: null, signInUrl: null});
          // res.redirect(req.get('referer'));
          res.redirect(req.get('referer'));

          

  });

    });
  }
});




var port = 3000;

app.listen(port);


module.exports = app;
