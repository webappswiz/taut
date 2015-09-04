// Most of the testing of accounts-custom is done manually, across
// multiple browsers using examples/basic/ helper. We
// should *definitely* automate this, but Tinytest is generally not
// the right abstraction to use for this.

// It'd be cool to also test that the right thing happens if options
// *are* validated, but Accounts.custom._options is global state which
// makes this hard (impossible?)

Tinytest.add( 'accounts-custom - config', function ( test ) {
	test.equal( false, Accounts.custom._options.mergeAllowed );

	if ( Meteor.isClient ) {
		test.equal( { type: 'foo', message: 'foo.bar' }, Accounts.custom._getMessageFor( 'missingData', 'bar' ) );
		test.equal( 'foo.bar', Accounts.custom._getButtonTitleFor( 'foo', 'foo' ) );
	}

	test.notEqual( 'bar', Accounts.custom._options.foo );
});

// TODO: Write more tests ;)
