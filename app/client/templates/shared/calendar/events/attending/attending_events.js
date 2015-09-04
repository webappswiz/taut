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

	maxListedEvents = 3;

Template.attendingEvents.helpers({
	attendingEvents: function () {
		var trainerId = userForProfile()._id,
			thisIsMyProfile = ( Meteor.userId() == trainerId ),
			filter = {
				start: {
					$gte: new Date()
				},
				attendees: Meteor.userId(),
				published: true
			};

		if ( !thisIsMyProfile ) filter.owner = trainerId;

		return CalendarEvents.find( filter , {
			sort     : {
				start: 0
			},
			/*
			skip     : Number,
			limit    : maxListedEvents,
			fields   : Field specifier,
			reactive : Boolean,
			transform: Function
			*/
		});
	}
});

/*****************************************************************************/
/* Profile: Lifecycle Hooks */
/*****************************************************************************/
Template.attendingEvents.onCreated( function () {
	routeController = Iron.controller();
});

Template.attendingEvents.onRendered( function () {
	// CB.build.accordion();
});

Template.attendingEvents.onDestroyed( function () {
});
