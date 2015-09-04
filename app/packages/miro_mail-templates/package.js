Package.describe({
	name: 'miro:email-templates',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: 'Email templates for Meteor',
	// URL to the Git repository containing the source code for this package.
	git: 'https://github.com/MiroHibler/meteor-email-templates',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Package.onUse( function ( api ) {
	api.versionsFrom( '1.1.0.3' );

	// Prerequisite packages
	api.use([
		'miro:uncss',
		'sacha:juice',
		'meteorhacks:ssr'
	], 'server' );

	api.addFiles( 'lib/server/email_templates_server.js', 'server' );

	api.export( 'EmailTemplate', 'server' );
});

Package.onTest( function ( api ) {
	api.use( 'tinytest' );
	api.use( 'miro:email-templates' );

	api.addFiles( 'email_templates_tests.js' );
});
