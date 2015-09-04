Package.describe({
	name   : 'miro:uncss',
	version: '0.0.1',
	summary: 'A Meteor wrapper for UnCSS - unused CSS styles remover',
	git    : 'https://github.com/MiroHibler/meteor-uncss',
});

Package.onUse( function ( api ) {
	api.versionsFrom( '1.1.0.3' );

	api.addFiles( [
		'lib/server/uncss_phridge.js',
		'lib/server/uncss_server.js'
	], 'server' );

	api.export( 'uncss', 'server' );
});

Package.onTest( function ( api ) {
	api.use( 'tinytest' );
	api.use( 'miro:uncss' );

	api.addFiles( 'uncss-tests.js' );
});

Npm.depends({
	"which"    : '1.1.1',
	'uncss'    : '0.12.1'
});
