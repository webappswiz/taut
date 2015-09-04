// Users

Meteor.publish( 'onlineUsers', function ( /* args */ ) {
	return Meteor.users.find({
		'status.online': true
	});
});

Meteor.publish( 'awayUsers', function ( /* args */ ) {
	return Meteor.users.find({
		'status.away': true
	});
});

Meteor.publish( 'offlineUsers', function ( /* args */ ) {
	return Meteor.users.find({
		'status.away': {
			'$ne': true
		},
		'status.online': {
			'$ne': true
		}
	});
});
