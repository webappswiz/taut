/*****************************************************************************/
/* AccountsCustomSignOut: Event Handlers and Helpers */
/*****************************************************************************/
// Template.AccountsCustomSignOut.events({
/*
 * Example:
 *  'click .selector': function (e, tmpl) {
 *
 *  }
 */
// });

Template.AccountsCustomSignOut.helpers({
	user: function () {
		return Meteor.user();
	},

	avatar: function () {
		return Meteor.user() && Meteor.user().profile.pictureUrl;
	},

	userInitials: function () {
		return Avatar.getInitials( Meteor.user() );
	}
});

/*****************************************************************************/
/* AccountsCustomSignOut: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCustomSignOut.created = function () {};

Template.AccountsCustomSignOut.rendered = function () {};

Template.AccountsCustomSignOut.destroyed = function () {};

