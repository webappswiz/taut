var timeOut = 5000,

	commonCSS = [
		'/css/color.css',
		'/css/bootstrap-timepicker.min.css',
		'/css/color.css',
		'/css/jquery.custombox.css',
		'/css/masterslider.css',
		'/css/ms-fullscreen.css',
		'/css/ms-tabs-style.css',
		'/css/owl.carousel.css',
		'/css/owl.transitions.css',
		'/css/style.css',
		'/css/main.css'
	];

	// Styles
	sessionCSS = [
		/* CSS Styles */
		'/css/livetutor/livetutor/escape.css',
		// '/css/livetutor/jquery-ui-1.10.3.smoothness.min.css',
		'/css/livetutor/livetutor/livetutor.css',
		'/css/livetutor/livetutor/normalize.css',
		'/css/livetutor/livetutor/fc.css',
		'/css/livetutor/livetutor/component.css',
		'/css/livetutor/livetutor/animations.css',
		'/css/livetutor/livetutor/pagetransitions.css',
		'/css/livetutor/livetutor/icons.css',
		'/css/livetutor/livetutor/board.css',
		'/css/livetutor/livetutor/spinner.css',

		'/css/livetutor/firecollab/firecollab.css',

		/* Fonts */
		'/fonts/livetutor/firecollab/style.css',

		/* Backend Styles */
		// '/css/account/plugins.css',
		// '/styles/account/themes.css',
		'/css/session.css'
	],

	sessionSync = [
		// Modernizr
		'/js/vendor/modernizr-2.8.3.min.js',

		// Firebase
		'https://cdn.firebase.com/js/client/2.2.3/firebase.js',

		// '/js/vendor/livetutor/raphael-min.js',
		// '/js/vendor/livetutor/firecollab/raphael.js',
		// '/js/vendor/livetutor/firecollab/raphael.free_transform.js',

		// '/js/vendor/livetutor/jquery.raphboard.js',
		// '/js/vendor/livetutor/firecollab/raphboard.js',

		// '/js/vendor/livetutor/firecollab/firecollab.js',
		// '/js/vendor/livetutor/firecollab/raphboard.firecollab.js',

		// FilePicker
		// 'https://api.filepicker.io/v1/filepicker.js',
		// 'https://api.filepicker.io/v1/filepicker_debug.js'

		// '/js/vendor/livetutor/livetutor/livetutor.js'
	],

	sessionAsync = [
		// OpenTok
		'http://static.opentok.com/v2/js/opentok.min.js',

		// LiveTutor
		// '/js/vendor/livetutor/common.min.js',

		// '/js/vendor/livetutor/livetutor/escape.js',

		// '/js/vendor/livetutor/livetutor/livetutor.js',
		'/js/vendor/livetutor/livetutor/opentok-layout.js',
		// '/js/vendor/livetutor/livetutor/pagetransitions.js',
		'/js/vendor/livetutor/livetutor/classie.js',
		'/js/vendor/livetutor/livetutor/gnmenu.js',
		// '/js/vendor/livetutor/livetutor/fcmenu.js',
		// '/js/vendor/livetutor/livetutor/rbmenu.js'
	];

Router.route( '/', {
	name      : 'home',
	template  : 'home',
	controller: 'HomeController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/trainers', {
	name      : 'trainers',
	template  : 'trainers',
	controller: 'HomeController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/signup', {
	name      : 'signup',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/login', {
	name      : 'login',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/account', {
	name      : 'account',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/reset-password/:token', {
	name      : 'resetPassword',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/enroll-account/:token', {
	name      : 'enrollAccount',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/verify-email/:token', {
	name      : 'verifyEmail',
	template  : 'account',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	}
});

Router.route( '/profile', {
	name      : 'myProfile',
	template  : 'profile',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	},

	yieldRegions: {
		'profile': {
			to: 'content'
		}
	},

	action: function () {
		this.state.set( 'userId', Meteor.userId() );

		this.render();
	}
});

Router.route( '/profile/:userId', {
	name      : 'profile',
	template  : 'profile',
	controller: 'AccountController',
	where     : 'client',

	preload: {
		styles: commonCSS
	},

	yieldRegions: {
		'profile': {
			to: 'content'
		}
	},

	action: function () {
		this.state.set( 'userId', this.params.userId );

		this.render();
	}
});

Router.route( '/session/:sessionId', {
	name          : 'session',
	template      : 'session',
	layoutTemplate: 'SessionLayout',
	controller    : 'SessionController',

	preload: {
		timeOut: timeOut,
		styles : sessionCSS,
		sync   : sessionSync,
		async  : sessionAsync,
		onSync : function ( filePath ) {
			var fileName = filePath.replace( /\?.*$/, '' ).replace( /.*\//, '' );

			switch ( fileName ) {
				case 'modernizr-2.8.3.min.js':
					try {
						return !!Modernizr;
					} catch ( error ) {
						return false;
					}

					break;

				case 'firebase.js':
					try {
						return !!Firebase;
					} catch ( error ) {
						return false;
					}

					break;

				// case 'filepicker.js':
				// 	try {
				// 		return !!filepicker;
				// 	} catch ( error ) {
				// 		return false;
				// 	}

				// 	break;

				case 'livetutor.js':
					try {
						return !!LiveTutor;
					} catch ( error ) {
						return false;
					}

					break;

				default:
					return true;
			}
		}
	}
});

// Redirect all unknown routes to home
Router.route( '/(.*)', {
	onBeforeAction: function () {
		if ( Meteor.userId() ) {
			this.redirect( 'myProfile' );
		} else {
			this.redirect( 'home' );
		}
	}
});
