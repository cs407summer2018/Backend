// db.js

var mysql = require('mysql');

var connection = mysql.createConnection({
	host: "purduelabstats.cnfthxsaxcoe.us-east-2.rds.amazonaws.com",
	user: "root",
	password: "plspassword",
	database: "PurdueLabStats",
	port: "3306"
});

connection.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});
