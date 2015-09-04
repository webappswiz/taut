Accounts.config({
/*
 |	sendVerificationEmail | forbidClientAccountCreation | Result
 |	------------------------------------------------------------------------------------------------
 |			false		  |				false			| Allow client sign up, no verification
 |			false		  |				true			| No client sign up, no verification
 |			true		  |				false			| Allow client sign up, verify email
 |			true		  |				true			| No client sign up, verify email
 */

	sendVerificationEmail      : false,
	forbidClientAccountCreation: false
});

Accounts.custom.config({
	// globalAssets: Assets,
	mergeAllowed: true
});
