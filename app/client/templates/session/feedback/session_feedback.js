/*****************************************************************************/
/* Session Feedback Modal: Event Handlers and Helpers */
/*****************************************************************************/
var $thisModal,
	feedbackRateButtonPlaceholder = 'Select your experience...',
	data = new ReactiveVar( {} ),
	feedbackRateButtonTitle = new ReactiveVar( feedbackRateButtonPlaceholder ),
	disabledSubmit = new ReactiveVar( 'disabled' );

Template.sessionFeedbackModal.events({
	'click .feedbackSelect': function ( event, template ) {
		event.preventDefault();

		var feedback = $( event.currentTarget ).text();

		if ( feedback !== feedbackRateButtonPlaceholder ) {
			feedbackRateButtonTitle.set( feedback );

			disabledSubmit.set( '' );
		}
	},

	'click #feedbackSubmit': function ( event, template ) {
		event.preventDefault();

		var feedback = {
				rate: feedbackRateButtonTitle.get(),
				text: $( '.feedback-textarea' ).val()
			},
			routeController;

		if ( feedback.rate !== feedbackRateButtonPlaceholder ) {
			routeController = Iron.controller();

			// Update Session with Feedback
			CB.feedbacks.save( routeController.params.sessionId, feedback );

			CB.modals.hide( $thisModal );
		}
	}
});

Template.sessionFeedbackModal.helpers({
	feedbackRateButtonTitle: function () {
		return feedbackRateButtonTitle.get();
	},

	disabledSubmit: function () {
		return disabledSubmit.get();
	},

	otherParty: function () {
		var mySession = data.get(),
			otherPartyId = ( mySession.tutorId == Meteor.userId() ) ? mySession.studentId : mySession.tutorId,
			otherParty;

		if ( otherPartyId ) {
			otherParty = Meteor.users.find({
				_id: otherPartyId
			}).fetch();

			if ( otherParty.length ) {
				return otherParty[ 0 ];
			}
		}
	}
});

/*****************************************************************************/
/* Session Feedback Modal: Lifecycle Hooks */
/*****************************************************************************/
Template.sessionFeedbackModal.created = function () {};

Template.sessionFeedbackModal.rendered = function () {
	$thisModal = $( '#sessionFeedbackModal' );

	$thisModal.on( 'show.bs.modal', function ( event ) {
		data.set( $thisModal.data() );

		disabledSubmit.set( 'disabled' );
	});

	// jQuery workaround to get carriage returns from textarea
	$.valHooks.textarea = {
		get: function ( element ) {
			return element.value.replace( /\r?\n/g, '\r\n' );
		}
	};
};

Template.sessionFeedbackModal.destroyed = function () {};
