SessionController = HomeController.extend({
	onBeforeAction: function () {
		var self      = this/*,
			routeName = self.route.getName(),
			token     = self.params.token*/;

		// Set the reactive state variable 'sessionId'
		// with a value of the id from our url
		// self.state.set( 'sessionId', self.params.sessionId );

		self.next();
	}
});
