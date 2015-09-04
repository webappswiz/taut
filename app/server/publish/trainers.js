// Trainers

Meteor.publish( 'trainers', function () {
	return Meteor.users.find({
		'profile.isTrainer': true
	});
});
