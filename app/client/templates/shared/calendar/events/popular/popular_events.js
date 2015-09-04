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

	minPopularAttendees = 3,
	maxListedEvents = 3;

Template.popularEvents.helpers({
	popularEvents: function () {
		return CalendarEvents.find({
			owner: userForProfile()._id,
			start: {
				$gte: new Date()
			},
			attendees: {
				$size: {
					$gte: minPopularAttendees
				}
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
	}
});

/*****************************************************************************/
/* Profile: Lifecycle Hooks */
/*****************************************************************************/
Template.popularEvents.onCreated( function () {
	routeController = Iron.controller();
});

Template.popularEvents.onRendered( function () {
	// CB.build.accordion();
});

Template.popularEvents.onDestroyed( function () {
});
