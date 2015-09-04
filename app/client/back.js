/*****************************************************************************/
/* Back App Namespace  */
/*****************************************************************************/
_.extend( CB, {
	normalizedInvitations: function ( invitations ) {
		var mapUser = function ( userList, userId  ) {
				return _.find( userList, function ( user ) {
					return ( user._id == userId );
				});
			},

			list         = [],
			result       = [],
			otherParties = [],
			userList,
			otherParty;

		if ( invitations.length ) {
			_.map( invitations, function ( invitation ) {
				otherParty = ( invitation.inviter != Meteor.userId() ) ?
					invitation.inviter
					:
					invitation.invitee;

				list.push( otherParty );

				otherParties.push({
					invitationId: invitation._id,
					otherParty  : otherParty,
					status      : invitation.status,
					subject     : invitation.subject,
					info        : invitation.info,
					invitedAt   : invitation.invitedAt,
					acceptedAt  : invitation.acceptedAt,
					activatedAt : invitation.activatedAt,
					startedAt   : invitation.startedAt,
					stoppedAt   : invitation.stoppedAt,
					finishedAt  : invitation.finishedAt
				});
			});

			userList = Meteor.users.find({
				_id: {
					'$in': list
				}
			}).fetch();

			if ( userList.length ) {
				_.map( otherParties, function ( party ) {
					party.otherParty = mapUser( userList, party.otherParty );
				});
			}
		}

		return otherParties;
	},

	queries: {
		users: {
			status: function ( status ) {
				switch ( status ) {
					case 'online':
						return {
							_id: {
								'$ne': Meteor.userId()
							},

							'profile.groups': {
								'$in': (
										Meteor.user() &&
										Meteor.user().profile &&
										Meteor.user().profile.groups
									) ? Meteor.user().profile.groups : []
							},

							'status.online': true
						};

					case 'offline':
						return {
							_id: {
								'$ne': Meteor.userId()
							},

							'profile.groups': {
								'$in': (
										Meteor.user() &&
										Meteor.user().profile &&
										Meteor.user().profile.groups
									) ? Meteor.user().profile.groups : []
							},

							'status.away': {
								'$ne': true
							},
							'status.online': {
								'$ne': true
							}
						};
					default:
						return {
							_id: {
								'$ne': Meteor.userId()
							}
						};
				}
			}
		}
	},

	users: {
		count: function ( status ) {
			switch ( status ) {
				case 'online':
					return Meteor.users.find( CB.queries.users.status( 'online' ) ).count();

				case 'offline':
					return Meteor.users.find( CB.queries.users.status( 'offline' ) ).count();

				default:
					return 0;
			}
		},

		newSignup: function ( fullName, email, callback ) {
			var newUserData = {
					to     : email,
					from   : 'would@uducate.me',
					subject: 'Welcome to UducateMe private beta!',
					text   : 'Welcome to our community!\n\n' +
							'We\'ll notify you when we\'ll be ready to get you on board.\n\n' +
							'Stay tuned!\n\n' +
							'-- The UducateMe team'
				},
				ourNotificationData = {
					to     : 'would@uducate.me',
					from   : email,
					subject: 'New private beta user signup',
					text   : fullName + ' (' + email + ') just signed up for private beta.\n\n' +
							'--- Private beta signup form ;)'
				};

			// Send notification email to new user
			Meteor.call( 'Email.send', newUserData, function ( error, result ) {
				if ( !error ) {
					// Send us a notification as well
					Meteor.call( 'Email.send', ourNotificationData, function ( error, result ) {
						if ( callback ) callback( error, result );
					});
				}
			});
		}
	},

	user: {
		isTrainer: function ( userId ) {
			if ( !userId ) return false;

			return !!Meteor.users.findOne({
				_id                : userId,
				'profile.isTrainer': true
			});
		},

		isOnline: function ( userId ) {
			if ( !userId ) return false;

			return !!Meteor.users.findOne({
				_id            : userId,
				'status.online': true
			});
		},

		getSpecialities: function ( userId ) {
			// Return array of user's specialities
			if ( !userId ) return;

			var user = Meteor.users.findOne( userId ),
				userSpecialities = [];

			if (
				user &&
				user.profile &&
				user.profile.specialities &&
				user.profile.specialities.length
			) {
				if ( typeof user.profile.specialities === 'string' ) {
					userSpecialities = user.profile.specialities.split( ',' );
				} else {
					userSpecialities = user.profile.specialities;
				}

				userSpecialities = _.map( userSpecialities, function ( speciality ) {
					return speciality.trim();
				});
			}

			return userSpecialities;
		},

		setSpecialities: function ( userId, specialities, callback ) {
			// Set user's specialities
			var userSpecialities = specialities || [];

			if ( userId ) {

				if ( typeof userSpecialities === 'string' ) {
					userSpecialities = userSpecialities.split( ',' );
				}

				userSpecialities = _.map( userSpecialities, function ( speciality ) {
					return speciality.trim();
				});

				Meteor.users.update({
					_id: userId
				}, {
					$set: {
						'profile.specialities': userSpecialities
					}
				}, function ( error, result ) {
					if ( callback ) callback( error, result );
				});
			} else if ( callback ) {
				callback( false );
			}
		}
	},

	emails: {
		// sendSessionInvitation: function ( invitation, callback ) {
		// 	Meteor.call( 'Email.sendSessionInvitation', invitation, function ( error, result ) {
		// 		if ( !error ) {
		// 			// Handle success
		// 			CB.invitations.setStatus( invitation._id, 'sent' );
		// 		}

		// 		if ( callback ) callback( error, 'sent' );
		// 	});
		// },

		sendSessionInvitation: function ( session, callback ) {
			Meteor.call( 'Email.sendSessionInvitation', session, function ( error, result ) {
				// if ( !error ) {
				// 	// Handle success
				// 	CB.invitations.setStatus( invitation._id, 'sent' );
				// }

				if ( callback ) callback( error, result );
			});
		},

		sendSessionAcceptance: function ( invitation, callback ) {
			Meteor.call( 'Email.sendSessionAcceptance', invitation, function ( error, result ) {
				if ( !error ) {
					// Handle success
					CB.invitations.setStatus( invitation._id, 'acceptanceSent' );
				}

				if ( callback ) callback( error, 'acceptanceSent' );
			});
		}
	},

	appointments: {
		availableSlots: function ( forUser ) {
			var betweenStart,			// ASAP
				andEnd,					// we'll take default from Appointments package
				withDurationOf = 30,	// minutes

				availableSlots = Appointments.getAvailableSlotsFor( forUser, betweenStart, andEnd, withDurationOf ),
				day;

			return _.map( availableSlots, function ( slots, dayName ) {
				day = {};
				day[ dayName ] = slots;

				return day;
			});
		}
	},

	invitations: {
		setStatus: function ( invitationId, status, params ) {
			var invitation,
				newStatus = {
					status: status || 'updated'
				};

			if ( invitationId ) {
				invitation = CB.invitations.getById( invitationId );

				if ( invitation ) {
					switch ( status ) {
						case 'invited':
							newStatus.invitedAt = new Date();
							break;

						case 'sent':
							newStatus.sentAt = new Date();
							break;

						case 'acceptanceSent':
							newStatus.acceptanceSentAt = new Date();
							break;

						case 'accepted':
							newStatus.acceptedAt = new Date();

							if ( params ) {
								newStatus.timeSlot = params.timeSlot;
							}

							break;

						case 'active':
							newStatus.activatedAt = new Date();
							break;

						case 'started':
							newStatus.startedAt = new Date();
							break;

						case 'stopped':
							newStatus.stoppedAt = new Date();
							break;

						case 'finished':
							newStatus.finishedAt = new Date();
							break;

						default:
							// No default this time...
							newStatus.updatedAt = new Date();
					}

					SessionInvitations.update({
						_id: invitationId
					}, {
						$set: newStatus
					});
				} else {
					// Handle 'No invitation' error...
				}
			}
		},

		getById: function ( invitationId ) {
			return SessionInvitations.find({
				_id: invitationId
			}, {
				/*
				sort     : Sort specifier,
				skip     : Number,
				limit    : Number,
				fields   : Field specifier,
				reactive : Boolean,
				transform: Function
				*/
			});
		},

		invite: function ( invitation, callback ) {
			var invitationId;

			if ( invitation ) {
				invitation.invitedAt = new Date();

				invitationId = SessionInvitations.insert( invitation, function ( error ) {
					if ( !error ) {
						// Send email invitation
						invitation._id = invitationId;

						if ( CB.user.isOnline( invitation.invitee ) ) {
							if ( callback ) callback( false, 'invited' );
						} else {
							// Send email invitation only if invitee is offline
							CB.invitations.send( invitation, callback );
						}
					}
				});
			} else {
				if ( callback ) callback( true );
			}
		},

		send: function ( invitation, callback ) {
			if ( invitation ) {
				CB.emails.sendSessionInvitation( invitation, callback );
			} else {
				if ( callback ) callback( true );
			}
		},

		accept: function ( invitationId, forTimeSlot, callback ) {
			var invitation;

			CB.invitations.setStatus( invitationId, 'accepted', {
				timeSlot: forTimeSlot
			});

			invitation = CB.invitations.getById( invitationId ).fetch();

			if ( invitation.length ) {
				if ( CB.user.isOnline( invitation[ 0 ].inviter ) ) {
					if ( callback ) callback( false, 'accepted' );
				} else {
					// Send email acceptance only if invitee is offline
					CB.invitations.sendAcceptance( invitation[ 0 ], callback );
				}
			} else {
				if ( callback ) callback( true );
			}
		},

		sendAcceptance: function ( invitation, callback ) {
			if ( invitation ) {
				CB.emails.sendSessionAcceptance( invitation, callback );
			} else {
				if ( callback ) callback( true );
			}
		},

		getSent: function () {
			// Returns an array!
			return CB.normalizedInvitations( SessionInvitations.find({
					status: {
						'$in': [
							'invited',
							'sent'
						]
					},

					// AND
					inviter: Meteor.userId()
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch()
			);
		},

		getReceived: function () {
			// Returns an array!
			return CB.normalizedInvitations( SessionInvitations.find({
					status: {
						'$in': [
							'invited',
							'sent'
						]
					},

					// AND
					invitee: Meteor.userId()
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch()
			);
		},

		getAccepted: function () {
			// Returns an array!
			return CB.normalizedInvitations( SessionInvitations.find({
					status: {
						'$in': [
							'accepted',
							'acceptanceSent',

							// We'll take into account active sessions too
							'active'
						]
					},

					// AND
					'$or': [
						{
							inviter: Meteor.userId()
						},
						{
							invitee: Meteor.userId()
						}
					]
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch()
			);
		},

		getActive: function () {
			// Returns an array!
			return CB.normalizedInvitations( SessionInvitations.find({
					status: 'active',

					// AND
					'$or': [
						{
							inviter: Meteor.userId()
						},
						{
							invitee: Meteor.userId()
						}
					]
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch()
			);
		},

		getAllFor: function ( userId ) {
			// Returns an array!
			var invitations;

			userId = ( userId ) ? userId : Meteor.userId();
			invitations = CB.normalizedInvitations( SessionInvitations.find({
					'$or': [
						{
							inviter: userId
						},
						{
							invitee: userId
						}
					]
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch()
			);

			return invitations;
		}
	},

	sessions: {
		setStatus: function ( sessionId, status, params ) {
			var session,
				newStatus = {
					status: status || 'updated'
				};

			if ( sessionId ) {
				session = Sessions.find({
					_id: sessionId
				}).fetch();

				if ( session.length ) {
					switch ( status ) {
						case 'active':
							newStatus.activatedAt = new Date();
							break;

						case 'started':
							newStatus.startedAt = new Date();
							break;

						case 'stopped':
							newStatus.stoppedAt = new Date();
							break;

						case 'finished':
							newStatus.finishedAt = new Date();
							break;

						default:
							// No default this time...
							newStatus.updatedAt = new Date();
					}

					Sessions.update({
						_id: sessionId
					}, {
						$set: newStatus
					});
				} else {
					// Handle 'No invitation' error...
				}
			}
		},

		create: function ( invitation, callback ) {
			if ( invitation && callback ) {
				var session = Sessions.find({
						invitationId: invitation._id
					}).fetch(),
					options;

				if ( session.length ) {
					callback( false, session[ 0 ] );
				} else {
					if (
						Meteor.settings &&
						Meteor.settings.public &&
						Meteor.settings.public.LiveTutor &&
						Meteor.settings.public.LiveTutor.OpenTok &&
						Meteor.settings.public.LiveTutor.Filepicker
					) {
						options = {
							invitationId    : invitation._id,

							tutorId         : invitation.invitee,
							moderatorId     : invitation.invitee,
							studentId       : invitation.inviter,

							openTokApiKey   : Meteor.settings.public.LiveTutor.OpenTok.key/*,
							filepickerApiKey: Meteor.settings.public.LiveTutor.Filepicker.key*/
						};

						Meteor.call( 'LiveTutor.session.create', options, callback );
					}
				}
			}
		},

		activate: function ( invitation, callback ) {
			CB.sessions.create( invitation, function ( error, session ) {
				if ( error ) {
					// Handle error...
				} else {
					if ( session && session._id ) {
						CB.sessions.setStatus( session._id, 'active' );
						CB.invitations.setStatus( invitation._id, 'active' );

						if ( callback ) {
							callback( false, session );
						}
					}
				}
			});
		},

		start: function ( session ) {
			CB.sessions.setStatus( session._id, 'started' );
			CB.invitations.setStatus( session.invitationId, 'started' );
		},

		stop: function ( session ) {
			CB.sessions.setStatus( session._id, 'stopped' );
			CB.invitations.setStatus( session.invitationId, 'stopped' );
		},

		finish: function ( session ) {
			CB.sessions.setStatus( session._id, 'finished' );
			CB.invitations.setStatus( session.invitationId, 'finished' );
		},

		getAllFor: function ( userId ) {
			var sessions;

			userId = ( userId ) ? userId : Meteor.userId();

			sessions = Sessions.find({
					'$or': [
						{
							tutorId: userId
						},
						{
							moderatorId: userId
						},
						{
							studentId: userId
						}
					]
				}, {
					/*
					sort     : Sort specifier,
					skip     : Number,
					limit    : Number,
					fields   : Field specifier,
					reactive : Boolean,
					transform: Function
					*/
				}).fetch();

			return sessions;
		}
	},

	feedbacks: {
		save: function ( sessionId, feedback ) {
			var session = Sessions.find({
					_id: sessionId
				}).fetch(),
				newFeedback = ( session.length && session[ 0 ].feedback ) ? session[ 0 ].feedback : {};

			if ( session.length ) {
				if ( session[ 0 ].tutorId == Meteor.userId() ) {
					newFeedback.tutor = feedback;
				} else {
					newFeedback.student = feedback;
				}

				newFeedback.createdAt = new Date();

				Sessions.update({
					_id: sessionId
				}, {
					$set: {
						feedback: newFeedback
					}
				});
			}
		},

		getRatedFor: function ( userId, queryRole, queryRate ) {
			var sessions,
				feedbacks = [],
				queryUserId = ( userId ) ? userId : Meteor.userId(),
				role = queryRole || 'tutor',
				rate = queryRate || 'Excellent',
				query = {};

			query[ 'feedback.' + role + '.rate' ] = rate;

			sessions = Sessions.find( query, {
				/*
				sort     : Sort specifier,
				skip     : Number,
				limit    : Number,
				fields   : Field specifier,
				reactive : Boolean,
				transform: Function
				*/
			}).fetch();

			_.map( sessions, function ( session ) {
				feedbacks.push( session.feedback );
			});

			return feedbacks;
		}
	},

	modals: {
		show: function ( modal, data, onShown, onHidden ) {
			var $thisModal = ( typeof modal == 'string' ) ? $( modal ) : modal,

				onShownHandler = function ( event ) {
					// On modal opening, return eventually modified data
					$thisModal.off( 'shown.bs.modal', onShownHandler );

					onShown( null, $thisModal.data() );
				},

				onHiddenHandler = function ( event ) {
					// Upon closing modal, return eventually modified data
					$thisModal.off( 'hidden.bs.modal', onHiddenHandler );

					onHidden( null, $thisModal.data() );
				};

			$thisModal.off( 'shown.bs.modal', onShownHandler );
			$thisModal.off( 'hidden.bs.modal', onHiddenHandler );

			if ( data ) {
				$thisModal.data( data );
			}

			if ( onShown ) {
				$thisModal.on( 'shown.bs.modal', onShownHandler );
			}

			if ( onHidden ) {
				$thisModal.on( 'hidden.bs.modal', onHiddenHandler );
			}

			$thisModal.modal( 'show' );
		},

		hide: function ( modal ) {
			var $thisModal = ( typeof modal == 'string' ) ? $( modal ) : modal;

			$thisModal.modal( 'hide' );
		}
	}
});
