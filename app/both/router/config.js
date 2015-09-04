var mustBeSignedIn = function () {
		if ( !( Meteor.user() || Meteor.loggingIn() ) ) {
			// this.redirect( 'account' );
			this.render( 'account' );
		} else {
			this.next();
		}
	},

	showMyProfile = function () {
		if ( Meteor.user() ) {
			this.redirect( 'myProfile' );
		}
	},

	initUI = function () {
		CB.uiInit();
	},

	clearAccountNotifications = function () {
		Session.set( 'Accounts.custom.message', {
			type: 'hidden'
		});
	};

Router.configure({
	layoutTemplate  : 'MasterLayout',
	loadingTemplate : 'Loading',
	notFoundTemplate: 'NotFound'/*,

	preload: {
		verbose: true
	}*/
});

Router.onBeforeAction( mustBeSignedIn, {
	except: [
		'home',
		'profile',
		'myProfile',
		'trainers',
		'signup',
		'login',
		'account',
		'enrollAccount',
		'verifyEmail',
		'resetPassword'
	]
});

Router.onBeforeAction( showMyProfile, {
	only: [
		'account'
	]
});

Router.onAfterAction( showMyProfile, {
	only: [
		'account',
		'signup',
		'login'
	]
});
/*
Router.onAfterAction( initUI, {
	only: [
		'home',
		// 'features',
		// 'pricing',
		// 'contact',
		'profile'
	]
});
*/
Router.onAfterAction( clearAccountNotifications, {
	only: [
		'profile',
		'myProfile',
		'acceptInvitation',
		'invitationAccepted'
	]
});
