/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend( CB, {

	templateHelpers: {
		userPicture: function ( user ) {
			var forUser = user || Meteor.user();

			if ( forUser ) return forUser.profile.pictureUrl;
		},

		userInitials: function ( user ) {
			var forUser = user || Meteor.user();

			if ( forUser ) return Avatar.getInitials( forUser );
		},

		userName: function ( user ) {
			var forUser = user || Meteor.user();

			if ( forUser ) return Accounts.custom.userName( forUser );
		}
	},

	init: function () {
		var self = this;

		_.each( self.templateHelpers, function ( helper, key ) {
			Template.registerHelper( key, helper );
		});
	},

	emails: {
		send: function ( options, callback ) {
			Meteor.call( 'Email.send', options, function ( error, result ) {
				if ( error ) {
					// Handle error
				} else {
					// Everything OK
				}
			});
		}
	}
});

CB.init();
