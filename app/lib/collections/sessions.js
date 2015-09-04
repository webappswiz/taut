// Create a new MongoDB collection for sessions
Sessions = new Mongo.Collection( 'sessions' );

if ( Meteor.isServer ) {
	Sessions.allow({
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

	Sessions.deny({
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
