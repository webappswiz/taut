/*****************************************************************************/
/* AccountsCustomForgotPassword: Event Handlers and Helpers */
/*****************************************************************************/
// Template.AccountsCustomForgotPassword.events({
/*
 * Example:
 *  'click .selector': function (e, tmpl) {
 *
 *  }
 */
// });

// Template.AccountsCustomForgotPassword.helpers({
/*
 * Example:
 *  items: function () {
 *    return Items.find();
 *  }
 */
// });

/*****************************************************************************/
/* AccountsCustomForgotPassword: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCustomForgotPassword.created = function () {};

Template.AccountsCustomForgotPassword.rendered = function () {
	/* Forgot Password form - Initialize Validation */
	$( '#forgotPasswordForm' ).validate({
		errorClass: 'help-block animation-slideUp', // You can change the animation class for a different entrance animation - check animations page
		errorElement: 'div',
		errorPlacement: function ( error, e ) {
			e.parents( '.form-group > div' ).append( error );
		},
		highlight: function ( e ) {
			$( e ).closest( '.form-group' ).removeClass( 'has-success has-error' ).addClass( 'has-error' );
			$( e ).closest( '.help-block' ).remove();
		},
		success: function ( e ) {
			if ( e.closest( '.form-group' ).find( '.help-block' ).length === 2 ) {
				e.closest( '.help-block' ).remove();
			} else {
				e.closest( '.form-group' ).removeClass( 'has-success has-error' );
				e.closest( '.help-block' ).remove();
			}
		},
		rules: {
			'email': {
				required: true,
				email: true
			}
		},
		messages: {
			'email': 'Please enter a valid email address'
		}
	});
};

Template.AccountsCustomForgotPassword.destroyed = function () {};

