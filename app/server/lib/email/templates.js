/*****************************************************************************/
/* Custom Email Server Templates */
/*****************************************************************************/

Meteor.startup( function () {
	var emailTemplate = new EmailTemplate( 'templates/email/account/welcome.html' ),
		templateHtml;

	// Try to fetch email templates from 'private' directory
	try {
		templateHtml = emailTemplate.getText();
	} catch ( error ) {}

	if ( templateHtml ) {
		Accounts.emailTemplates.resetPassword.subject = function ( user ) {
			return 'Welcome to ' + Accounts.emailTemplates.siteName + ', ' + ( user.profile.firstName || user.username ) + '!';
		};

		Accounts.emailTemplates.resetPassword.html = function ( user, url ) {
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
		}
	};
});
