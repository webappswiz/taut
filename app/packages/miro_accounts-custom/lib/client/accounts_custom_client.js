/*
 | Accounts Custom - Client methods
 */

// Client globals, available to common methods
VALID_OPTIONS_KEYS = [
	'mergeAllowed',
	'messages',
	'buttons'
];

/*
 | Local (private) helpers
 */
var setSession = function ( key, value ) {
		var loggingInWithPassword = !Meteor.user() && !!Meteor.loginWithPassword;

		if ( key === 'showSignUp' ) {
			if ( value ) {
				Session.set( KEY_PREFIX + 'showSignIn', !value && loggingInWithPassword );
			}

			Session.set( KEY_PREFIX + key, value && loggingInWithPassword );
		} else if ( key === 'showSignIn' ) {
			if ( value ) {
				Session.set( KEY_PREFIX + 'showSignUp', !value && loggingInWithPassword );
			}

			Session.set( KEY_PREFIX + key, value && loggingInWithPassword );
		} else {
			Session.set( KEY_PREFIX + key, value );
		}
	},

	getSession = function ( key ) {
		return Session.get( KEY_PREFIX + key );
	},

	clearSession = function ( key ) {
		Session.set( KEY_PREFIX + key, null );
		// IDEA: Maybe we need to clean these too?
		// delete Session.keyDeps[ KEY_PREFIX + key ];
		// delete Session.keyValueDeps[ KEY_PREFIX + key ];
		delete Session.keys[ KEY_PREFIX + key ];
	},

	unsetSession = function ( keys ) {
		if ( keys ) {
			if ( typeof keys == 'string' ) {
				keys = [ keys ];
			}

			_.map( keys, function ( key ) {
				clearSession( key );
			});
		} else {
			_.map( Session.keys, function ( value, key ) {
				if ( key.indexOf( KEY_PREFIX ) === 0 ) {
					clearSession( key.substring( KEY_PREFIX.length ) );
				}
			});
		}
	},

	showMessage = function ( messageId, replacement ) {
		setSession( 'message', Accounts.custom._getMessageFor( messageId, replacement ) );
	},

	clearMessage = function ( event ) {
		if ( event ) {
			event.preventDefault();
			event.stopPropagation();
		}

		setSession( 'message', { type: 'hidden' });
	},

	showLoading = function ( show ) {
		setSession( 'showLoading', show );

		setSession( 'loading',
			show ?
				Accounts.custom._getMessageFor( 'loading' )
			:
				{ type: 'hidden', message: '' }
		);
	},

	clickShowSignIn = function ( event, template, templateName ) {
		clearMessage();

		setSession( 'showSignIn', true );

		unsetSession( templateName );

		return false;
	},

	clickShowSignUp = function ( event, template, templateName ) {
		clearMessage();

		setSession( 'showSignUp', true );

		unsetSession( templateName );

		return false;
	},

	areSocialServicesShown = function () {
		return Accounts.loginServicesConfigured() && (
			( Meteor.user() && Accounts.custom._options.mergeAllowed ) || (
				!Meteor.user() && !(
					getSession( 'showSetPassword' ) ||
					getSession( 'showForgotPassword' ) ||
					getSession( 'showResetPassword' )
				)
			)
		);
	},

	isSeparatorShown = function () {
		return (
			!getSession( 'signedUpWith' ) &&
			!getSession( 'signedInWith' ) &&
			areSocialServicesShown() && (
				isSignUpShown() ||
				isSignInShown()
			)
		);
	},

	isSignInShown = function () {
		// Show [ username/email ] + [ password ] fields
		// only if 'accounts-password' package is installed
		return Meteor.loginWithPassword && getSession( 'showSignIn' );
	},

	isSignUpShown = function () {
		// Show u[ sername/email ] + [ password ] + [ confirm password ]
		// fields only if 'accounts-password' package installed
		return Meteor.loginWithPassword && getSession( 'showSignUp' );
	},

	setChangePasswordShown = function () {
		// Show [ old password ] + [ new password ] + [ confirm password ] fields only
		// if user had already signed up with username/password
		Meteor.call( KEY_PREFIX + 'isUserConnectedWith', Meteor.userId(), 'password', function ( error, result ) {
			setSession( 'showChangePassword', result );
		});
	},

	trimInput = function ( value ) {
		return value.replace( /^\s*|\s*$/g, '' );
	},

	isNotEmpty = function ( value ) {
		if ( value && trimInput( value ) !== '' ) return true;

		showMessage( 'missingData' );

		return false;
	},

	isValidEmail = function ( value ) {
		if ( isNotEmpty( value ) ) {
			var filter = /^([ a-zA-Z0-9_\.\- ])+\@(([ a-zA-Z0-9\- ])+\.)+([ a-zA-Z0-9 ]{2,})+$/;

			if ( filter.test( value ) ) return true;

			showMessage( 'invalidEmail' );

			return false;
		}

		return false;
	},

	isValidUsername = function ( username ) {
		if ( isNotEmpty( username ) && username.length >= 2 ) return true;

		showMessage( 'invalidUsername' );

		return false;
	},

	isValidPassword = function ( password ) {
		if ( isNotEmpty( password ) && password.length >= 6 ) return true;

		showMessage( 'invalidPassword' );

		return false;
	},

	isValidInvitationCode = function ( invitationCode ) {
		if ( isNotEmpty( invitationCode ) && invitationCode.length >= 4 ) return true;

		showMessage( 'invalidInviteCode' );

		return false;
	},

	areMatchingPasswords = function ( password, passwordConfirm ) {
		if ( isValidPassword( password ) && isValidPassword( passwordConfirm ) ) {
			if ( password === passwordConfirm ) return true;

			showMessage( 'passwordMismatch' );
		}

		return false;
	},

	loginServicesList = function () {
		var services = [],
			serviceNames;

		if ( Accounts.oauth && Accounts.loginServicesConfigured() ) {
			serviceNames = Accounts.oauth.serviceNames();

			if ( serviceNames.length ) {
				_.each( serviceNames, function ( serviceName ) {
					if ( !(
							// User shouldn't see unconfigured services!
							Meteor.userId() &&
							// Services should be configured before production!!!
							!isLoginServiceConfigured( serviceName )
						)
					) {
						services.push( serviceName );
					}
				});
			}
		}

		return services;
	},

	isLoginServiceConfigured = function ( serviceName ) {
		return ServiceConfiguration.configurations.find({
			service: serviceName.toString()
		}).fetch().length > 0;
	},

	isLoginServiceConnected = function ( serviceName ) {
		var user = Meteor.user();

		if ( user && user.services ) return !!user.services[ serviceName.toString() ];
	},

	isLoginServiceSingle = function ( serviceName ) {
		Meteor.call( KEY_PREFIX + 'isLoginServiceSingle', Meteor.userId(), serviceName, function ( error, result ) {
			if ( error ) {
				// Handle error...
			} else {
				return result;
			}
		});
	},

	// Placeholders (to be replaced with callbacks)
	resetPasswordHook = function () {},

	enrollAccountHook = function () {};

// Hide all panels on load
showLoading( true );

// Set up Social Accounts Management
Meteor.subscribe( APP_PREFIX );

_.extend( Accounts.custom, {
	// Internal helpers
	_getButtonTitleFor: function ( buttonTitleId, replacement ) {
		var self = this;

		if (
			self._options.buttons &&
			self._options.buttons[ buttonTitleId ]
		) {
			return self._options.buttons[ buttonTitleId ].title.replace(
				'%s', replacement ? replacement.replace( '-', ' ' ) : ''
			);
		}
	},

	// Externally available helpers to be called from the app (Iron.Router,...)
	resetPassword: function ( token, callDone ) {
		resetPasswordHook = function () {
			showMessage( 'resetPasswordSuccess' );

			unsetSession( 'tokens.resetPassword' );
			unsetSession( 'showResetPassword' );

			callDone();
		};

		if ( Meteor.userId() ) Meteor.logout( /* callback */ );

		setSession( 'tokens.resetPassword', token );
		setSession( 'showResetPassword', !!token );
	},

	enrollAccount: function ( token, callDone ) {
		enrollAccountHook = function () {
			showMessage( 'setPasswordSuccess' );

			unsetSession( 'tokens.setPassword' );
			unsetSession( 'showSetPassword' );

			callDone();
		};

		if ( Meteor.userId() ) Meteor.logout( /* callback */ );

		setSession( 'tokens.setPassword', token );
		setSession( 'showSetPassword', !!token );
	},

	verifyEmail: function ( token, callDone ) {
		var self = this;

		if ( Meteor.userId() ) Meteor.logout( /* callback */ );

		Accounts.verifyEmail( token, function ( error ) {
			if ( error ) {
				showMessage( 'verifyEmailError' );
			} else {
				var user = Meteor.user();

				unsetSession( 'tokens.emailVerification' );

				if ( !self._isSignUpWithPasswordsAllowed() ) {
					// User should be logged in by now!
					setSession( 'showSetPassword', user._id );

					Meteor.logout();
				} else {
					showMessage( 'verifyEmailSuccess' );
				}
			}

			setSession( 'showSignIn', !!token );

			callDone();
		});
	},

	signOut: function () {
		showLoading( true );

		Meteor.logout( function () {
			showMessage( 'signOut' );

			unsetSession( /* ALL */ );

			setSession( 'showSignIn', true );

			showLoading( false );
		});
	},

	// Hook called when user signs up with social service
	onSignUpWithSocialService: function ( service ) {
		var self = this;

		console.info( self._getMessageFor( 'signUpSocial', self.capitalize( service ) ).message );
	},

	// Hook called when user signs in with social service
	onSignInWithSocialService: function ( service ) {
		var self = this;

		console.info( self._getMessageFor( 'signInSocial', self.capitalize( service ) ).message );
	},

	// Hook called when user wants to disconnect a social service
	onRemoveSocialService: function ( service ) {
		var self = this;

		// Action can be aborted by returning a falsy value or throwing an exception.
		return window.confirm( self._getMessageFor( 'removeSocial', self.capitalize( service ) ).message );
	}
});

/*
 | Initialize system hooks
 |
 | These get called automatically from accounts-core if Iron.Router is *NOT*
 | used; otherwise they should be called manually, for example from route
 | controller
 */
Accounts.onResetPasswordLink( Accounts.custom.resetPassword );

Accounts.onEnrollmentLink( Accounts.custom.enrollAccount );

Accounts.onEmailVerificationLink( Accounts.custom.verifyEmail );

// Finally, initialize
Meteor.startup( function () {
	// Check for 'accounts-password' package and registered social login services
	if ( !Meteor.loginWithPassword && loginServicesList().length === 0 ) {
		showMessage( 'configError' );
	} else {
		setChangePasswordShown();
		setSession( 'showSignIn', !( Meteor.user() || Meteor.loggingIn() ) );
	}

	// Main Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX ] ) ) {
		// Register global template helper
		Template.registerHelper( APP_PREFIX, function () {
			return {
				// Tokens
				tokens: {
					setPassword      : getSession( 'tokens.setPassword' ),
					resetPassword    : getSession( 'tokens.resetPassword' ),
					emailVerification: getSession( 'tokens.emailVerification' )
				},

				// Messages
				loading: getSession( 'loading' ) || {},
				message: getSession( 'message' ) || {},

				// Flags
				signUpWithPasswordsAllowed: Accounts.custom._isSignUpWithPasswordsAllowed,

				// Main
				showSignUp: isSignUpShown,
				showSignIn: isSignInShown,

				// Social Services
				showSocialServices: areSocialServicesShown,
				loginServices     : loginServicesList,
				mergingAccounts   : getSession( 'mergingAccounts' ),

				showSeparator     : isSeparatorShown,

				// Flags
				showLoading       : getSession( 'showLoading' ),
				showSetPassword   : getSession( 'showSetPassword' ),
				showChangePassword: getSession( 'showChangePassword' ),
				showForgotPassword: getSession( 'showForgotPassword' ),
				showResetPassword : getSession( 'showResetPassword' )
			};
		});
	}

	// Message Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'Message' ] ) ) {
		Template[ APP_PREFIX + 'Message' ].helpers({
			message: function () {
				return getSession( 'message' ) || {};
			}
		});

		Template[ APP_PREFIX + 'Message' ].events({
			'click button.close': function ( event, template ) {
				clearMessage( event );
			}
		});
	}

	// Loading Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'Loading' ] ) ) {
		Template[ APP_PREFIX + 'Loading' ].helpers({
			loading: function () {
				return getSession( 'loading' ) || {};
			}
		});
	}

	// Social Services Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SocialServices' ] ) ) {
		Template[ APP_PREFIX + 'SocialServices' ].helpers({
			showSocialServices: areSocialServicesShown,
			showSeparator     : isSeparatorShown,
			loginServices     : loginServicesList
		});
	}

	// Social Service Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SocialService' ] ) ) {
		Template[ APP_PREFIX + 'SocialService' ].helpers({
			configured: function () {
				return isLoginServiceConfigured( this ) ? '' : ' unconfigured';
			},

			connected: function () {
				return isLoginServiceConnected( this ) ? ' connected' : '';
			},

			disabled: function () {
				var serviceName = this.toString();

				return ( isLoginServiceSingle( serviceName ) ) ? ' disabled' : '';
			},

			signup: function () {
				return getSession( 'showSignUp' ) ? ' signup' : '';
			},

			buttonText: function () {
				var self = Accounts.custom,
					serviceName = this.toString();

				if ( isLoginServiceConfigured( serviceName ) ) {
					if ( Meteor.user() ) {
						if ( isLoginServiceConnected( serviceName ) ) {
							if ( isLoginServiceSingle( serviceName ) ) {
								return self._getButtonTitleFor(
									'socialSingle',
									self.capitalize( serviceName )
								);
							} else {
								return self._getButtonTitleFor(
									'socialConnected',
									self.capitalize( serviceName )
								);
							}
						} else {
							return self._getButtonTitleFor(
								'socialConnect',
								self.capitalize( serviceName )
							);
						}
					} else if ( getSession( 'showSignUp' ) ) {
						return self._getButtonTitleFor(
							'socialSignUp',
							self.capitalize( serviceName )
						);
					} else {
						return self._getButtonTitleFor(
							'socialSignIn',
							self.capitalize( serviceName )
						);
					}
				} else {
					return self._getButtonTitleFor(
						'socialConfigure',
						self.capitalize( serviceName )
					);
				}
			},

			icon: function () {
				var service = this.toString();

				switch ( service ) {
					case 'meteor-developer':
						return 'rocket';
					case 'google':
						return 'google-plus';
					default:
						return service;
				}
			}
		});

		Template[ APP_PREFIX + 'SocialService' ].events({
			// TODO: Remove Accounts.ui dependency(?)
			'click .btn': function ( event, template ) {
				clearMessage( event );

				var userId = ( Meteor.userId() ) ? Meteor.userId().toString() : null,
					options = {},
					isSignUp = userId || $( event.target ).hasClass( 'signup' ),
					connected = $( event.target ).hasClass( 'connected' ),
					serviceName = $( event.target ).attr( 'id' ).replace( 'accounts-custom-social-service-', '' ),

					callback = function ( error ) {
						if ( error && error.reason !== 'Login prevented' ) {
							if (
								// In case user has not signed up with that social
								// service, we're preventing logging in with that service
								error.message === 'No matching login attempt found' ||
								error.reason === 'Not registered'
							) {
								showMessage( 'socialNoMatchingLogin' );
							} else if ( error.reason === 'Existing account' ) {
								// In case of successful social service merging,
								// we're preventing logging in with that service
								showMessage( 'socialExists' );
							} else if ( error instanceof Accounts.LoginCancelledError ) {
								// User canceled the logging in
							} else {
								// Check if service can be configured
								// via accounts-ui package (if installed)
								if ( Accounts.ui ) {
									if ( error instanceof ServiceConfiguration.ConfigError ) {
										// OK, configure service via accounts-ui
										Accounts._loginButtonsSession.configureService( serviceName );
									} else {
										// Something else went wrong
										showMessage( 'signinError' );

										Accounts._loginButtonsSession.errorMessage( error.reason || 'error.unknown' );
									}
								} else {
									// Hey, either install accounts-ui, or
									// configure services via settings.json
									// (see docs)
									showMessage( 'noAccountsUi' );
								}
							}
						} else {
							// We're rockin'!
							if ( isSignUp ) {
								if ( Accounts.custom.onSignUpWithSocialService ) {
									Accounts.custom.onSignUpWithSocialService( serviceName );
								}

								setSession( 'signedUpWith', serviceName );

								showMessage( 'signupSuccess', Accounts.custom.userName() );
							} else {
								// Sign In
								if ( Accounts.custom.onSignInWithSocialService ) {
									Accounts.custom.onSignInWithSocialService( serviceName );
								}

								setSession( 'signedInWith', serviceName );

								showMessage( 'signinSuccess', Accounts.custom.userName() );
							}
						}

						showLoading( false );
					},

					loginWithSocialService = function () {
						var self = Accounts.custom;

						if ( serviceName === 'meteor-developer' ) {
							loginWithService = Meteor.loginWithMeteorDeveloperAccount;
						} else {
							loginWithService = Meteor[ 'loginWith' + self.capitalize( serviceName ) ];
						}

						if ( Accounts.ui ) {
							// Some additional options
							// Again, if using accounts-ui package only
							// TODO: Maybe put those in settings.json or in
							// Accounts.custom.config...(?)
							if (
								Accounts.ui._options.requestPermissions &&
								Accounts.ui._options.requestPermissions[ serviceName ]
							) {
								options.requestPermissions = Accounts.ui._options.requestPermissions[ serviceName ];
							}

							if (
								Accounts.ui._options.requestOfflineToken &&
								Accounts.ui._options.requestOfflineToken[ serviceName ]
							) {
								options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[ serviceName ];
							}
						}

						if ( userId && self._isAccountsMergeAllowed() ) {
							// Initiate accounts merging by setting some flags on current user
							Meteor.call( KEY_PREFIX + 'flagUserForMerge', userId, serviceName, function ( error ) {
								// We're just updating DB record, so there shouldn't
								// be any errors, but anyways...
								if ( error ) {
									showMessage( 'socialError' );
								} else {
									loginWithService( options, callback );
								}
							});
						} else {
							// Just Sign Up/In
							loginWithService( options, callback );
						}
					},

					loginWithService;

				if ( connected ) {
					// If already connected, allow service to be disconnected
					if ( Accounts.custom.onRemoveSocialService( serviceName ) ) {
						setSession( 'mergingAccounts', true );

						Meteor.call( KEY_PREFIX + 'removeSocialService', userId, serviceName, function ( error ) {
							if ( error ) {
								// If there's no password service, we cannot
								// disconnect the last social service
								if ( error.reason === 'Can\'t disconnect last service.' ) {
									showMessage( 'removeSocialLast' );
								} else {
									showMessage( 'socialError' );
								}
							}

							unsetSession( 'mergingAccounts' );
						});
					}
				} else {
					showLoading( true );

					if ( isSignUp ) {
						Meteor.call( KEY_PREFIX + 'prepareForSocialSignUp', serviceName, function ( error, result ) {
							if ( error ) {
								showLoading( false );
							} else {
								loginWithSocialService();
							}
						});
					} else {
						loginWithSocialService();
					}
				}

				return false;
			}
		});
	}

	// Sign Up Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SignUp' ] ) ) {
		Template[ APP_PREFIX + 'SignUp' ].events({
			'submit #signUpForm': function ( event, template ) {
				clearMessage( event );

				var username = template.find( '#username' ),
					user = { email: template.find( '#email' ).value.toLowerCase() },
					// Invitation Code required?
					invitationCode = template.find( '#invitationCode' ),

					callBack = function ( error ) {
						// Ignore email verification during sign up
						if ( error && error.reason !== 'No valid email' ) {
							switch ( error.reason ) {
								case ( 'Email already exists.' ):
									showMessage( 'existingEmail' );
									break;
								case ( 'Username already exists.' ):
									showMessage( 'existingUsername' );
									break;
								case ( 'Invalid invitation code' ):
									showMessage( 'invalidInviteCode' );
									break;
								default:
									showMessage( 'signupError' );
							}
						} else {
							if ( Accounts.custom._isSignUpWithPasswordsAllowed() ) {
								// User is logged in!
								if ( Accounts.custom._isEmailVerificationRequired() ) {
									// No fun this time, verify user's email first!
									Meteor.logout( function () {
										showMessage( 'signupEmail' );

										setSession( 'showSignIn', true );
									});
								} else {
									showMessage( 'signupSuccess' );
								}
							} else {
								showMessage( 'signupEmail' );

								setSession( 'showSignIn', true );
							}
						}

						showLoading( false );
					};

				if ( username ) {
					username = username.value;

					if ( isValidUsername( username ) ) {
						user.username = username;
					}
				}

				if ( isValidEmail( user.email ) ) {
					if ( invitationCode ) {
						invitationCode = invitationCode.value;

						if ( isValidInvitationCode( invitationCode ) ) {
							user.invitationCode = invitationCode;
						} else {
							// Cancel Sign Up
							return false;
						}
					}

					if ( Accounts.custom._isSignUpWithPasswordsAllowed() ) {
						user.password = template.find( '#password' ).value;

						if ( areMatchingPasswords( user.password, template.find( '#passwordConfirm' ).value ) ) {
							showLoading( true );

							Accounts.createUser( user, callBack );
						}
					} else {
						showLoading( true );

						Meteor.call( KEY_PREFIX + 'enrollUser', user, callBack );
					}
				}

				return false;
			},

			'click #showSignIn': function ( event, template ) {
				clearMessage();

				setSession( 'showSignIn', true );

				return false;
			},

			'click #showForgotPassword': function ( event, template ) {
				clearMessage();

				// unsetSession( 'showSignUp' );
				setSession( 'showForgotPassword', true );

				return false;
			}
		});
	}

	// Sign In Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SignIn' ] ) ) {
		Template[ APP_PREFIX + 'SignIn' ].events({
			'submit #signInForm': function ( event, template ) {
				clearMessage( event );

				// Meteor (accounts-password) supports signing in with
				// either username or email, so we'll support that too
				var username = template.find( '#email' ).value,
					email = username ? username.toLowerCase() : null,
					isValidatedEmail = isValidEmail( email ),
					password = template.find( '#password' ).value;

				if (
					( isValidatedEmail || isValidUsername( username ) ) &&
					isValidPassword( password )
				) {
					// In case we're signing in with username,
					// hide the 'invalid email' message
					clearMessage();

					showLoading( true );

					Meteor.loginWithPassword(
						isValidatedEmail ? email : username,
						password,

						function ( error ) {
							if ( error ) {
								showMessage( 'signinError' );
							} else {
								setSession( 'signedInWith', 'password' );

								unsetSession( 'showSignIn' );

								showMessage( 'signinSuccess', Accounts.custom.userName() );
							}

							showLoading( false );
						}

					);
				}

				return false;
			},

			'click #showSignUp': function ( event, template ) {
				clearMessage();

				setSession( 'showSignUp', true );

				return false;
			},

			'click #showForgotPassword': function ( event, template ) {
				clearMessage();

				setSession( 'showForgotPassword', true );
				// unsetSession( 'showSignIn' );

				return false;
			}
		});
	}

	// Sign Out Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SignOut' ] ) ) {
		// Template[ APP_PREFIX + 'SignOut' ].helpers({
		// 	userName: Accounts.custom.userName
		// });

		Template[ APP_PREFIX + 'SignOut' ].events({
			'click #signOut': function ( event, template ) {
				clearMessage( event );

				Accounts.custom.signOut();

				return false;
			}
		});
	}

	// Change Password Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'ChangePassword' ] ) ) {
		Template[ APP_PREFIX + 'ChangePassword' ].events({
			'submit #changePasswordForm': function ( event, template ) {
				clearMessage( event );

				var passwordOld = template.find( '#passwordOld' ),
					passwordNew = template.find( '#passwordNew' ),
					// In case there's no password confirmation field
					passwordConfirm = template.find( '#passwordConfirm' ) || password;

				if (
					isValidPassword( passwordOld.value ) &&
					areMatchingPasswords( passwordNew.value, passwordConfirm.value )
				) {
					showLoading( true );

					Accounts.changePassword( passwordOld.value, passwordNew.value, function ( error ) {
						if ( error ) {
							if ( error.reason === 'Incorrect password' ) {
								showMessage( 'changeIncorrectPassword' );
							} else {
								showMessage( 'changePasswordError' );
							}
						} else {
							// Clear the input fields
							$( passwordOld ).val( '' );
							$( passwordNew ).val( '' );
							$( passwordConfirm ).val( '' );

							showMessage( 'changePasswordSuccess' );
						}

						showLoading( false );
					});
				}

				return false;
			}
		});
	}

	// Forgot Password Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'ForgotPassword' ] ) ) {
		Template[ APP_PREFIX + 'ForgotPassword' ].events({
			'submit #forgotPasswordForm': function ( event, template ) {
				clearMessage( event );

				var email = template.find( '#email' ).value.toLowerCase();

				if ( isValidEmail( email ) ) {

					showLoading( true );

					Accounts.forgotPassword({
						email: email
					}, function ( error ) {
						if ( error ) {
							if ( error.reason === 'User not found' ) {
								showMessage( 'wrongEmail' );
							} else {
								showMessage( 'recoverPasswordError' );

								unsetSession( 'showForgotPassword' );

								setSession( 'showSignIn', true );
							}
						} else {
							showMessage( 'recoverPasswordSuccess' );

							unsetSession( 'showForgotPassword' );

							setSession( 'showSignIn', true );
						}

						showLoading( false );
					});
				}

				return false;
			},

			'click #showSignIn': function ( event, template ) {
				return clickShowSignIn( event, template, 'showForgotPassword' );
			},

			'click #showSignUp': function ( event, template ) {
				return clickShowSignUp( event, template, 'showForgotPassword' );
			}
		});
	}

	// Set Password Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'SetPassword' ] ) ) {
		Template[ APP_PREFIX + 'SetPassword' ].events({
			'submit #setPasswordForm': function ( event, template ) {
				clearMessage( event );

				var password = template.find( '#password' ).value,
					passwordConfirm = template.find( '#passwordConfirm' ).value;

				if ( areMatchingPasswords( password, passwordConfirm ) ) {

					showLoading( true );

					Accounts.resetPassword( getSession( 'tokens.setPassword' ), password, function ( error ) {
						if ( error ) {
							if ( error.reason === 'Token expired' ) {
								showMessage( 'setTokenExpired' );
							} else {
								showMessage( 'setPasswordError' );
							}

							unsetSession( 'showSetPassword' );

							setSession( 'showSignIn', true );
						} else {
							// User is logged in!
							var user = Meteor.user();

							enrollAccountHook();
						}

						showLoading( false );
					});
				}

				return false;
			},

			'click #showSignIn': function ( event, template ) {
				return clickShowSignIn( event, template, 'showSetPassword' );
			},

			'click #showSignUp': function ( event, template ) {
				return clickShowSignUp( event, template, 'showSetPassword' );
			}
		});
	}

	// Reset Password Template Helpers & Events Handlers
	if ( Blaze.isTemplate( Template[ APP_PREFIX + 'ResetPassword' ] ) ) {
		Template[ APP_PREFIX + 'ResetPassword' ].events({
			'submit #resetPasswordForm': function ( event, template ) {
				clearMessage( event );

				var password = template.find( '#password' ).value,
					passwordConfirm = template.find( '#passwordConfirm' ).value;

				if ( areMatchingPasswords( password, passwordConfirm ) ) {

					showLoading( true );

					Accounts.resetPassword( getSession( 'tokens.resetPassword' ), password, function ( error ) {
						if ( error ) {
							if ( error.reason === 'Token expired' ) {
								showMessage( 'resetTokenExpired' );
							} else {
								showMessage( 'resetPasswordError' );
							}

							unsetSession( 'showResetPassword' );

							setSession( 'showSignIn', true );
						} else {
							resetPasswordHook();
						}

						showLoading( false );
					});
				}

				return false;
			},

			'click #showSignIn': function ( event, template ) {
				return clickShowSignIn( event, template, 'showResetPassword' );
			},

			'click #showSignUp': function ( event, template ) {
				return clickShowSignUp( event, template, 'showResetPassword' );
			}
		});
	}
});
