var clearSession = function () {
		// Clear the editingCalendarEvent variable
		Session.set( 'editingCalendarEvent', null );
		// Set the showEditEvent variable to false
		Session.set( 'showEditEvent', false );
	};

Template.scheduledEventModal.events({
	'hidden.bs.modal #EditEventModal': function ( event ) {
		clearSession();
	}
});

Template.scheduledEventModal.rendered = function () {
	$( '#EditEventModal' ).modal( 'show' );
};

Template.scheduledEventModal.onDestroyed( function () {
	clearSession();
});
