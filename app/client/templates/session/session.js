var liveTutor,
	session = {
		mySession: null,
		isTutor  : false,

		// TODO: put these two in preferences
		showTime : true,
		showPrice: false,

		// TODO: move these globals to template handler(s)
		expiring: false,
		expired : false,

		// videoContainer = $( '.LT_video' ),
		videoContainerName : 'LT_video',
		// cameraContainer = $( '.LT_videoCamera' ),
		cameraContainerName: 'LT_videoCamera',
		// streamContainer = $( '.LT_videoStream' ),
		streamContainerName: 'LT_videoStream',
		// Multiple attendees video container
		layout: null,

		mainMenu : null,
		userMenu : null,
		boardMenu: null,

		pauseSession: function () {
			if ( session.isTutor ) {
				liveTutor.request( 'paused' );
			} else {
				if ( window.confirm( 'Ask trainer to pause the session?' ) ) liveTutor.request( 'pause' );
			}
		},

		resumeSession: function () {
			if ( session.isTutor ) {
				liveTutor.request( 'active' );
			} else {
				if ( window.confirm( 'Ask trainer to resume session?' ) ) liveTutor.request( 'resume' );
			}
		},

		showSessionInfo: function ( message ) {
			var infoMessage = $( ".LT_infoMessage" );

			infoMessage.text( message ).show();
			infoMessage.fadeOut( 5000, "swing", function () {
				infoMessage.text( "" );
			});
		},

		showSessionTime: function ( seconds, scheduledTime) {
			$( ".LT_timer" ).html( session.timeToString( seconds ) );
			$( ".LT_timerTotal" ).html( "/" + session.timeToString( scheduledTime ) );

			if ( seconds < ( 10 * 60 ) ) {
				$( ".LT_timer" ).removeClass( "LT_narrow" );
			} else {
				$( ".LT_timer" ).addClass( "LT_narrow" );
			}

			if ( scheduledTime < ( 60 * 60 ) ) {
				$( ".LT_timerTotal" ).removeClass( "LT_narrow" );
			} else {
				$( ".LT_timerTotal" ).addClass( "LT_narrow" );
			}
		},

		showSessionPrice: function ( price, sessionPrice ) {
			$( ".LT_price" ).html( "$" + session.priceToString( price ) );
			$( ".LT_priceTotal" ).html( "/$" + session.priceToString( sessionPrice ) );

			if ( price < ( 1000 ) ) {
				$( ".LT_price" ).removeClass( "LT_narrow" );
			} else {
				$( ".LT_price" ).addClass( "LT_narrow" );
			}

			if ( sessionPrice < ( 1000 ) ) {
				$( ".LT_priceTotal" ).removeClass( "LT_narrow" );
			} else {
				$( ".LT_priceTotal" ).addClass( "LT_narrow" );
			}
		},

		timeToString: function ( seconds ) {
			if ( seconds > 0 ) {
				var hh = Math.floor( seconds / 3600 );
				var mm = Math.floor( ( seconds - ( hh * 3600 ) ) / 60 );
				var ss = seconds % 60;

				mm = ( mm < 10 && hh > 0 ) ? "0" + mm : mm;
				ss = ss < 10 ? "0" + ss : ss;

				if ( hh > 0 ) {
					return hh + ":" + mm + ":" + ss;
				} else {
					return mm + ":" + ss;
				}
			} else {
				return "0:00";
			}
		},

		priceToString: function ( price ) {
			var priceNumber = new Number( price );

			return priceNumber.toFixed( 2 ).replace( /(\d)(?=(\d{3})+\.)/g, "$1," );
		},

		updateSessionControls: function ( mode ) {
			switch ( mode ) {
				case "resume":
					$( "#LT_sessionControl" )
						.removeClass( "fc-icon-play" )
						.addClass( "fc-icon-pause" );
					try {
						$( "#LT_sessionControl" ).tooltip({ content: "Pause Session" });
					} catch(e) {}
					break;
				case "pause":
					$( "#LT_sessionControl" )
						.removeClass( "fc-icon-pause" )
						.addClass( "fc-icon-play" );
					try {
						$( "#LT_sessionControl" ).tooltip({ content: "Start/Resume Session" }).tooltip( "close" );
					} catch(e) {}
					break;
				default:
			}
		},

		zoomVideo: function () {
			// if ( jQuery.fullscreen.isFullScreen() ) {
			// 	jQuery.fullscreen.exit();
			// } else {
			// 	jQuery( ".LT_zoomedView" ).fullscreen();
			// }
		},

		showVideo: function ( event ) {
			if ( event ) event.preventDefault();
/*
			session.mainMenu.close( function () {
				// $( '#userId > header' ).detach().appendTo( '.pt-page-1' );
				setTimeout( function () {
					PageTransitions.nextPage( 17, 1 );

					$( '.videoToggle' ).hide();
					$( '.boardToggle' ).show();
					$( '.filesToggle' ).show();

					session.boardMenu.close();
				}, 250 );
			});
*/		},

		sessionQuit: function ( event ) {
			if ( event ) event.preventDefault();

			if ( window.confirm(
					'Would you really want to quit this session?\n\n' +
					'IMPORTANT!\n\n' +
					'YOU WILL NOT BE ABLE TO RETURN\n' +
					'TO THIS SESSION ANY MORE!\n\n' +
					'Do you still want to quit the session?'
				)
			) {

				// session.showFeedbackModal();

				if ( session.isTutor ) {
					liveTutor.request( 'closed' );

					// Mark session as finished
					CB.sessions.finish( session.mySession );
				} else {
					liveTutor.request( 'close' );
				}
			}
		}
	};

	// A quick hack!
	// TODO: Remove this!
/* global */ sessionQuit = session.sessionQuit;

/*****************************************************************************/
/* Session: Event Handlers and Helpers */
/*****************************************************************************/
Template.session.events({
	'click #LT_sessionControl': function ( event, template ) {
		event.preventDefault();

		switch ( liveTutor.sessionStatus ) {
			case 'active':
				session.pauseSession();

				break;

			case 'paused':
				session.resumeSession();

				break;

			default:
				// Do nothing.
		}
	},

	// This doesn't apply because the menu gets hidden
	// TODO: Maybe move to separate template(?)
	'click #LT_sessionQuit': function ( event, template ) {
		session.sessionQuit( event, template );
	}
});

Template.session.helpers({
	session: function () {
		return session.mySession;
	},

	isPrivateSession: function () {
		return ( session.event && session.event.type ) ? session.event.type == 'private' : true;
	},

	sessionTitle: function () {
		var invitation = SessionInvitations.find({
				sessionId: session.mySession._id
			}).fetch();

		if ( invitation.length ) {
			return invitation[ 0 ].subject;
		}
	}
});

/*****************************************************************************/
/* Session: Lifecycle Hooks */
/*****************************************************************************/
Template.session.created = function () {
	var controller = Iron.controller(),
		// reactively return the value of sessionId
		sessionId = controller.params.sessionId,
		sessionToken,
		sessionAttendees,
		userRole;

	if ( sessionId ) {
		session.mySession = Sessions.findOne({
			_id: sessionId
		});

		if ( session.mySession ) {
			if (
				Meteor.settings &&
				Meteor.settings.public &&
				Meteor.settings.public.LiveTutor &&
				Meteor.settings.public.LiveTutor.OpenTok/* &&
				Meteor.settings.public.LiveTutor.Filepicker*/
			) {
				session.event = CalendarEvents.findOne({
					_id: session.mySession.invitationId
				});

				if ( session.event ) {
					sessionAttendees = session.event.attendees;
				} else {
					sessionAttendees = [
						session.mySession.studentId
					];
				}

				if ( session.mySession.tutorId === Meteor.userId() ) {
					userRole = 'tutor';
					sessionToken = session.mySession.tutorToken;

					session.isTutor = true;
				} else if ( session.mySession.studentId === Meteor.userId() ) {
					userRole = 'student';
					sessionToken = session.mySession.studentToken;
				} else {
					userRole = 'moderator';
					sessionToken = session.mySession.moderatorToken;
				}

				liveTutor = new LiveTutor({
					dbPath           : 'https://livetutor.firebaseio.com/CrossBit/',
					id               : session.mySession.invitationId,

					// User's role ('tutor|moderator|student')
					userRole         : userRole,

					startPaused      : false,
					pauseOnDisconnect: true,
					countDown        : false,

					APIkey           : Meteor.settings.public.LiveTutor.OpenTok.key,
					fpAPIkey         : Meteor.settings.public.LiveTutor.Filepicker.key,
					sessionID        : session.mySession.sessionId,
					sessionToken     : sessionToken,

					maxParticipants  : sessionAttendees.length + 1, // Students + tutor
					// sessionLength		: 3600, // 60 minutes
					sessionLength    : 30 * 60, // 30 minutes
					expiringAlert    : 5 * 60  // 5 minutes
				});
			}
		}
	}
};

Template.session.rendered = function () {
	if ( session.mySession ) {
		window.PageTransitions = new _pageTransitions();

		session.mainMenu = new gnMenu( document.getElementById( 'gn-menu' ) );
		// session.userMenu  = new fcMenu( document.getElementById( 'fc-menu' ) );
		// session.boardMenu = new rbMenu( document.getElementById( 'rb-menu' ) );

		$( '#LT_fsize' ).html( $( '#LT_slider' ).slider( 'value' ) );

		$( document ).tooltip();

		// Prepare menu
		escape( $ );

		if ( liveTutor.sessionStatus ) {
			switch ( liveTutor.sessionStatus ) {
				case 'active':
					session.updateSessionControls( 'resume' );

					break;

				case 'paused':
					session.updateSessionControls( 'pause' );

					break;

				default:
			}
		}

		switch ( session.event.type ) {
			case 'public':
				// TODO: Implement different layout for Public (broadcast) session

			case 'group':
				session.cameraContainer = $( '<div/>' ).attr( 'id', session.cameraContainerName ).addClass( 'LT_videoTutor' );

				session.layoutContainer = $( '.' + session.videoContainerName );
				session.layout = initLayoutContainer( session.layoutContainer.get( 0 ), {
					animate: {
						duration: 500,
						easing  : 'swing'
					},
					bigFixedRatio: false
				}).layout;

				session.layoutContainer.append( session.cameraContainer );
				// session.layout();

				window.onresize = function () {
					clearTimeout( session.resizeTimeout );

					session.resizeTimeout = setTimeout( function () {
						session.layout();
					}, 20 );
				};

				// $( '.' + session.videoContainerName + '>*' ).live( 'dblclick', function () {
				// 	if ( $( this ).hasClass( 'OT_big' ) ) {
				// 		$( this ).removeClass( 'OT_big' );
				// 	} else {
				// 		$( this ).addClass( 'OT_big' );
				// 	}

				// 	session.layout();
				// });

				break;

			default:
		}

		liveTutor
			// Setup modules
			.video(
				session.cameraContainerName,
				session.streamContainerName,
				// Camera Published
				function ( event ) {
					// Add button to disable video publishing
					var videoMuteButton = $( "<button class='LT_videoMute' title='Turn off my video'></button>" );
					var myVideoVisible = true;

					// Show Mute My Video button
					videoMuteButton.click( function ( event ) {
						myVideoVisible = !myVideoVisible;
						liveTutor.publisher.publishVideo( myVideoVisible );
						if ( !myVideoVisible ) {
							videoMuteButton.addClass( 'LT_videoMuted' );
						} else {
							videoMuteButton.removeClass( 'LT_videoMuted' );
						}
					});

					$( '#' + session.cameraContainerName ).hover( function () {
						videoMuteButton.fadeIn( 500, 'linear' );
					}, function () {
						videoMuteButton.fadeOut( 500, 'linear' );
					});

					videoMuteButton.fadeOut( 500, 'linear' );
					videoMuteButton.tooltip();

					$( '#' + session.cameraContainerName ).append( videoMuteButton );

					switch ( session.event.type ) {
						case 'public':
							// TODO: Implement different layout for Public (broadcast) session

						case 'group':
							// session.layoutContainer.append( session.cameraContainer );
							session.layout();

							break;

						default:
							// Private session
					}
				},
				// Camera Unpublished
				function ( event ) {
					event.preventDefault();

					$( '.' + liveTutor.cameraContainerName ).empty();

					$( '.LT_videoCamera' ).unbind( 'hover' );
					$( '.LT_videoMute' ).unbind( 'click' ).remove();

					switch ( session.event.type ) {
						case 'public':
							// TODO: Implement different layout for Public (broadcast) session

						case 'group':
							session.cameraContainer.remove();
							session.layout();

							break;

						default:
							// Private session
					}
				},
				// Subscribed to stream
				function ( streamData, callback ) {
					if ( streamData && streamData.stream ) {
						var id = 'LT_' + streamData.stream.streamId,
							streamContainer = $( '<div/>' ).attr( 'id', id ).addClass( id );

						switch ( session.event.type ) {
							case 'public':
								// TODO: Implement different layout for Public (broadcast) session

							case 'group':
								$( '.LT_videoConnecting' ).hide( 'slow' );

								session.layoutContainer.append( streamContainer );
								session.layout();

								streamData.container = id;

								if ( callback ) callback( streamData );

								break;

							default:
								// Private session
								$( '.LT_videoConnecting' ).hide( 'slow', function () {
									$( '.LT_video' ).show( 'slow', function () {
										// TODO: Check this out!
										$( '#' + stream.container ).appendTo( $( '.' + liveTutor.streamContainerName ) );

										if ( callback ) callback( streamData );
									});
								});
						}
					}
				},
				// Unsubscribed from stream
				function ( stream, event ) {
					if ( stream && stream.streamId != liveTutor.publishedStream.streamId ) {
						if ( event ) event.preventDefault();

						switch ( session.event.type ) {
							case 'public':
								// TODO: Implement different layout for Public (broadcast) session

							case 'group':
								$( 'div#LT_' + stream.streamId ).remove();

								session.layout();

								break;

							default:
								// Private session
								$( '.LT_video' ).hide( 'slow' , function () {
									$( 'div#LT_' + stream.streamId ).remove();
									$( '.LT_videoConnecting' ).show( 'slow' );
								});
						}
					}
				}
			)
			.presence(
				Meteor.user().username || Meteor.user().profile.name,
				$( ".LT_chatStatus" ),
				$( ".LT_otherParty" )
			)
			.chat(
				$( ".LT_messages" ),
				$( ".LT_messagesList" ),
				$( ".LT_messageInputField" )
			)

			// Setup event handlers
			.on( 'initialize', function () {
				if ( session.isTutor ) {
					liveTutor.request( 'active' );
				}
			})
			.on( 'resume', function () {
				if ( session.isTutor ) {
					// if ( window.confirm( 'Student requests to resume the session.\nDo you accept the request?' ) ) {
					if ( window.confirm( 'A member requests to resume the session.\nDo you accept the request?' ) ) {
						liveTutor.request( 'active' );
					} else {
						liveTutor.decline( 'resume' );
					}
				}
			})
			.on( 'active', function () {
				liveTutor.resume();
				if ( session.showTime ) {
					$( ".LT_timer" ).removeClass( "LT_paused LT_expiring LT_expired" );
				}
				session.updateSessionControls( "resume" );
				session.showSessionInfo( "The session is resumed!" );
			})
			.on( 'pause', function () {
				if ( session.isTutor ) {
					// if ( window.confirm( 'Student requests to pause the session.\nDo you accept the request?' ) ) {
					if ( window.confirm( 'A member requests to pause the session.\nDo you accept the request?' ) ) {
						liveTutor.request( 'paused' );
					} else {
						liveTutor.decline( 'pause' );
					}
				}
			})
			.on( 'paused', function () {
				liveTutor.pause();
				if ( session.showTime ) {
					$( ".LT_timer" ).removeClass( "LT_paused LT_expiring LT_expired" );
				}
				session.updateSessionControls( "pause" );
				session.showSessionInfo( "The session is paused!" );
			})
			.on( 'close', function () {
				if ( session.isTutor ) {
					if ( window.confirm(
						'A member has requested to end the session!\n\n' +
						'IMPORTANT!\n\n' +
						'IF YOU CONFIRM, BOTH YOU AND THE\n' +
						'STUDENT WILL NOT BE ABLE TO RETURN\n' +
						'TO THIS SESSION ANY MORE!\n\n' +
						'Do you want to confirm the request?'
					)) {
						liveTutor.request( 'closed' );
					} else {
						liveTutor.request( 'active' );
					}
				}
			})
			.on( 'closed', function () {
				$( '.LT_menu' ).hide();
				// Hide LiveTutor Panels
				$( '*[class^="LT_tabs-"]' ).hide();

				if ( session.showTime ) {
					$( '.LT_timer' ).removeClass( 'LT_paused LT_expiring LT_expired' ).addClass( 'LT_completed' );
				}
				if ( session.showPrice ) {
					$( '.LT_price' ).removeClass( 'LT_paused LT_expiring LT_expired' ).addClass( 'LT_completed' );
				}

				liveTutor.quit();

				Router.go( '/trainers' );
			});

		// Setup modules
		if ( session.showTime ) {
			liveTutor.timer( function ( seconds, scheduledTime ) {
					session.showSessionTime( seconds, scheduledTime );
				},
				// Session is expiring
				function () {
					if ( session.showTime ) {
						$( ".LT_timer" ).removeClass( "LT_paused LT_expiring LT_expired" ).addClass( "LT_expiring" );
					}
					if ( !session.expiring ) {
						session.showSessionInfo( "The session is expiring!" );
						session.expiring = true;
					}
				},
				// Session has expired
				function () {
					if ( session.showTime ) {
						$( ".LT_timer" ).removeClass( "LT_paused LT_expiring LT_expired" ).addClass( "LT_expired" );
					}
					if ( !session.expired ) {
						if ( session.isTutor ) {
							liveTutor.pause();
						}
						session.showSessionInfo( "The session has expired!" );
						session.expired = true;
					}
				}
			);
		}

		if ( session.showPrice ) {
			liveTutor.price( session.showSessionPrice( price, liveTutor.options.sessionPrice ) );
		}
	}
};

Template.session.destroyed = function () {};
