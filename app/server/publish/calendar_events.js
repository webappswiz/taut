// Calendar Events

Meteor.publish( 'calendarEvents', function () {
	return CalendarEvents.find({});
});
