// Because this is global state that affects every client, we can't turn
// it on and off during the tests. Doing so would mean two simultaneous
// test runs could collide with each other.
//
// We should probably have some sort of server-isolation between
// multiple test runs. Perhaps a separate server instance per run. This
// problem isn't unique to this test, there are other places in the code
// where we do various hacky things to work around the lack of
// server-side isolation.
//
// For now, we just test the one configuration state. You can comment
// out each configuration option and see that the tests fail.
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
	forbidClientAccountCreation: true
});

Accounts.custom.config({
	mergeAllowed: false
});

if ( Meteor.isClient ) {
	Accounts.custom.config({
		messages: {
			missingData: { type: 'foo', message: 'foo.%s' }
		},
		buttons: {
			foo: { title: '%s.bar' }
		}
	});
}

Accounts.custom.config({ foo: 'bar' });
