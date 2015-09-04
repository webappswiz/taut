/*****************************************************************************/
/* AccountsCustomSignIn: Event Handlers and Helpers */
/*****************************************************************************/
// Template.AccountsCustomSignIn.events({
/*
 * Example:
 *  'click .selector': function (e, tmpl) {
 *
 *  }
 */
// });

// Template.AccountsCustomSignIn.helpers({
/*
 * Example:
 *  items: function () {
 *    return Items.find();
 *  }
 */
// });

/*****************************************************************************/
/* AccountsCustomSignIn: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCustomSignIn.created = function () {};

Template.AccountsCustomSignIn.rendered = function () {
	/* SignIn form - Initialize Validation */
	$( '#signInForm' ).validate({
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
				email: false
			},
			'password': {
				required: true,
				minlength: 6
			}
		},
		messages: {
			'email': 'Please enter your username or a valid email address',
			'password': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 6 characters long'
			}
		}
	});
};

Template.AccountsCustomSignIn.destroyed = function () {};

