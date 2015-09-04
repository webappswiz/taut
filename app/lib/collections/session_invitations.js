// Create a new MongoDB collection for session invitations
SessionInvitations = new Mongo.Collection( 'sessionInvitations' );

if ( Meteor.isServer ) {
	SessionInvitations.allow({
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

	SessionInvitations.deny({
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
