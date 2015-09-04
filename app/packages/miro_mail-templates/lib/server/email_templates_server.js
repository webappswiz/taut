EmailTemplate = function ( templatePath, options ) {
	var self = this,
		_options = {
			uncss: {
				// We're running in '.meteor/local/build/programs/server',
				// so we need to adjust the path
				csspath : '../../../../../public',
				htmlroot: '../../../../../public'
			},
			juice: {
				// Just in case...
				webResources        : {
					// We're running in '.meteor/packages/sacha_juice/.0.1.4.e4p8nc++os+web.browser+web.cordova/npm/node_modules/juice/node_modules/web-resource-inliner/src',
					// so we need to adjust the path
					relativeTo      : '../../../../../public',
					rebaseRelativeTo: 'css'
				},
				preserveImportant   : true,
				preserveMediaQueries: true
			}
		};

	if ( !templatePath ) {
		throw new Meteor.Error(
			500,
			'No template path provided',
			'No template path provided'
		);
	}

	self._templatePath = templatePath;
	// Get the file name without the extension and replace '.'s with '_'s
	self._templateName = self._templatePath.replace( /\?.*$/, '' ).replace( /.*\//, '' ).split( '.' ).slice( 0, -1 ).join( '_' );

	self._options = _.defaults( {}, options || {}, _options );

	self._fileSystem = Npm.require( 'fs' );
	self._filePath = Npm.require( 'path' );
	// Local (development) run
	self._fileSystemRoot = self._filePath.join( process.env.PWD, 'private' );

	if ( process.env.BUNDLE_PATH ) {
		self._fileSystemRoot = self._filePath.join( process.env.BUNDLE_PATH, 'programs', 'server', 'assets', 'app' );
		_options.uncss.csspath = self._filePath.join( process.env.BUNDLE_PATH, 'programs', 'web.browser', 'app' );
		_options.uncss.htmlroot = _options.uncss.csspath;
	} else if ( process.env.APP_DIR ) {
		self._fileSystemRoot = self._filePath.join( process.env.APP_DIR, 'programs', 'server', 'assets', 'app' );
		_options.uncss.csspath = self._filePath.join( process.env.APP_DIR, 'programs', 'web.browser', 'app' );
		_options.uncss.htmlroot = _options.uncss.csspath;
	}

	self._templateFilePath = self._filePath.join( self._fileSystemRoot, self._templatePath );

	self._uncss = Meteor.wrapAsync( uncss, uncss );
};

EmailTemplate.prototype.getText = function () {
	var self = this;

	try {
		return self._fileSystem.readFileSync( self._templateFilePath, {
			encoding: 'utf8'
		});
	} catch ( error ) {
		throw new Meteor.Error(
			500,
			'Could not find file: "' + self._templateFilePath + '"',
			error.message
		);
	}
};

EmailTemplate.prototype.render = function ( templateHelpers, templateValues ) {
	var self = this,
		regex = new RegExp( '@import.*(\@|\n|$)', 'gi' ),
		imports = [],
		templateHtml = self.getText(),
		match,
		css,
		html,
		inlinedHtml;

	if ( !Template[ self._templateName ] ) {
		SSR.compileTemplate( self._templateName, templateHtml );

		if ( templateHelpers ) Template[ self._templateName ].helpers( templateHelpers );
	}

	html = SSR.render( self._templateName, templateValues || {} );

	try {	// UnCSS template
		css = self._uncss( html, self._options.uncss );
	} catch ( unCssError ) {
		console.error( '[MailTemplates] Error: (UnCSS) - ' + unCssError );
	}

	if ( css ) {
		// Save '@import' tags for later inclusion
		while ( ( match = regex.exec( css ) ) != null ) {
			// JavaScript RegExp has a bug when the match has length 0
			if ( match.index === regex.lastIndex ) {
				++regex.lastIndex;
			}
			// The match variable is an array that contains the matching groups
			imports.push( match[ 0 ] );
		}

		// Remove all '<link>' tags
		html = html.replace( /<link\b[^>]*?>/gi, '' );

		try {	// Finally, inline styling with html
			inlinedHtml = juice.inlineContent( html, css, self._options.juice );
		} catch ( juiceError ) {
			console.error( '[MailTemplates] Error: (Juice) - ' + juiceError );
		}

		if ( inlinedHtml ) {
			// Put '@import' tags back
			if ( imports.length ) inlinedHtml = inlinedHtml.replace( '</head>', '<style type="text/css">\n' + imports.join( '\n' ) + '\n</style>\n</head>' );

			// Send away!
			return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' + inlinedHtml;
		} // Else fall back to default template
	}
};
