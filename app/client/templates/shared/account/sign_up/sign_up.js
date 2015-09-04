/*****************************************************************************/
/* AccountsCustomSignUp: Event Handlers and Helpers */
/*****************************************************************************/
// Template.AccountsCustomSignUp.events({
/*
 * Example:
 *  'click .selector': function (e, tmpl) {
 *
 *  }
 */
// });

// Template.AccountsCustomSignUp.helpers({
/*
 * Example:
 *  items: function () {
 *    return Items.find();
 *  }
 */
// });

/*****************************************************************************/
/* AccountsCustomSignUp: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCustomSignUp.created = function () {};

Template.AccountsCustomSignUp.rendered = function () {
	/* SignUp form - Initialize Validation */
	$( '#signUpForm' ).validate({
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
			'username': {
				required: true,
				minlength: 3
			},
			'email': {
				required: true,
				email: true
			},
			'invitationCode': {
				required: true
			},
			'password': {
				required: true,
				minlength: 6
			},
			'passwordConfirm': {
				required: true,
				equalTo: '#password'
			},
			'terms': {
				required: true
			}
		},
		messages: {
			'username': {
				required: 'Please enter a username',
				minlength: 'Please enter a username'
			},
			'email': 'Please enter a valid email address',
			'invitationCode': 'Please enter a valid invitation code',
			'password': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 6 characters long'
			},
			'passwordConfirm': {
				required: 'Please provide a password',
				minlength: 'Your password must be at least 6 characters long',
				equalTo: 'Please enter the same password as above'
			},
			'terms': {
				required: 'Please accept the terms!'
			}
		}
	});
};

Template.AccountsCustomSignUp.destroyed = function () {};

