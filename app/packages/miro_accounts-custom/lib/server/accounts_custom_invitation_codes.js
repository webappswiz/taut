/*
 | Accounts Custom - Sign Up with the Invitation Code (server-side!)
 */

var checkInvitationCode = function ( invitationCode ) {
		check( invitationCode, String );

		// Validate invitation code
		var code = InvitationCodes.findOne({
				code: invitationCode,
				uses: {
					$gt: 0
				}
			});

		if ( code ) {
			// Decrement the number of available uses
			InvitationCodes.update({
				code: invitationCode
			}, {
				$inc: {
					uses: -1
				}
			});

			// OK, let the poor soul in
			return true;
		}

		// Go away, nothing to be seen here!
		throw new Meteor.Error( '403', "Invalid invitation code" );
	};

/* Invitations Codes DB - Server only! */
/* To add new codes:
 |
 | - start the app
 | - start mongo ('meteor mongo')
 | - issue mongo command:
 |
 |   db.InvitationCodes.insert({ code: 'CODE123', uses: 50 })
 */
/* To modify codes:
 |
 | - start the app
 | - start mongo ('meteor mongo')
 | - issue mongo command:
 |
 |   db.InvitationCodes.update({ code: 'CODE123' }, { $set: { uses: 150 } })
 */
/* To remove codes:
 |
 | - start the app
 | - start mongo ('meteor mongo')
 | - issue mongo command:
 |
 |   db.InvitationCodes.remove({ code: 'CODE123' })
 */
InvitationCodes = new Meteor.Collection( 'InvitationCodes' );

// Set some security ;)
InvitationCodes.allow({
	insert: function () {
		return true;
	},
	update: function () {
		return true;
	},
	remove: function () {
		return true;
	}
});

Accounts.validateNewUser( function ( user ) {
	if ( user.profile.invitationCode ) return checkInvitationCode( user.profile.invitationCode );

	return true;
});
