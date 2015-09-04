AccountController = HomeController.extend({
	onBeforeAction: function () {
		var self      = this,
			routeName = self.route.getName(),
			token     = self.params.token,

			tokenHandler = function ( token ) {
				// Cancel current route...
				self.stop();
				// ...and continue to the backend
				self.redirect( '/account' );
			};

		switch ( routeName ) {
			case 'account':
				// Hide Sign In form until the route finishes loading
				Session.set( 'Accounts.custom.showSignIn', true );
				// Hide Sign Up form as well until the route finishes loading
				Session.set( 'Accounts.custom.showSignUp', false );
				// Clear current message (if any)
				Session.set( 'Accounts.custom.message', {
					type: 'hidden'
				});

				break;

			case 'login':
				// Hide Sign In form until the route finishes loading
				Session.set( 'Accounts.custom.showSignIn', true );
				// Hide Sign Up form as well until the route finishes loading
				Session.set( 'Accounts.custom.showSignUp', false );
				// Clear current message (if any)
				Session.set( 'Accounts.custom.message', {
					type: 'hidden'
				});

				break;

			case 'signup':
				// Hide Sign In form until the route finishes loading
				Session.set( 'Accounts.custom.showSignIn', false );
				// Hide Sign Up form as well until the route finishes loading
				Session.set( 'Accounts.custom.showSignUp', true );
				// Clear current message (if any)
				Session.set( 'Accounts.custom.message', {
					type: 'hidden'
				});

				break;

			case 'resetPassword':
				if ( token ) {
					Accounts.custom.resetPassword( token, tokenHandler );
				}

				break;

			case 'enrollAccount':
				if ( token ) {
					Accounts.custom.enrollAccount( token, tokenHandler );
				}

				break;

			case 'verifyEmail':
				if ( token ) {
					Accounts.custom.verifyEmail( token, tokenHandler );
				}

				break;

			case 'profile':
				if ( !self.params.userId ) this.redirect( 'trainers' );

				break;

			case 'myProfile':
				if ( !Meteor.userId() ) this.redirect( 'trainers' );

				break;

			default:
				// Any other route ('account', 'dashboard',...)
		}

		Session.set( 'Accounts.custom.showLoading', true );
		Session.set( 'Accounts.custom.routeName', routeName );

		self.next();
	},

	onAfterAction: function () {
		// Segment.io
		// analytics.page();
	}
});
