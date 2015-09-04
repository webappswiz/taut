Package.describe({
	name   : 'miro:accounts-custom',
	summary: 'Fully customizable Meteor Accounts UI replacement + Extras',
	version: '1.0.0',
	git    : 'https://github.com/MiroHibler/meteor-accounts-custom.git'
});

Package.onUse( function ( api ) {
	api.versionsFrom( '1.1' );

	// Prerequisite packages
	api.use([
		'templating',
		'session'
	], 'client' );

	api.use([
		'underscore',
		'service-configuration',
		'accounts-base'
	], [ 'client', 'server' ]);

	// Export Accounts (etc) to packages using this one.
	api.imply([
		'underscore',
		'service-configuration',
		'accounts-base'
	], [ 'client', 'server' ]);

	// Prerequisite packages
	api.use([
		'miro:email-templates'
	], 'server' );

	api.imply([
		'miro:email-templates'
	], 'server' );

	// Package files
	api.addFiles([
		'lib/both/accounts_custom_both.js'
	], [ 'client', 'server' ]);

	api.addFiles([
		'lib/server/accounts_custom_invitation_codes.js',
		'lib/server/accounts_custom_server.js',
		'lib/server/accounts_custom_email_templates.js'
	], [ 'server' ]);

	api.addFiles([
		'lib/client/accounts_custom_client.js'
	], [ 'client' ]);

	// Defaults (LAST ONE!)
	api.addFiles([
		'lib/both/accounts_custom_defaults.js'
	], [ 'client', 'server' ]);

	if ( api.export ) {
		api.export( 'InvitationCodes', 'server' );
		api.export( 'SocialAccounts', [ 'server', 'client' ]);
	}
});

Package.onTest( function ( api ) {
	api.use([
		'miro:accounts-custom',
		'tinytest',
		'test-helpers'
	]);

	api.addFiles([
		'tests/accounts_custom_tests_setup.js',
		'tests/accounts_custom_tests.js'
	], [ 'server', 'client' ]);
});
