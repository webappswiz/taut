var showModal = function ( calendarEventId ) {
		// Set the editingCalendarEvent variable to equal the calendarEvent.id
		Session.set( 'editingCalendarEvent', calendarEventId );
		// Set the showEditEvent variable to true
		Session.set( 'showEditEvent', true );
		// Trigger the modal bootstrap 3 box as defined in the calendar.html page
		// $( '#EditEventModal' ).modal( 'show' );
	};

Template.upcomingEvent.events({
	'click .news-title a': function ( event, template ) {
		event.preventDefault();
		// TODO: Remove id from element, we can get id from the current data
		var id = $( event.currentTarget ).attr( 'id' );

		if ( id ) showModal( id );
	},

	'click #joinSession': function ( event, template ) {
		event.preventDefault();

		var session = Sessions.find({
				invitationId: this._id
			}).fetch();

		if ( session.length ) Router.go( '/session/' + session[ 0 ]._id );
	}
});

Template.upcomingEvent.helpers({
	eventId: function () {
		return this._id;
	},

	eventTitle: function () {
		return this.title;
	},

	eventMonth: function () {
		return moment( this.start ).format( 'MMM' );
	},

	eventDay: function () {
		return moment( this.start ).format( 'D' );
	},

	eventTime: function () {
		var calEvent = this;

		return (
			moment( calEvent.start ).format( 'h:mm A' ) + ' - ' +
			moment( calEvent.end ).format( 'h:mm A' )
		);
	},

	eventType: function () {
		if ( this.type == 'group' ) {
			var attendees = ( this.attendees ) ? this.attendees.length : 0;

			return this.type + ' (' + attendees + '/' + this.maxAttendees + ')';
		} else {
			return this.type;
		}
	},

	maxAttendees: function () {
		return this.maxAttendees;
	},

	eventPrice: function () {
		return ( this.price > 0 ) ? '$' + this.price : 'Free' ;
	},

	isPublished: function () {
		return this.published;
	},

	isCancelled: function () {
		return this.cancelled;
	}
});

Template.upcomingEvent.created = function () {
},

Template.upcomingEvent.rendered = function () {
};
