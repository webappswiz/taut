/*****************************************************************************/
/* AccountTitle: Event Handlers and Helpers */
/*****************************************************************************/
Template.accountTitle.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.accountTitle.helpers({
	title: function () {
		var title = {
				// Default: Log In
				path     : '/signup',
				title    : 'Log In',
				iconTitle: 'Sign Up'
			};

		if ( Session.get( 'Accounts.custom.showSignUp' ) ) {
			title = {
				path     : '/login',
				title    : 'Sign Up',
				iconTitle: 'Back to Login'
			};
		} else if ( Session.get( 'Accounts.custom.showSetPassword' ) ) {
			title = {
				path     : '/login',
				title    : 'Set Password',
				iconTitle: 'Back to Login'
			};
		} else if ( Session.get( 'Accounts.custom.showForgotPassword' ) ) {
			title = {
				path     : '/login',
				title    : 'Request Password',
				iconTitle: 'Back to Login'
			};
		} else if ( Session.get( 'Accounts.custom.showResetPassword' ) ) {
			title = {
				path     : '/login',
				title    : 'Reset Password',
				iconTitle: 'Back to Login'
			};
		} else if ( Meteor.user() ) {
			title = {
				path     : '/signout',
				title    : 'Sign Out',
				iconTitle: 'Sign Out'
			};
		}

		return title;
	}
});

/*****************************************************************************/
/* AccountTitle: Lifecycle Hooks */
/*****************************************************************************/
Template.accountTitle.created = function () {
};

Template.accountTitle.rendered = function () {
};

Template.accountTitle.destroyed = function () {
};
