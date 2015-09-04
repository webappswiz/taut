// Session Invitations

Meteor.publish( 'allSessionInvitations', function ( /* args */ ) {
	return SessionInvitations.find({});
});

