/*
 | A hack to replace PhantomJS included with npm package 'phridge'
 | because of binary incopatibility; replacing with global installation
 |
 | NOTE: Global PhantomJS installation on production server should be done
 | 		 manually (ie. via 'mup' option "setupPhantom": true)
 */

var path = Npm.require( 'path' ),
	which = Npm.require( 'which' ),
	exec = Npm.require( 'child_process' ).exec;

which( 'phantomjs', function ( error, systemPhantomJs ) {
	if ( !error ) {
		var npmPhantomJs = path.resolve( path.join(
				'npm', 'miro_uncss', 'node_modules', 'uncss', 'node_modules',
				'phridge', 'node_modules', 'phantomjs', 'lib', 'phantom', 'bin'
			) ),
			command = 'cd ' + npmPhantomJs + '; ' +
					'mv phantomjs phantomjs.old; ' +
					'ln -s ' + systemPhantomJs + ' phantomjs';

		console.log( '[UnCSS] Replacing PhantomJS...' );
		// console.log( '[UnCSS] PhantomJS - with a command: "' + command + '"' );

		exec( command, function ( error, stdout, stderr ) {
			if ( stdout ) console.log( '[UnCSS] stdout: ' + stdout );
			if ( stderr ) console.log( '[UnCSS] stderr: ' + stderr );
			if ( error ) console.error( '[UnCSS] error: ' + error );
		});
	}
});
