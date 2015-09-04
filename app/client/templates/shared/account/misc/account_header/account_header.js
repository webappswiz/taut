/*****************************************************************************/
/* AccountHeader: Event Handlers and Helpers */
/*****************************************************************************/
Template.accountHeader.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.accountHeader.helpers({
	header: function () {
		var header = {
				// Default: Sign In
				// icon: 'cube',
				title: 'Welcome to CrossBit'
			};

		if ( Session.get( 'Accounts.custom.showSignUp' ) ) {
			header.icon = 'plus';
			header.title = 'Create Account';
		} else if ( Session.get( 'Accounts.custom.showSetPassword' ) ) {
			header.icon = 'plus';
			header.title = 'Create Account';
		} else if ( Session.get( 'Accounts.custom.showForgotPassword' ) ) {
			header.icon = 'history';
			header.title = 'Password Reminder';
		} else if ( Session.get( 'Accounts.custom.showResetPassword' ) ) {
			header.icon = 'history';
			header.title = 'Password Reminder';
		}

		return header;
	}
});

/*****************************************************************************/
/* AccountHeader: Lifecycle Hooks */
/*****************************************************************************/
Template.accountHeader.created = function () {
};

Template.accountHeader.rendered = function () {
};

Template.accountHeader.destroyed = function () {
};
