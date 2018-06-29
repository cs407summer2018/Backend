// CalendarAPI settings
const key = require('./glassy-land-208615-295f2eaf8958').private_key;


const SERVICE_ACCT_ID = 'purduelabstats@glassy-land-208615.iam.gserviceaccount.com';
const TIMEZONE = 'UTC+08:00';
const CALENDAR_ID = {
	'primary': 'noahignaciosmith@gmail.com',
	'calendar-1': 'en.usa#holiday@group.v.calendar.google.com',
	'calendar-2': '1r5tgrb2sln4oe4h4f4gfeece8@group.calendar.google.com'
};

module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.key = key;
module.exports.timezone = TIMEZONE;
module.exports.calendarId = CALENDAR_ID;

// Example for using json keys
// var key = require('./googleapi-key.json').private_key;
// module.exports.key = key;