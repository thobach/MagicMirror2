// Global config file for Magic Mirror 2

// Weather Underground API key
// See https://www.wunderground.com/weather/api/d/docs 
// for more details to obtain an API key
var weatherUndergroundApiKey = '';

// Weather Underground station
// e.g. "Germany/Dresden" or "pws:<station-id>"
// Sample station:
// https://www.wunderground.com/cgi-bin/findweather/getForecast?query=pws:IDRESDEN88
// would use "pws:IDRESDEN88"
var weatherStation = '';

// Language setting for calendar
// For navigator language use:
// var lang = window.navigator.language;
// Or overwrite the language as below:
var lang = 'de';

// Google Calendar settings

// clientId can be obtained by following step 1 from
// https://developers.google.com/google-apps/calendar/quickstart/js
var clientId = '';

// list of calendars to be displayed
// - any shared calendar of the authorized Google account can be displayed
// - authentification and authorization happens when you load calendar.html, e.g. by
//   launching "python -m SimpleHTTPServer 8000" from the folder where calendar.html
//   is located and then open http://localhost:8000/calendar.html in your browser
// - afterwards you need to refresh the browser tab
// - the 'id' is the ID of the calendar in your Google Calendar, 'name' needs to be the 
//   exact name as it appears in your Google Calendar, 'prefix' is the one letter prefix 
//   that should be shown in the list of events, to distinguish the source of the 
//   calendar event
// - Example:
// var calendars = [
//	{id:'you@gmail.com',name:'Your Name',prefix:'Y'},
//	{id:'your.wife@gmail.com',name:'Your Wife\'s Name',prefix:'W'},
//	{id:'some-shared-group@group.calendar.google.com',name:'Events in your town',prefix:'E'},
//	{id:'you@work.com',name:'Your Name',prefix:'Y'},
//	{id:'some-id@import.calendar.google.com',name:'some-url-of-an-imported-calendar',prefix:'Y'},
//	];
var calendars = [
	{id:'',name:'',prefix:''},
	];

// events with below summary should not be displayed
var ignoreEventsWithSummary = '';