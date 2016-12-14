// AngularJS Calendar App using Google Calendar Data
// Date and Time controller
var timeCtrlDef = function($scope, $interval) {

	// init using global variables from config.js
	moment.locale(lang);

	// update date in UI
	var date = function() {
		$scope.date = moment().format("dddd, Do MMMM");
	}

	// update time incl. seconds in UI
	var time = function() {
		$scope.time = moment().format("HH:mm");
		$scope.seconds = moment().format("ss");
	}

	// initial date	
	date();

	// refresh date every 1 minute
	$interval(date, 1 * 60 * 1000);

	// refresh time every 1 second
	$interval(time, 1 * 1 * 1000);

};

// Calendar Event List Controller
var calendarCtrlDef = function($scope, $timeout, $interval, getCalendar) {

	// init using global variables from config.js
	getCalendar.initCalendar(clientId, calendars);

	// wrap load function to be called repeatedly, gets calendar events and displays them
	var load = function() {
		getCalendar.listUpcomingEvents(function(data) {
			$scope.events = data;
		});
	}

	// initial call, wait 1s until Google Client was loaded
	// Google Client's "onload" callback didn't work out of the box with AngularJS
	$timeout(load, 1 * 1 * 1000);

	// refresh data every 15 minutes
	$interval(load, 15 * 60 * 1000);

};

// Google Calendar Module
var getCalendar = function() {

	// view model for module
	var calendarService = {
		"clientId": "",
		"calendars": [],
		"events": []
	};

	// init function for module
	calendarService.initCalendar = function(clientId, calendars) {
		calendarService.clientId = clientId;
		calendarService.calendars = calendars;
	};

	// helper function for increasing a date by x number of days
	function addDays(date, days) {
	
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		
		return result;
		
	}

	// create Google Calendar request to retrieve events for given calendar
	function composeRequest(calendarId) {

		// show all events that started from midnight today
		var startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		// up until midnight in two days (effectively all events from today and tomorrow)
		var startOfInTwoDays = new Date();
		startOfInTwoDays = addDays(startOfInTwoDays, 2);
		startOfInTwoDays.setHours(0, 0, 0, 0);

		return gapi.client.calendar.events.list({
			'calendarId': calendarId,
			'timeMin': (startOfToday).toISOString(),
			'timeMax': (startOfInTwoDays).toISOString(),
			'showDeleted': false,
			'singleEvents': true,
			'maxResults': 100,
			'orderBy': 'startTime'
		});

	}

	// every calendar has a prefix to associate events to calendars in the view
	function extractPrefix(calendars, calendarName) {
	
		var prefix = 'Unknown';
		
		for (calendarId in calendars) {
			if (calendars[calendarId].name === calendarName) {
				prefix = calendars[calendarId].prefix;
			}
		}
		
		return prefix;
		
	}

	// convert Google Calendar event to internal structure
	function parseGoogleEvent(googleEvent, participant) {
	
		// extract start time or day of event
		var when = googleEvent.start.dateTime;
		
		// full-day events don't have a time, just a date
		if (!when) {
			when = googleEvent.start.date;
		}

		// build event object
		var event = {
			participant: [participant],
			summary: googleEvent.summary,
			date: new Date(when),
			dateString: moment(when).calendar()
		};
		
		return event;
		
	}

	// parse Google Calendar response to internal event structure
	function parseResponse(events, participant, calendarId) {

		var parsedEvents = [];

		// check if any events were returned
		if (events && events.length > 0) {


			// iterate over all events of a calendar
			for (i = 0; i < events.length; i++) {

				var googleEvent = events[i];

				var event = parseGoogleEvent(googleEvent, participant);

				// add to list of events
				parsedEvents.push(event);

			}

		}
		// print message to console otherwise
		else {
			console.log('No upcoming events found for calendar "' + calendarId + '".');
		}

		return parsedEvents;
		
	}

	// merge multi-dimensional arrays into flat array
	function mergeEventsFromAllCalendars(values) {
	
		var events = [];
		for (eventList in values) {
			events = events.concat(values[eventList]);
		}
		return events;
		
	}

	// remove events with a specific summary (see config)
	function filterEvents(events) {
		return events.filter(value => {
			return value && value.summary &&
				!value.summary.startsWith(ignoreEventsWithSummary);
		});
	}

	// sort events by date
	function sortEvents(events) {
		events.sort(function(a, b) {
			return a.date.getTime() - b.date.getTime()
		});
	}

	// merge events with same summary and time, but from different calendars, add prefix 
	// for each calendar to event
	function mergeDuplicates(events) {

		// identify duplicates (pre-requisite: sorted list of events)
		var innerEvents = events.slice();
		
		for (outerEvent in events) {
		
			for (innerEvent in innerEvents) {
			
				if (!events[outerEvent].merged && !innerEvents[innerEvent].merged &&
					events[outerEvent].participant[0] != innerEvents[innerEvent].participant[0] &&
					innerEvents[outerEvent].summary == innerEvents[innerEvent].summary &&
					events[outerEvent].date.getTime() == innerEvents[innerEvent].date.getTime()) {
					
					events[outerEvent].participant.push(innerEvents[innerEvent].participant[0]);
					events[outerEvent].merged = true;
					innerEvents[innerEvent].merged = true;
					events[innerEvent].delete = true;
					
				}
				
			}
			
		}
		
		// remove duplicates
		events = events.filter(value => {
			return !value.delete;
		});

		return events;

	}

	/**
	 * Collects the event summary and start datetime/date of the next 100 events in
	 * the authorized user's calendar that occur in the next two days.
	 * If no events are found a log message is printed.
	 */
	calendarService.listUpcomingEvents = function(callback) {

		// ensure Google Client library is loaded
		if (!gapi.client.calendar) {
			return callback();
		}

		// list of promises to get all calendar events
		var eventLists = [];

		// for each calendar get events
		for (calendarId in calendarService.calendars) {

			// Promise that contains state of request to get events for one calendar
			var eventList = new Promise((resolve, reject) => {

				composeRequest(calendars[calendarId].id).execute(function(resp) {

					// lookup prefix for calendar to associate event with calendar "owner"
					var participant = extractPrefix(calendarService.calendars, resp.summary);

					// parse all google calendar events to internal event structure
					var parsedEvents = parseResponse(resp.items, participant, calendars[calendarId].id);

					// if no exception occurred, the Promise is done
					resolve(parsedEvents);

				});

			});

			// add Promise for each calendar to list of Promises
			eventLists.push(eventList);

		}

		// wait until all calendars responses are parsed  
		Promise.all(eventLists).then(values => {

			var events = mergeEventsFromAllCalendars(values);

			events = filterEvents(events);

			sortEvents(events);

			events = mergeDuplicates(events);

			callback(events);

		});


	}


	return calendarService;

};

angular.module('calendar', []).controller('calendarCtrl', calendarCtrlDef).controller('timeCtrl', timeCtrlDef).factory('getCalendar', getCalendar);


// non-angular related code to auth Google Services

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {

	gapi.auth.authorize({
		'client_id': clientId,
		'scope': SCOPES.join(' '),
		'immediate': true
	}, handleAuthResult);
	
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {

	var authorizeDiv = document.getElementById('authorize-div');

	if (authResult && !authResult.error) {

		// Hide auth UI, then load client library.
		authorizeDiv.style.display = 'none';
		loadCalendarApi();

	} else {

		// Show auth UI, allowing the user to initiate authorization by
		// clicking authorize button.
		authorizeDiv.style.display = 'inline';

	}
	
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {

	gapi.auth.authorize({
			client_id: clientId,
			scope: SCOPES,
			immediate: false
		},
		handleAuthResult);
		
	return false;
	
}

/**
 * Load Google Calendar client library.
 */
function loadCalendarApi() {
	// third parameter is callback, but hard to integrate with Angular
	gapi.client.load('calendar', 'v3');
}