var routeController,
	userForProfile = function () {
		var userId = routeController.state.get( 'userId' );

		if ( userId ) {
			return Meteor.users.findOne({
				_id: userId
			});
		} else {
			return Meteor.user();
		}
	},

	isMyProfile = function () {
		var user = userForProfile();

		return ( user && ( user._id === Meteor.userId() ) );
	},

	updateProfile = function ( userId, userProfile, callback ) {
		if ( userId ) {
			Meteor.users.update({
				_id: userId
			}, {
				$set: userProfile
			}, function ( error, result ) {
				if ( callback ) callback( error, result );
			});
		};
	};

/*****************************************************************************/
/* Profile: Event Handlers */
/*****************************************************************************/
Template.profile.events({
	'click #profileSave': function ( event, template ) {
		event.preventDefault();
		$( event.currentTarget ).prop( 'disabled', 'disabled' );

		var $age = template.find( '#age' ),
			age = ( $age ) ? $( $age ).val() : 18,
			$trainingExperience = template.find( '#trainingExperience' ),
			trainingExperience = ( $trainingExperience ) ? $( $trainingExperience ).val() : 0,
			$summary = template.find( '#summary' ),
			summary = ( $summary ) ? $( $summary ).val() : '',
			$hourlyRate = template.find( '#hourlyRate' ),
			hourlyRate = ( $hourlyRate ) ? $( $hourlyRate ).val() : 0,
			$isTrainer = template.find( '#iWantToBecameTrainer' ),
			isTrainer = ( $isTrainer ) ? $( $isTrainer ).is( ':checked' ) : CB.user.isTrainer( Meteor.userId() );

		updateProfile( Meteor.userId(), {
			'profile.age'               : age,
			'profile.trainingExperience': trainingExperience,
			'profile.summary'           : summary,
			'profile.hourlyRate'        : hourlyRate,
			'profile.isTrainer'         : isTrainer
		}, function ( error, result ) {
			if ( error ) {
				console.error( error );
			} else {
				$( event.currentTarget ).prop( 'disabled', '' );
			}
		});
	},

	'click #requestSession': function ( event, template ) {
		var inviterId = Meteor.userId(),
			inviteeId = userForProfile()._id,
			options;

		if ( !inviterId ) Router.go( 'login' );

		options = {
			// TODO: Implement proper invitations
			invitationId    : Random.id(),

			type            : 'private',	// ['private'|'group'|'public']

			tutorId         : inviteeId,
			moderatorId     : inviteeId,
			studentId       : inviterId,

			openTokApiKey   : Meteor.settings.public.LiveTutor.OpenTok.key/*,
			filepickerApiKey: Meteor.settings.public.LiveTutor.Filepicker.key*/
		};

		Meteor.call( 'LiveTutor.session.create', options, function ( error, session ) {
			if ( error ) {
				// Handle error...
			} else {
				if ( session && session._id ) {
					CB.sessions.setStatus( session._id, 'active' );
					// UM.invitations.setStatus( invitation._id, 'active' );

					CB.emails.sendSessionInvitation( session, function ( error, result ) {
						if ( error ) {
							alert(
								'Your request has not been sent.\n\n' +
								'Please, contact the support to resolve this issue.'
							);
						} else {
							alert(
								'Your request has been sent.\n\n' +
								'You\'ll be redirected to the session now.'
							);

							Router.go( '/session/' + session._id );
						}
					});
				}
			}
		});
	}
});

/*****************************************************************************/
/* Profile: Helpers */
/*****************************************************************************/
Template.profile.helpers({
	user: function () {
		return userForProfile();
	},

	userName: function () {
		return Accounts.custom.userName( userForProfile() );
	},

	isMyProfile: function () {
		return isMyProfile();
	},

	isTrainer: function () {
		var user = userForProfile();

		if ( user ) return CB.user.isTrainer( user._id );
	},

	summaryPlaceholder: function () {
		return 'To be in a good shape is very important nowadays because our way of life isn\'t so healthy and active. Most of us spend endless hours sitting by the computer and it gives negative results very fast. We think that fitness is a pleasant and useful activity. It helps to be more successful and disciplined.';
	}
});

/*****************************************************************************/
/* Profile: Lifecycle Hooks */
/*****************************************************************************/
Template.profile.onCreated( function () {
	routeController = Iron.controller();
});

Template.profile.onRendered( function () {
	CB.build();
});

Template.profile.onDestroyed( function () {
});
