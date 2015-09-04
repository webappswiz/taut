/*****************************************************************************/
/* AccountsCustomSetPassword: Event Handlers and Helpers */
/*****************************************************************************/
// Template.AccountsCustomSetPassword.events({
/*
 * Example:
 *  'click .selector': function (e, tmpl) {
 *
 *  }
 */
// });

// Template.AccountsCustomSetPassword.helpers({
/*
 * Example:
 *  items: function () {
 *    return Items.find();
 *  }
 */
// });

/*****************************************************************************/
/* AccountsCustomSetPassword: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCustomSetPassword.created = function () {};

Template.AccountsCustomSetPassword.rendered = function () {
	/* Set Password form - Initialize Validation */
	$( '#setPasswordForm' ).validate({
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
			'password': {
				required: true,
				minlength: 6
			},
			'passwordConfirm': {
				required: true,
				equalTo: '#password'
			}
		},
		messages: {
			'password': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 6 characters long'
			},
			'passwordConfirm': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 6 characters long',
				equalTo: 'Please enter the same password as above'
			}
		}
	});
};

Template.AccountsCustomSetPassword.destroyed = function () {};

