/*****************************************************************************/
/* LiveTutor Server Methods */
/*****************************************************************************/
Meteor.methods({
	'LiveTutor.session.create': function ( options ) {
		var self = this,
			session,
			openTokClient,
			openTokSecret,
			openTokOptions = {
				// Options are 'routed' (through openTok servers) and 'relayed' (Peer to Peer)
				mediaMode: 'relayed',

				// An IP address that the OpenTok servers will use to situate the session in the global OpenTok network.
				location : '127.0.0.1'
			},
			sessionOptions = {
				// The role for the token. Each role defines a set of permissions granted to the token
				// 'subscriber' - Clients that connect with a subscriber token can connect to OpenTok sessions and subscribe to other clients' streams. They cannot publish their own streams to a session
				// 'publisher' - Clients that connect with a publisher token can connect to OpenTok sessions, publish audio-video streams to the session, and subscribe to other clients' streams
				// 'moderator' - In addition to publishing and subscribing to streams, moderators can force other clients to disconnect from a session or force a client to stop publishing an audio-video stream. (Only the OpenTok JavaScript library supports moderation features. Moderation is not supported in iOS clients.)
				role      : 'publisher',
				data      : 'invitationId:' + options.invitationId,

				// (24 hours) The expiration time for the token, in seconds since the UNIX epoch.
				// The maximum expiration time is 30 days after the creation time.
				// The default expiration time of 24 hours after the token creation time.
				expireTime: Math.round( new Date().getTime() / 1000 ) + ( 24/*h*/ * 60/*m*/ * 60/*s*/ )
			};

		if (
			Meteor.settings &&
			Meteor.settings.private &&
			Meteor.settings.private.LiveTutor &&
			Meteor.settings.private.LiveTutor.OpenTok
		) {
			openTokSecret = Meteor.settings.private.LiveTutor.OpenTok.secret;

			if ( openTokSecret ) {
				session = {
					// Save these to DB
					invitationId  : options.invitationId,

					tutorId       : options.tutorId,
					studentId     : options.studentId,
					moderatorId   : options.moderatorId,

					status        : 'created',
					createdAt     : new Date(),

					expireTime    : sessionOptions.expireTime,

					// These get populated as needed
					feedback      : {
					/*
						tutor  : {
							rate     : '',
							text     : '',
							createdAt: ''
						},
						student: {
							rate     : '',
							text     : '',
							createdAt: ''
						}
					*/
					},

					sessionId     : '',
					tutorToken    : '',
					moderatorToken: '',
					studentToken  : ''
				};

				openTokClient = new OpenTokClient( options.openTokApiKey, openTokSecret );

				session.sessionId = openTokClient.createSession( openTokOptions );

				session.tutorToken = openTokClient.generateToken( session.sessionId, sessionOptions );
				session.studentToken = openTokClient.generateToken( session.sessionId, sessionOptions );
				sessionOptions.role = 'moderator';
				session.moderatorToken = openTokClient.generateToken( session.sessionId, sessionOptions );

				// Finally, create a session
				Sessions.insert( session );

				session = Sessions.find({
					invitationId: options.invitationId
				}).fetch()[ 0 ];
			}
		} else {
			throw new Meteor.Error(
				404,
				'[LiveTutor] Error 404: Configuration Not found',
				'[LiveTutor] There are no configuration settings'
			);
		}

		return session;
	}
});
