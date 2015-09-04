// Sessions

Meteor.publish( 'allSessions', function ( /* args */ ) {
	return Sessions.find({});
});

Meteor.publish( 'mySessions', function ( /* args */ ) {
	return Sessions.find({
		$or: [
			{
				tutorId    : this.userId
			},
			{
				moderatorId: this.userId
			},
			{
				studentId  : this.userId
			}
		]
	});
});
