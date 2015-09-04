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

Template.upcomingEvents.helpers({
	upcomingEvents: function () {
		var events = CalendarEvents.find({
			owner: Meteor.userId(),
			start: {
				$gte: new Date()
			}
		}, {
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

		return events;
	}
});

/*****************************************************************************/
/* Profile: Lifecycle Hooks */
/*****************************************************************************/
Template.upcomingEvents.onCreated( function () {
	routeController = Iron.controller();
});

Template.upcomingEvents.onRendered( function () {
	// CB.build.accordion();
});

Template.upcomingEvents.onDestroyed( function () {
});
