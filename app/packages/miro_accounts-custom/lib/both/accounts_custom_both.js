/*
 | Accounts Custom - Common (server & client) helper methods
 */
APP_PREFIX = 'AccountsCustom';
KEY_PREFIX = 'Accounts.custom.';

/*
 | Set up Social Accounts Management
 */
SocialAccounts = new Meteor.Collection( APP_PREFIX );

Accounts.custom = {
	/*
	 | Private helpers
	 */
	// These get set up with 'Accounts.custom.config()'
	_options: {},

	// And some of my internals, maybe useful to someone else as well...
	_isEmailVerificationRequired: function () {
		// NOTE: If enabled, it will send email automagically!
		// (accounts-password package, that is ;)
		return Accounts._options.sendVerificationEmail;
	},

	_isSignUpWithPasswordsAllowed: function () {
		return !Accounts._options.forbidClientAccountCreation;
	},

	_isAccountsMergeAllowed: function () {
		var self = this;

		return self._options.mergeAllowed;
	},

	_getMessageFor: function ( messageId, replacement ) {
		var self = this;

		if (
			self._options.messages &&
			self._options.messages[ messageId ]
		) {
			return {
				type   : self._options.messages[ messageId ].type,
				title  : self._options.messages[ messageId ].title,
				message: self._options.messages[ messageId ].message.replace(
					'%s', replacement ? replacement.replace( '-', ' ' ) : ''
				)
			};
		}
	},

	_getVerifiedEmailFor: function ( user ) {
		if ( user ) {
			var verifiedEmail = _.find( user.emails, function ( thisEmail ) {
				return thisEmail.verified;
			});

			if ( verifiedEmail ) return verifiedEmail.address;
		}
	},

	/*
	 | Public helpers
	 */
	capitalize: function ( string ) {
		return ( string ) ? string.charAt( 0 ).toUpperCase() + string.slice( 1 ) : '';
	},

	userFirstName: function ( user ) {
		var _user = user || Meteor.user();

		if ( _user ) {
			if ( _user.profile  ) {
				if ( _user.profile.firstName ) {
					return _user.profile.firstName;
				} else if ( _user.profile.name ) {
					return _user.profile.name;
				} else if ( _user.username ) {
					return _user.username;
				}
			}

			// If nothing else works(?)...
			return ( _user.emails && _user.emails[ 0 ] ) ? _user.emails[ 0 ].address : '';
		}
	},

	userName: function ( user ) {
		var _user = user || Meteor.user();

		if ( _user ) {
			if( _user.username ) {
				return _user.username;
			} else if ( _user.profile ) {
				if ( _user.profile.name ) {
					return _user.profile.name;
				} else if ( _user.profile.firstName || _user.profile.lastName ) {
					return _user.profile.firstName + ' ' + _user.profile.lastName;
				}
			}

			// If nothing else works(?)...
			return Accounts.custom.userFirstName( _user );
		}
	},

	templateHelpers: {
		capitalize: function ( string ) {
			return Accounts.custom.capitalize( string );
		},

		userFirstName: function ( user ) {
			return Accounts.custom.userFirstName( user );
		},

		userName: function ( user ) {
			return Accounts.custom.userName( user );
		}
	},

	config: function ( options ) {
		var self = this;

		// Validate options keys and import only validated
		_.each( _.keys( options ), function ( key ) {
			// VALID_OPTIONS_KEYS set separately for server and client
			if ( _.contains( VALID_OPTIONS_KEYS, key ) ) {
				self._options[ key ] = _.defaults( options[ key ], self._options[ key ] );
			}
		});

		Meteor.startup( function () {
			_.each( self.templateHelpers, function ( helper, key ) {
				Template.registerHelper( key, helper );
			});
		});
	}
};
