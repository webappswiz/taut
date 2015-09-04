var updateCalendar = function () {
		$( '#calendar' ).fullCalendar( 'refetchEvents' );
	},

	showModal = function ( calendarEventId ) {
		// Set the editingCalendarEvent variable to equal the calendarEvent.id
		Session.set( 'editingCalendarEvent', calendarEventId );
		// Set the showEditEvent variable to true
		Session.set( 'showEditEvent', true );
		// Trigger the modal bootstrap 3 box as defined in the calendar.html page
		// $( '#EditEventModal' ).modal( 'show' );
	},

	hideModal = function () {
		// Clear the editingCalendarEvent variable
		Session.set( 'editingCalendarEvent', null );
		// Set the showEditEvent variable to false
		Session.set( 'showEditEvent', false );
		// Trigger the modal bootstrap 3 box as defined in the calendar.html page
		$( '#EditEventModal' ).modal( 'hide' );
	};

Template.calendar.helpers({
	showEditEvent: function () {
		return Session.get( 'showEditEvent' );
	}
});

Template.calendar.onCreated( function () {
	// Set session defaults
	Session.setDefault( 'editingCalendarEvent', null );
	Session.setDefault( 'showEditEvent', false );
});

// Fullcalendar package
// As soon as the calendar renders, it has to execute this function
Template.calendar.rendered = function () {
	$( '#calendar' ).fullCalendar({
		header: {
			left  : 'title',
			// center: 'title',
			right : 'agendaDay,agendaWeek,month prev,today,next'
		},

		// Event triggered when someone clicks on a day in the calendar
		dayClick: function ( date, jsEvent, view ) {
			// Insert the day someone's clicked on
			if ( date.isBefore( moment() ) ) {
				alert( 'You can\'t schedule session in the past!');

				return false;
			}

			var calendarEventId = CalendarEvents.insert({
					owner       : Meteor.userId(),
					title       : 'New Session',
					price       : 0,
					start       : date.toDate(),
					end         : moment( date ).add( 1, 'hours' ).toDate(),
					type        : 'public',
					details     : 'Session description...',
					published   : false,
					cancelled   : false,
					maxAttendees: 6
				}, function ( error, result ) {
					if ( error ) {
						//
					} else {
						// Refreshes the calendar
						updateCalendar();

						showModal( calendarEventId );
					}
				});
		},

		eventClick: function ( calendarEvent, jsEvent, view ) {
			showModal( calendarEvent._id );
		},

		eventDrop: function ( calendarEvent ) {
			CalendarEvents.update( calendarEvent.id, {
				$set: {
					start: new Date( calendarEvent.start ),
					end  : new Date( calendarEvent.end )
				}
			});
			// Refreshes the calendar
			updateCalendar();
		},

		events: function ( start, end, timezone, callback ) {
			// Create an empty array to store the events
			var events = [];

			// Variable to pass events to the calendar
			// Gets us all of the calendar events and puts them in the array
			calendarEvents = CalendarEvents.find({
				owner: Meteor.userId()
			});
			// Do a for each loop and add what you find to events array
			calendarEvents.forEach( function ( event ) {
				events.push({
					id       : event._id,
					owner    : event.owner,
					title    : event.title,
					start    : new Date( event.start ),
					end      : new Date( event.end ),
					details  : event.details,
					cancelled: event.cancelled,
					published: event.published
				});
			})
			// Callback to pass events back to the calendar
			callback( events );
		},

		editable: true
	});
};

