if ( Accounts.custom ) {
	// Run this function when user signs up with social account
	Accounts.custom.onSignUpWithSocialService = function ( serviceName ) {
/*		if ( serviceName === 'linkedin' ) {
			var profile = Meteor.user().profile,
				// Find last company in the list of current companies
				company = ( profile.threeCurrentPositions && profile.threeCurrentPositions._total > 0 ) ?
							profile.threeCurrentPositions.values[ profile.threeCurrentPositions._total - 1 ].company.name
						:
							null,
				// Convert skills from objects to array of strings
				skills = ( profile.skills && profile.skills._total > 0 ) ?
							_.map( profile.skills.values, function ( value ) {
								return value.skill.name;
							}).join( ', ' )
						:
							null;

			if ( company || skills ) {
				Meteor.users.update({
					_id: Meteor.userId()
				}, {
					$set: {
						profile: _.extend( {}, Meteor.user().profile, {
							// TODO: Move 'groups' to some kind of app preferences(?)
							groups      : [ 'ZIP' ],
							title       : profile.headline,
							name        : profile.firstName + ' ' + profile.lastName,
							linkedinUrl : profile.publicProfileUrl,
							company     : company,
							specialities: skills
						})
					}
				});
			}
		}
*/	};

	// Run this function when user signs in with social account
	Accounts.custom.onSignInWithSocialService = function ( serviceName ) {};
}
