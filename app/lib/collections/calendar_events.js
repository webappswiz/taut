// Create a new MongoDB collection for calendar events
CalendarEvents = new Mongo.Collection( 'calendarEvents' );

if ( Meteor.isServer ) {
	CalendarEvents.allow({
		insert: function ( userId, doc ) {
			return ( userId == Meteor.userId() );
		},

		update: function ( userId, doc, fieldNames, modifier ) {
			return ( userId == Meteor.userId() );
		},

		remove: function ( userId, doc ) {
			return ( userId == Meteor.userId() );
		}
	});

	CalendarEvents.deny({
		insert: function ( userId, doc ) {
			return ( userId != Meteor.userId() );
		},

		update: function ( userId, doc, fieldNames, modifier ) {
			return ( userId != Meteor.userId() );
		},

		remove: function ( userId, doc ) {
			return ( userId != Meteor.userId() );
		}
	});
}
