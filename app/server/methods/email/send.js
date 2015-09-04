/*****************************************************************************/
/* Email Server Methods */
/*****************************************************************************/
Meteor.methods({
	'Email.send': function ( options ) {
		check( options, Object );

		// to     : <recipient>,
		// from   : <sender>,
		// subject: <subject>,
		// text   : <content> ...

		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();

		Email.send( options );
	},

	// 'Email.sendSessionInvitation': function ( invitation ) {
	// 	check( invitation, Object );

	// 	CB.emails.sendSessionInvitation( invitation );
	// },

	'Email.sendSessionInvitation': function ( session ) {
		check( session, Object );

		CB.emails.sendSessionInvitation( session );
	},

	'Email.sendSessionAcceptance': function ( invitation ) {
		check( invitation, Object );

		CB.emails.sendSessionAcceptance( invitation );
	}
});
