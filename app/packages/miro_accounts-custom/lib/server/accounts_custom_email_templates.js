/*****************************************************************************/
/* Email Server Templates */
/*****************************************************************************/

Meteor.startup( function () {
	// Set up email templates
	Accounts.emailTemplates.siteName = 'AccountsCustom';
	Accounts.emailTemplates.from = 'AccountsCustom <accounts.custom@meteor.com>';

	if (
		Meteor.settings &&
		Meteor.settings.private &&
		Meteor.settings.private.emailTemplates
	) {
		Accounts.emailTemplates.siteName = Meteor.settings.private.emailTemplates.siteName;
		Accounts.emailTemplates.from = Meteor.settings.private.emailTemplates.from;
	}

	/*
	 | Verify Email
	 */
	Accounts.emailTemplates.verifyEmail.subject = function ( user ) {
		return '[' + Accounts.emailTemplates.siteName + '] Verify your email, ' + Accounts.custom.userFirstName( user );
	};

	Accounts.emailTemplates.verifyEmail.text = function ( user, url ) {
		return 'Welcome to ' + Accounts.emailTemplates.siteName + '!\n\n' +
				'To continue with your sign up, simply click the link below:\n\n' +
				url;
	};

	Accounts.emailTemplates.verifyEmail.html = function ( user, url ) {
		var emailTemplate = new EmailTemplate( 'templates/email/account/verify_email.html' );

		return emailTemplate.render(
			// templateHelpers
			{
				name       : Accounts.custom.userFirstName( user ),
				absoluteUrl: Meteor.absoluteUrl()
			},
			// templateValues
			{
				user: user,
				url : url
			}
		);
	};

	/*
	 | Enroll Account
	 */
	Accounts.emailTemplates.enrollAccount.subject = function ( user ) {
		return 'Welcome to ' + Accounts.emailTemplates.siteName + ', ' + Accounts.custom.userFirstName( user );
	};

	Accounts.emailTemplates.enrollAccount.text = function ( user, url ) {
		return 'To activate your account, simply click the link below:\n\n' +
				url;
	};

	Accounts.emailTemplates.enrollAccount.html = function ( user, url ) {
		var emailTemplate = new EmailTemplate( 'templates/email/account/enroll_account.html' );

		return emailTemplate.render(
			// templateHelpers
			{
				name       : Accounts.custom.userFirstName( user ),
				absoluteUrl: Meteor.absoluteUrl()
			},
			// templateValues
			{
				user: user,
				url : url
			}
		);
	};

	/*
	 | Reset Password
	 */
	Accounts.emailTemplates.resetPassword.subject = function ( user ) {
		return '[' + Accounts.emailTemplates.siteName + '] Reset password request for ' + Accounts.custom.userFirstName( user );
	};

	Accounts.emailTemplates.resetPassword.text = function ( user, url ) {
		return 'You have requested to reset your password.\n\n' +
				'To continue with the password reset procedure, simply click the link below:\n\n' +
				url;
	};

	Accounts.emailTemplates.resetPassword.html = function ( user, url ) {
		var emailTemplate = new EmailTemplate( 'templates/email/account/reset_password.html' );

		return emailTemplate.render(
			// templateHelpers
			{
				name       : Accounts.custom.userFirstName( user ),
				absoluteUrl: Meteor.absoluteUrl()
			},
			// templateValues
			{
				user: user,
				url : url
			}
		);
	};
});
