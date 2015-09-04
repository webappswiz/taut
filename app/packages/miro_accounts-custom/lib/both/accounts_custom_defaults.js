/*
 | Accounts Custom - Defaults (Server & Client)
 */

/*
 | Copy this file to your app's common directory to be available to both
 | server & client and edit as you please.
 |
 | You don't have to put all of this in your file, just the ones you want to
 | change and the rest will remain default.
 */

Accounts.custom.config({
	// Global (Server & Client) Account Merge Allow flag
	mergeAllowed: false,

	/* Various messages (Client)
	 |
	 | '%s' within message will be replaced with the current item, for
	 | example, in 'Do you really want to disconnect from \'%s\'?', '%s' will
	 | be replaced with the current Social Service name (ie. 'Facebook')
	 */
	messages: {
		// Common
		loading          : { type: 'info', title: 'Info:', message: 'Loading...' },
		wrongEmail       : { type: 'danger', title: 'Error!', message: 'This email does not exist.' },
		missingData      : { type: 'danger', title: 'Error!', message: 'Please fill in all required fields.' },
		invalidEmail     : { type: 'danger', title: 'Error!', message: 'Please enter a valid email address.' },
		invalidUsername  : { type: 'danger', title: 'Error!', message: 'Please enter a valid user name.' },
		invalidPassword  : { type: 'danger', title: 'Error!', message: 'Your password should be at least 6 characters long.' },
		passwordMismatch : { type: 'danger', title: 'Error!', message: 'Your two passwords are not equal.' },
		invalidInviteCode: { type: 'danger', title: 'Error!', message: 'Please enter a valid invitation code.' },

		// Social Services
		// These two should NOT be presented to the user!
		configError     : { type: 'danger', title: 'Error!', message: 'No login services configured! At least \'accounts-passwords\' or some of \'accounts-<service>\' packages has to be installed.' },
		noAccountsUi    : { type: 'warning', title: 'Warning:', message: 'accounts-ui package is required to configure social services!' },

		socialError          : { type: 'danger', title: 'Error!', message: 'We\'re sorry but this service could not be connected.' },
		socialExists         : { type: 'danger', title: 'Error!', message: 'We\'re sorry but this service is already in use.' },
		socialNoMatchingLogin: { type: 'danger', title: 'Error!', message: 'We\'re sorry but you have to sign up first.' },

		removeSocialLast: { type: 'warning', title: 'Warning:', message: 'Can\'t disconnect single login service.' },

		// Social info - overridden by Accounts.custom.onSignUpSocialService() hook
		signUpSocial    : { type: 'success', title: 'Success!', message: 'User successfully signed up with the \'%s\' service!' },
		// Social info - overridden by Accounts.custom.onSignInSocialService() hook
		signInSocial    : { type: 'info', title: 'Welcome!', message: 'User successfully signed in with the \'%s\' service!' },

		// Social alert - overridden by Accounts.custom.onRemoveSocialService() hook
		removeSocial    : { type: 'confirm', title: 'Disconnect?', message: 'Do you really want to disconnect from \'%s\'?' },

		// Sign Up Form
		signupEmail     : { type: 'info', title: 'Email Sent.', message: 'Please check your mailbox to finish sign up.' },
		signupError     : { type: 'danger', title: 'Sign Up Error!', message: 'We\'re sorry but something went wrong.' },
		existingEmail   : { type: 'danger', title: 'Error!', message: 'We\'re sorry but this email is already used.' },
		existingUsername: { type: 'danger', title: 'Error!', message: 'We\'re sorry but this user name is already used.' },
		signupSuccess   : { type: 'success', title: 'Success!', message: 'Congrats! You\'re now a new Meteorite!' },

		// Sign In Form
		signinError  : { type: 'danger', title: 'Error!', message: 'We\'re sorry but these credentials are not valid.' },
		signinSuccess: { type: 'success', title: 'Welcome!', message: 'Nice to see you again, %s!' },

		// Sign Out
		signOut: { type: 'info', title: 'Bye Meteorite!', message: 'Come back whenever you want!' },

		// Change Password
		changeIncorrectPassword: { type: 'danger', title: 'Error!', message: 'You\'ve entered incorect old password!' },
		changePasswordError    : { type: 'danger', title: 'Change Password Error!', message: 'We\'re sorry but something went wrong.' },
		changePasswordSuccess  : { type: 'success', title: 'Success!', message: 'Your password is changed!' },

		// Set Password
		setTokenExpired   : { type: 'danger', title: 'Error!', message: 'We\'re sorry but this password set token has expired.' },
		setPasswordError  : { type: 'danger', title: 'Set Password Error!', message: 'We\'re sorry but something went wrong.' },
		setPasswordSuccess: { type: 'success', title: 'Congrats!', message: 'You\'re now a new Meteorite!' },

		// Forgot Password Form
		recoverPasswordError  : { type: 'danger', title: 'Recover Password Error!', message: 'We\'re sorry but something went wrong.' },
		recoverPasswordSuccess: { type: 'info', title: 'Email Sent.', message: 'Please check your mailbox to reset your password.' },

		// Reset Password
		resetTokenExpired   : { type: 'danger', title: 'Error!', message: 'We\'re sorry but this password reset token has expired.' },
		resetPasswordError  : { type: 'danger', title: 'Reset Password Error!', message: 'We\'re sorry but something went wrong.' },
		resetPasswordSuccess: { type: 'success', title: 'Success!', message: 'Your password has been changed. Welcome back!' },

		// Email Verification
		verifyEmailError  : { type: 'danger', title: 'Verify Email Error!', message: 'We\'re sorry but something went wrong.' },
		verifyEmailSuccess: { type: 'success', title: 'Success!', message: 'Your email has been successfully verified. Welcome!' }
	},

	/* Social Buttons Titles (Client)
	 |
	 | '%s' within title will be replaced with the current item, for
	 | example, in 'Disconnect %s', '%s' will
	 | be replaced with the current Social Service name (ie. 'Facebook')
	 */
	buttons: {
		socialConfigure: { title: 'Configure %s' },
		socialSignUp   : { title: 'Sign up with %s' },
		socialSignIn   : { title: 'Sign in with %s' },
		socialConnect  : { title: 'Connect with %s' },
		socialConnected: { title: 'Disconnect %s' },
		socialSingle   : { title: 'Connected with %s' }
	}
});
