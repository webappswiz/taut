var numberOfImages = 7,
	imageRootName = 'our_trainers_',
	randomIntFromInterval = function ( min, max ) {
	    return Math.floor( Math.random() * ( max - min + 1 ) + min );
	},
	randomImage = function () {
		return imageRootName + randomIntFromInterval( 1, numberOfImages );
	};

/*****************************************************************************/
/* Trainer: Event Handlers */
/*****************************************************************************/
Template.trainer.events({
});

/*****************************************************************************/
/* Trainer: Helpers */
/*****************************************************************************/
Template.trainer.helpers({
	randomImage: function () {
		return randomImage();
	},

	userName: function () {
		return Accounts.custom.userName( this );
	}
});

/*****************************************************************************/
/* Trainer: Lifecycle Hooks */
/*****************************************************************************/
Template.trainer.onCreated(function () {
});

Template.trainer.onRendered(function () {
});

Template.trainer.onDestroyed(function () {
});
