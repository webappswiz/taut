/*
 | Accounts Custom - Server methods
 */

// Server globals, available to common methods
VALID_OPTIONS_KEYS = [
	'globalAssets',
	'mergeAllowed'
];

_.extend( Accounts.custom, {
	/*
	 | Internal helpers
	 */
	_cleanUp: function ( attempt ) {
		if ( attempt.user && attempt.user.mergeWith ) {
			Meteor.call( KEY_PREFIX + 'unflagMergedUser', attempt.user._id );
		}
	},

	// Do the actual social service (account) merge with another user account
	_mergeService: function ( serviceName, serviceData, toUser ) {
		/* Account Merging
		 | ===============
		 |
		 | Several social service accounts can be merged into one system account
		 | (if allowed by 'mergeAllowed' flag).
		 |
		 | The Process
		 |
		 | When connecting new social service account, the system is creating a system
		 | account and if merging is initiated (client-side) we want to prevent logging
		 | out the current user and logging in with that social service, so we need to
		 | hook up to account creation process.
		 |
		 | Account merging process consists of these steps (if allowed):
		 |
		 | 1. Flag current user for merging by adding field 'mergeWith' (client-side)
		 |    containing:
		 |    - name of the service to be merged with
		 |    - current session (connection) ID
		 | 2. While creating new account, check if that's new social service account
		 |    meant to be merged with the current account and if it is, flag it by
		 |    adding the 'mergeWith' field containing:
		 |    - user ID of the account to be merged with
		 |    - current session (connection) ID
		 | 4. While validating new social service account login attempt, check for
		 |    matching 'mergeWith' fields and if positive:
		 |    - merge the new social service with the current user
		 |    - remove the new social service account
		 |    - deny the login attempt (in a nice way ;)
		 | 5. Unflag (remove the 'mergeWith' field) from the current user's account
		 |
		 */
		/* There are two accounts merging scenarios: */
		/* Scenario 1
		 | ==========
		 | We're validating the login attempt for the newly created social account
		 | meant to be merged with an existing account.
		 */
		/* Scenario 2
		 | ==========
		 | We're validating the login attempt for already existing social account
		 | which can't be merged.
		 */
		/* Unmerging
		 |
		 | Accounts can also be 'unmerged' - social service can be removed from the
		 | user's account.
		 */
		/* Known Issues
		 | ============
		 |
		 | Due to the very nature of various social services, following things are not
		 | implemented and there's no simple way of solving them:
		 |
		 | - automatic merging - there's no common denominator between various social
		 |                       services to allow for automagically merging;
		 |                       email is not a good choice as some services do not
		 |                       provide it at all, while another issue is that one user
		 |                       can register for various social services with different
		 |                       email accounts;
		 | - re-using accounts - if a user already signed up with one social account,
		 |                       (ie. Twitter) then decides to sign up with another
		 |                       social account (ie. Facebook), those accounts can not
		 |                       be merged together and will be treated as separate
		 |                       accounts.
		*/
		var self = this,
			updateData = {},
			oldUser = Meteor.users.findOne( toUser._id );

		if ( oldUser ) {
			// Add service to an existing user...
			_.each( serviceData, function ( value, key ) {
				updateData[ 'services.' + serviceName + '.' + key ] = value;
			});

			Meteor.users.update( toUser._id, {
				$set: updateData
			});

			// ...and set user's name (if not already set), as well as...
			if ( !( oldUser.profile && oldUser.profile.name ) ) {
				Meteor.users.update( toUser._id, {
					$set: {
						'profile.name': serviceData.name || ( serviceData.firstName + ' ' + serviceData.lastName )
					}
				});
			}

			// ...set user's email
			if ( serviceData.email && !_.contains( _.pluck( oldUser.emails, 'address' ), serviceData.email ) ) {
				Meteor.users.update( toUser._id, {
					$push: {
						emails: {
							address : serviceData.email,
							verified: true
						}
					}
				});
			}
		} else {
			// Add service to a new user...
			toUser.services[ serviceName ] = serviceData;

			if ( !( toUser.profile && toUser.profile.name ) ) {
				toUser.profile.name = serviceData.name || ( serviceData.firstName + ' ' + serviceData.lastName );
			}

			// ...set user's email
			if ( serviceData.email && !_.contains( _.pluck( toUser.emails, 'address' ), serviceData.email ) ) {
				toUser.emails.push({
					address : serviceData.email,
					verified: true
				});
			}
		}
	},

	/*
	 | Custom Hooks - can be replaced by user
	 | Called at the end of official Accounts.* hooks
	 */
	onCreateUser: function ( options, newUser ) {
		return newUser;
	},

	validateNewUser: function ( newUser ) {
		return newUser;
	},

	validateLoginAttempt: function ( attempt ) {
		return attempt.allowed;
	}
});

/*
 | Methods
 */
var meteorMethods = {};

// Connection ID helper
meteorMethods[ KEY_PREFIX + 'getConnectionId' ] = function () {
	if ( this.connection ) {
		return this.connection.id;
	}
};

// Social Services Sign Up helpers
meteorMethods[ KEY_PREFIX + 'prepareForSocialSignUp' ] = function ( serviceName ) {
	check( serviceName, String );

	SocialAccounts.insert({
		signUpWith: {
			serviceName : serviceName,
			connectionId: this.connection.id
		}
	});
};

// Send enrollment email helper
meteorMethods[ KEY_PREFIX + 'enrollUser' ] = function ( userData ) {
	check( userData, Object );

	var userId = Accounts.createUser( userData );

	if ( userId ) {
		// We'll wait for Meteor to create the user before sending an email
		Meteor.setTimeout( function () {
			Accounts.sendEnrollmentEmail( userId );
		}, 2 * 1000 );
	}
};

meteorMethods[ KEY_PREFIX + 'isUserConnectedWith' ] = function ( userId, serviceName ) {
	check( userId, Match.Any );
	check( serviceName, String );

	var user = ( userId ) ? Meteor.users.findOne( userId ) : Meteor.user(),
		service;

	if ( user && serviceName !== '' ) {
		service = user.services[ serviceName ];

		if ( service ) {
			if ( serviceName === 'password' ) {
				// Check if user registered with username/password
				// Make sure we only return boolean!
				return !!service.bcrypt;
			} else {
				return true;
			}
		}

		return false;
	}

	throw new Meteor.Error( 403, 'Wrong parameters.' );
};

// Account merge helpers
meteorMethods[ KEY_PREFIX + 'flagUserForMerge' ] = function ( userId, serviceName ) {
	check( userId, Match.Any );
	check( serviceName, String );

	Meteor.users.update( userId, {
		$set: {
			mergeWith: {
				serviceName : serviceName,
				connectionId: this.connection.id
			}
		}
	});
};

meteorMethods[ KEY_PREFIX + 'unflagMergedUser' ] = function ( userId ) {
	check( userId, Match.Any );

	Meteor.users.update( userId, {
		$unset: {
			mergeWith: {}
		}
	});
};

meteorMethods[ KEY_PREFIX + 'connectedServicesList' ] = function ( userId ) {
	// Reactive source but needs reactive method call on client!
	check( userId, Match.Any );

	var user = Meteor.users.find( userId, {
			fields: {
				services: 1
			}
		}),
		handle,
		handler = function () {
			return _.difference( _.keys( user.fetch()[ 0 ].services ), [ 'resume' ] );
		};

	if ( user ) {
		handle = user.observeChanges({
			changed: function ( id, changedUser ) {
				return handler();
			}
		});

		return handler();
	}

};

meteorMethods[ KEY_PREFIX + 'isSingleSocialService' ] = function ( userId, serviceName ) {
	// Reactive source but needs reactive method call on client!
	check( userId, Match.Any );
	check( serviceName, String );

	var services;

	if ( serviceName != 'password' && serviceName != 'resume' ) {
		services = Meteor.call( KEY_PREFIX + 'connectedServicesList', userId );

		return ( _.difference( services, [ serviceName.toString(), 'resume' ] ).length === 0 );
	}
};

meteorMethods[ KEY_PREFIX + 'removeSocialService' ] = function ( userId, serviceName ) {
	check( userId, Match.Any );
	check( serviceName, String );

	if ( serviceName === 'password' || serviceName === 'resume' ) {
		throw new Meteor.Error( 403, 'Can\'t disconnect internal service.' );
	}

	var user = Meteor.users.findOne( userId, {
			services: serviceName
		}),
		isSingleSocialService = Meteor.call(
			[ KEY_PREFIX + 'isSingleSocialService' ],
			userId,
			serviceName
		),
		updateData = {};

	if ( user ) {
		// Do not remove service if there's no other service left
		if ( !isSingleSocialService ) {
			updateData[ 'services.' + serviceName ] = {};

			Meteor.users.update( userId, {
				$unset: updateData
			});
		} else {
			throw new Meteor.Error( 403, 'Can\'t disconnect last service.' );
		}
	}

	// Log original user in (just in case...)
	this.setUserId( userId );
};

Meteor.methods( meteorMethods );

/*
 | Hooks
 */
Accounts.onCreateUser( function ( options, newUser ) {
	// We still want the default hook's 'profile' behavior...
	if ( options.profile ) newUser.profile = options.profile;

	if ( !newUser.profile ) newUser.profile = {};

	// ...but also to save the user's invite code.
	if ( options.invitationCode ) {
		newUser.profile.invitationCode = options.invitationCode;
	}

	if ( Accounts.custom.onCreateUser ) return Accounts.custom.onCreateUser( options, newUser );

	return newUser;
});

Accounts.validateNewUser( function ( newUser ) {
	var serviceName = _.keys( newUser.services )[ 0 ] || 'password',
		connectionId,
		oldUser,
		socialAccount,
		email;

	if ( serviceName !== 'password' ) {
		connectionId = Meteor.call( KEY_PREFIX + 'getConnectionId' );

		// Make sure we're working against the same session (connection)
		if ( connectionId ) {
			/*
			 | Check whether this is Sign In with Social Service without registering
			 | first. On the client we're setting a flag ('signUpWith') in
			 | 'SocialAccounts' collection to be checked against that criteria - if
			 | missing, we'll cancel account creation (and sign in)
			 */
			socialAccount = SocialAccounts.findOne({
				signUpWith: {
					serviceName : serviceName,
					connectionId: connectionId
				}
			});

			if ( socialAccount ) {
				// Clean up first
				SocialAccounts.remove( socialAccount._id );
				/*
				 | We're (ob)using this method because we don't want to do anything
				 | if any other validation (Invitation Code, ...) fails before(?)
				*/
				if ( Accounts.custom._isAccountsMergeAllowed() ) {
					// Is there a user flagged for merging with this service?
					oldUser = Meteor.users.findOne({
						mergeWith: {
							serviceName : serviceName,
							connectionId: connectionId
						}
					});

					if ( oldUser ) {
						/*
						 | Accounts merge - Scenario 1
						 */

						// Flag service for merging with old user
						newUser.services[ serviceName ].mergeWith = {
							userId      : oldUser._id,
							connectionId: connectionId
						};

						Meteor.users.update( oldUser._id, {
							$set: {
								mergeWith: {
									serviceUserId: newUser._id
								}
							}
						});
					}
				}
			} else {
				throw new Meteor.Error( 403, 'Not registered' );
			}
		}
	}

	if ( Accounts.custom.validateNewUser ) return Accounts.custom.validateNewUser( newUser );

	return true;
});

Accounts.validateLoginAttempt( function ( attempt ) {
	/*
	 | We're also (ob)using this method because we don't want to do anything
	 | if any other validation (Invitation Code, CreateUser,...) fails before(?)
	*/
	var serviceName = attempt.type,
		mergeWith = ( attempt.user && attempt.user.services ) ? attempt.user.services[ serviceName ].mergeWith : null,
		updateData = {},
		serviceData,
		oldUser;

	if ( attempt.allowed ) {
		if ( serviceName === 'password' ) {
			if (
				Accounts.custom._isEmailVerificationRequired() &&
				attempt.user && attempt.user.emails && attempt.user.emails.length > 0
			) {
				// Return true if verified email, abort otherwise.
				if ( !Accounts.custom._getVerifiedEmailFor( attempt.user ) ) {
					throw new Meteor.Error( 403, 'No valid email' );
				}
			}

			return true;
		} else {
			// Social Services

			// Is this an attempt to merge accounts?
			// (user is already signed in and is trying to add another account)
			if ( Accounts.custom._isAccountsMergeAllowed() ) {
				// Is there a user flagged for merging this social service?
				oldUser = Meteor.users.findOne({
					mergeWith: {
						serviceUserId: attempt.user._id
					}
				});

				if ( oldUser ) {
					/*
					 | Accounts merge - Scenario 1
					 */

					// Is this service flagged for merge?
					if ( mergeWith ) {
						// Is there a user flagged for merging this social service?
						if ( oldUser._id == mergeWith.userId ) {
							/*
							 | Let's rock!
							 */

							// Clean flag on current user
							Meteor.call( KEY_PREFIX + 'unflagMergedUser', oldUser._id );

							// Get the service data for cloning
							serviceData = _.clone( attempt.user.services[ serviceName ] );

							// And clean it as well
							delete serviceData.mergeWith;

							// Delete this social account - we need to do it to
							// prevent 'duplicate account' error while merging
							Meteor.users.remove( attempt.user._id );

							// Do the actual merging
							Accounts.custom._mergeService( serviceName, serviceData, oldUser );

							// Finally, cancel this login so we
							// don't log out the current user
							throw new Meteor.Error( 403, 'Login prevented' );
						}
					} else {
						/*
						 | Accounts merge - Scenario 2
						 */

						// No merge, this account existed before
						throw new Meteor.Error( 403, 'Existing account' );
					}
				}
			}
		}
	}

	if ( Accounts.custom.validateLoginAttempt ) return Accounts.custom.validateLoginAttempt( attempt );

	return attempt.allowed;
});

// Some clean-ups
Accounts.onLogin( Accounts.custom._cleanUp );
Accounts.onLoginFailure( Accounts.custom._cleanUp );

/*
 | Set up Social Accounts Management
 */
Meteor.publish( APP_PREFIX, function () {
	return SocialAccounts.find();
});

/*
 | Set up ServiceConfigurations
 |
 | Social Services Configuration can be done via 'accounts-ui' package or via
 | 'settings.json' file (see examples).
 |
 | After the configuration, the 'accounts-ui' package can be removed.
 */
if (
	Meteor.settings &&
	Meteor.settings.private &&
	Meteor.settings.private.serviceConfigurations
) {
	// Read Social Services Configuration from the 'settings.json' file
	_.each( Meteor.settings.private.serviceConfigurations, function ( serviceData, serviceName ) {
		ServiceConfiguration.configurations.upsert(
			{
				service: serviceName
			},
			{
				$set: serviceData
			}
		);
	});
}

/*
 | Set up Routing
 |
 | We need to alter the standard URLs to be able to custom process tokens
 */
Meteor.startup( function () {
	// Clean Up
	SocialAccounts.remove({});

	// Set up routes
	if ( Iron ) {
		var URL_KEYS = {
			'resetPassword': 'reset-password',
			'enrollAccount': 'enroll-account',
			'verifyEmail'  : 'verify-email'
		};

		// Iron Router Helper
		_.each( URL_KEYS, function ( value, key ) {
			Accounts.urls[ key ] = function ( token ) {
				return Meteor.absoluteUrl( value + '/' + token );
			};
		});
	}
});
