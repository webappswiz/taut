/*****************************************************************************/
/* Trainers: Event Handlers */
/*****************************************************************************/
Template.trainers.events({
});

/*****************************************************************************/
/* Trainers: Helpers */
/*****************************************************************************/
Template.trainers.helpers({
	ourTrainers: function () {
		var currentUserId = Meteor.userId();

		if ( currentUserId ) {
			return Meteor.users.find({
				_id: {
					$ne: currentUserId
				},
				'profile.isTrainer': true
			});
		} else {
			return Meteor.users.find({
				'profile.isTrainer': true
			});
		}
	}
});

/*****************************************************************************/
/* Trainers: Lifecycle Hooks */
/*****************************************************************************/
Template.trainers.onCreated(function () {
});

Template.trainers.onRendered(function () {
});

Template.trainers.onDestroyed(function () {
});
