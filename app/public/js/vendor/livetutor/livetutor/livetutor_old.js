// ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ LiveTutor 1.1.4 - Cross-browser online tutoring system                                      │ \\
// │ 	Version History:                                                                         │ \\
// │ 		v1.1.4: Upgraded to FireCollab v0.2.0                                                │ \\
// │ 				Various Bug Fixes                                                            │ \\
// │ 		v1.1.3: Updated to OpenTok v2.2                                                      │ \\
// │ 				Various Bug Fixes                                                            │ \\
// │ 		v1.1.2: Added Session Timer                                                          │ \\
// │ 				Added Session Price                                                          │ \\
// │ 				Added Session Pausing                                                        │ \\
// │ 				Added Session Quiting                                                        │ \\
// │ 				Added Event Handlers for Session Status                                      │ \\
// │ 				Bug Fixes                                                                    │ \\
// │ 		v1.1.1: Create new </div> for each new stream (instead of fixed one before)          │ \\
// │ 		v1.1.0: jQuery File Upload replaced with http://filepicker.io                        │ \\
// │ 				Bug Fixes                                                                    │ \\
// │ 		v1.0.0: Initial version                                                              │ \\
// ├─────────────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2012-2014 LiveTutor Inc. (http://livetutor.me)                                  │ \\
// ├─────────────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Requirements: jQuery, jQuery UI, FireCollab, RaphBoard, Firebase, Ink File Picker           │ \\
// └─────────────────────────────────────────────────────────────────────────────────────────────┘ \\

( function ( $, window, document, undefined ) {

	// Local variable
	var LT = function( options ) {
		return new LT.prototype.init( options );
	};

	// Export as global variable
	window.LiveTutor = LT;

	LT.prototype = {

		constructor: LT,

		init: function( options ) {

			var _options = {
				// Firebase
				dbPath 				: "https://livetutor.firebaseio.com/Clients/",

				// OpenTok (TokBox)
				APIkey				: "",
				sessionID			: "",
				sessionToken		: "",

				// Ink File Picker File Manager
				fpAPIkey			: "",
				// TODO: Setup security
				fpPolicy			: "",
				fpSignature			: "",
				maxFiles			: 4,				// Max. number of concurrent files per session
				maxFileSize			: (5*1024*1024),	// 5MB
				acceptFileTypes		: ".doc,.xls,.ppt,.pdf,.txt,.gif,.jpg,.jpeg,.png,.zip",
				// The bucket or container in the specified file store where the file should end up
				// If empty - it will use default set in InkFilepicker's S3 configuration
				fpContainer			: "livetutor_filepicker",

				// Misc
				id 					: "",				// Application's session ID
				userRole 			: "",				// User's role ("tutor|moderator|student")
				// Total session price, or remaining amount
				sessionPrice		: 0,				// amount
				// Session price per minute, used in timing
				pricePerMinute		: 0,				// amount per minute
				// Remaining Session Time
				sessionLength		: 0,				// seconds
				// Trigger event n seconds before session expires
				expiringAlert		: 0,				// seconds, 0 means no alert

				// "true" - start session in paused mode
				startPaused			: false,

				// "true" - pause session if one of participants disconnects
				pauseOnDisconnect	: false,

				// "false" (default) - LT.timer will increase each second
				// "true" - LT.timer will decrease each second
				countDown			: false,

				// Initial presence status
				maxParticipants		: 2,
				idleTimeout			: 60000,			// 60s
				awayTimeout			: 300000			// 300s
			};

			LT.options = $.extend( {}, _options, options );

			// System Event handlers for Session statuses:
			// "initialize|initialized|active|pause|paused|resume|close|closed"
			// (custom event handlers may be added too!)
			LT._on = {
				initialize	: null,
				initialized	: null,
				active		: null,
				pause		: null,
				paused		: null,
				resume		: null,
				close		: null,
				closed		: null
			};

			LT.version = "1.1.3";

			if ( LT.options.APIkey !== "" ) {

				LT.sessionsDB = new Firebase( LT.options.dbPath + LT.options.APIkey + "/Sessions/" );
				if ( LT.options.id !== "" ) {
					LT.sessionStatusDB = LT.sessionsDB.child( LT.options.id ).child( "Status" );
					if ( _isTutor() ) {
						LT.sessionStatusDB.once( "value", function ( sessionStatus ) {
							if ( sessionStatus.val() === null ) {
								LT.sessionStatusDB.set( LT.options.startPaused ? "paused" : "initialize" );
							}
						});
					}
					LT.sessionStatusDB.on( "value", function ( sessionStatus ) {
						LT.sessionStatus = sessionStatus.val();
						// Call event handler
						if ( LT._on.hasOwnProperty( LT.sessionStatus ) ) LT._on[ LT.sessionStatus ]();
					});
				}

				// Firebase Presence
				LT.participants = 0;
				LT.idleNow = false;
				LT.idleTimestamp = null;
				LT.idleTimer = null;
				LT.awayNow = false;
				LT.awayTimestamp = null;
				LT.awayTimer = null;

				try { if ( Prototype ) _initPresence(); } catch ( err ) {}
				try { if ( jQuery ) _initJQuery(); } catch ( err ) {}
			}
		}	// init
	};

	LT.prototype.init.prototype = LT.prototype;

	LT.on = function ( trigger, callback ) {
		if ( trigger ) {
			if ( typeof( trigger ) === "object" ) {
				LT._on = $.extend( {}, LT._on, trigger );
			} else {
				LT._on[ trigger ] = callback;
			}
		}
		// Enable chaining
		return LT;
	};	// on

	LT.off = function ( trigger ) {
		if ( typeof( trigger ) === "string" ) {
			// Clear single handler
			if ( LT._on.hasOwnProperty( trigger ) ) LT._on[ trigger ] = null;
		} else {
			// Clear all handlers
			for ( var trigg in LT._on ) {
				LT._on[ trigg ] = null;
			}
		}
	};

	LT.price = function ( handler ) {
		LT.priceDB = LT.sessionsDB.child( LT.options.id ).child( "Price" );
		LT.priceDB.on( "value", function ( savedPrice ) {
			var currentPrice = 0;
			if ( savedPrice.val() === null ) {
				if ( _isTutor() ) LT.priceDB.set( currentPrice );
			} else {
				currentPrice = savedPrice.val();
			}
			if ( handler ) handler( LT.options.countDown ? LT.options.sessionPrice - currentPrice : currentPrice );
		});
		if ( _isTutor() ) {
			var sessionTimer = LT.sessionsDB.child( LT.options.id ).child( "Timer" );
			sessionTimer.on( "value", function ( timer ) {
				LT.priceDB.once( "value", function ( savedPrice ) {
					LT.priceDB.set( Math.floor( timer.val() / 60 ) * LT.options.pricePerMinute );
				});
			});
		}
		// Enable chaining
		return LT;
	};	// price

	LT.timer = function ( handler, expiring, expired ) {
		var sessionTimer;
		LT.sessionTimer = LT.sessionsDB.child( LT.options.id ).child( "Timer" );
		LT.sessionTimer.on( "value", function ( timer ) {
			if ( timer.val() === null ) {
				if ( _isTutor() ) LT.sessionTimer.set( 0 );
			} else {
				sessionTimer = timer.val();
				if ( sessionTimer < LT.options.sessionLength ) {
					if ( sessionTimer > ( LT.options.sessionLength - LT.options.expiringAlert ) ) {
						if ( expiring ) expiring();
					}
				} else {
					LT.sessionTimer.off();
					LT.sessionStatusDB.set( "expired" );
					LT.sessionStatusDB.off();
					if ( expired ) expired();
				}
			}
			if ( handler ) {
				handler(
					LT.options.countDown ? LT.options.sessionLength - sessionTimer : sessionTimer,
					LT.options.sessionLength
				);
			}
		});
		if ( _isTutor() ) {
			var tutorTimer = window.setInterval( function() {
				if ( LT.sessionStatus == "active" ) {
					LT.sessionTimer.set( sessionTimer + ( sessionTimer < LT.options.sessionLength ? 1 : 0 ) );
				}
			}, 1000 );
		}
		// Enable chaining
		return LT;
	};	// timer

	LT.video = function ( cameraContainer, streamContainer, onVideoConnected, onVideoDisconnected ) {
		// Initialize Video
		LT.cameraContainer = cameraContainer;
		LT.streamContainer = streamContainer;
		LT.onVideoConnected = onVideoConnected;
		LT.onVideoDisconnected = onVideoDisconnected;
		LT.publisher = null;
		LT.videoSession = null;
		LT.subscribedStreams = [];
		// Set this for helpful debugging messages in console
		OT.setLogLevel( OT.DEBUG );
		// Listen for exceptions
		OT.on( "exception", _videoExceptionHandler );

		// Enable chaining
		return LT;
	};	// video

	LT.testVideo = function () {
		// TODO: Check if it still works the same with v2.2
		// Test OpenTok capabilities
		var result = {};
		OT.runTests( function( data ) {
			// if ( data.cat_network.port_access["80"].result == "Fail" ) {
			// 	alert("Port 80 is closed!");
			// }
			// if ( data.cat_network.port_access["443"].result == "Fail" ) {
			// 	alert("Port 443 is closed!");
			// }
			// if ( data.cat_network.port_access["1935"].result == "Fail" ) {
			// 	alert("Port 1935 is closed!");
			// }
			for ( var i in data.cat_network.port_access ) {
				result[i] = data.cat_network.port_access[i].result;
			}
		});
		return result;
	};	// testVideo

	LT.drawingBoard = function ( container ) {
		// Initialize Drawing Board
		LT.drawingDB = LT.sessionsDB.child( LT.options.id ).child( "Drawing" );
		LT.drawingMode = LT.drawingDB.child( "Mode" );
		LT.drawingUndo = LT.drawingDB.child( "Undo" );
		LT.drawingRedo = LT.drawingDB.child( "Redo" );
		LT.textX = LT.textY = LT.mode = "";
		LT.undoBufferCount = LT.redoBufferCount = 0;
		LT.board = container.RaphBoard();
		_boardEnable();

		// Enable chaining
		return LT;
	};	// drawingBoard

	LT.fireCollab = function ( boardContainer ) {
		// Initialize Drawing Board
		LT.drawingDB = LT.sessionsDB.child( LT.options.id ).child( "Drawing" );

		LT.raphBoardDoc = [];

		FireCollab.initDB( LT.drawingDB.toString() );

		// Initialize RaphBoard
		LT.raphBoardAdapter = new RaphBoardAdapter( boardContainer );
		LT.raphBoardAdapter
			.on( "init", initBoard )
			.on( "update", updateBoard );
		FireCollab.register( LT.raphBoardAdapter );

		function initBoard( content ) {
			LT.raphBoard = LT.raphBoardAdapter.board;

			LT.raphBoardAdapter.set( content !== null ? content : LT.raphBoardDoc );
		}

		function updateBoard( op, opMetadata ) {
			LT.raphBoardAdapter.update( op, LT.raphBoard.elements );
		}

		// Enable chaining
		return LT;
	};	// FireCollab

	LT.fileManager = function ( container, callback ) {
		// TODO: Implement container instead of fixed elements
		LT.filesCallback = callback;
		// Initialize File Manager
		LT.filesDB = LT.sessionsDB.child( LT.options.id ).child( "Files" );
		LT.fU = $( ".LT_fileUpload" );

		filepicker.setKey( LT.options.fpAPIkey );

		// LT.fU.attr({
		// 	"data-fp-class"				: "LT_filePicker",
		// 	"data-fp-drag-text"			: "Click here or drop files to upload",
		// 	"data-fp-store-location"	: "S3",
		// 	"data-fp-store-access"		: "public",
		// 	"data-fp-extensions"		: LT.options.acceptFileTypes,
		// 	"data-fp-container"			: LT.options.fpContainer,
		// 	"data-fp-store-path"		: LT.options.APIkey + "/" + LT.options.id + "/",
		// 	"data-fp-maxSize"			: LT.options.maxFileSize
		// });
		// LT.fU[0].type = "filepicker-dragdrop";
		// LT.fU[0].onchange = function( e ) {
		// 	var closer = $( ".LT_filePicker > div > span" ).get(0);
		// 	if ( closer ) {
		// 		closer.click();
		// 	}
		// 	if ( e.fpfile ) {
		// 		LT.filesDB.push({
		// 			file		: e.fpfile,
		// 			owner		: LT.userName
		// 		});
		// 	}
		// };
		// filepicker.constructWidget( LT.fU[0] );

		filepicker.makeDropPane( LT.fU[0], {
			multiple	: false,
			location	: "S3",
			access		: "public",
			extensions	: LT.options.acceptFileTypes,
			// container	: LT.options.fpContainer,
			path		: LT.options.APIkey + "/" + LT.options.id + "/",
			maxSize		: LT.options.maxFileSize,

			dragEnter	: function() {
				LT.fU.html( "Drop file to upload" );
			},
			dragLeave	: function() {
				LT.fU.html( "Drag and drop files here" );
			},
			onSuccess	: function( InkBlobs ) {
				LT.filesDB.push({
					file		: InkBlobs[0],
					owner		: LT.userName
				});
				LT.fU
					.html( "Done! Drag and drop another file here" )
					.removeAttr( "disabled" );
			},
			onError		: function( type, message ) {
				LT.fU.html( "(" + type + ") " + message );
			},
			onProgress	: function( percentage ) {
				LT.fU.html( "Uploading (" + percentage + "%)" );
			}
		});

		// Get files for this session
		LT.numFiles = 0;
		$( "#LT_maxListedFiles" ).html( LT.options.maxFiles );
		$( ".LT_fl_delete_all" ).button({
			icons	: { primary: "ui-icon-trash" },
			text	: false
		});
		_fileManagerActivate();

		// Enable chaining
		return LT;
	};	// fileManager

	LT.deleteFiles = function () {
		return _deleteFiles();
	};	// deleteFiles

	LT.presence = function ( userName, statusContainer, nameContainer ) {
		// Initialize Presence Status
		if ( userName !== "" ) {
			// Initialize Presence Status
			LT.userName = userName;
			LT.userList = LT.sessionsDB.child( LT.options.id ).child( "Presence" );
			LT.userList.once( "value", function ( snapshot ) {
				LT.participants = snapshot.numChildren();
			});
			if ( LT.participants < LT.options.maxParticipants ) {
				LT.currentStatus = "online";
				LT.myStatus = LT.userList.child( userName );
				// If we lose our internet connection, we want ourselves removed from the list.
				LT.myStatus.onDisconnect().remove();
				LT.myStatus.on( "value", function( snapshot )  {
					if ( snapshot.val() === null ) {
						_setUserStatus( LT.currentStatus );
					}
				});
				// Anytime an online status is added, removed, or changed, we want to update the GUI
				LT.userList.on( "child_added", function ( snapshot ) {
					_addStatus( snapshot, statusContainer, nameContainer );
				});
				LT.userList.on( "child_changed", function ( snapshot ) {
					_updateStatus ( snapshot, statusContainer, nameContainer );
				});
				LT.userList.on( "child_removed", function ( snapshot ) {
					if ( LT.options.pauseOnDisconnect && LT.sessionStatus == "active" ) {
						LT.sessionStatusDB.set( "pause" );
					}
					_removeStatus( snapshot, statusContainer, nameContainer );
				});
				document.onIdle = function () {
					_setUserStatus( "idle" );
				};
				document.onAway = function () {
					_setUserStatus( "away");
				};
				document.onBack = function ( isIdle, isAway ) {
					_setUserStatus( "online" );
				};
				_setIdleTimeout( LT.options.idleTimeout );
				_setAwayTimeout( LT.options.awayTimeout );
			}
		}
		// Enable chaining
		return LT;
	};	// presence

	LT.chat = function ( container, messageList, userInput ) {
		// TODO: Implement container ONLY (and append other elements to it)
		// Initialize Text Chat
		var numMessages = 0;
		messageList.html( "" );
		LT.chatDB = LT.sessionsDB.child( LT.options.id ).child( "Chat" );
		LT.chatDB.on( "child_added", function( snapshot ) {
			numMessages++;
			var message = snapshot.val();
			_printChatMessage(
				container,
				messageList,
				message.name,
				message.text,
				// ( numMessages % 2 ) == 1
				( message.name == LT.userName )
			);
		});
		userInput.keypress( function ( e ) {
			// TODO: Check how this works for tablets
			if ( e.keyCode == 13 ) {
				var text = userInput.val();
				LT.chatDB.push({ name: LT.userName, text: text });
				userInput.val( "" );
			}
		});
		// Enable chaining
		return LT;
	};	// chat

	LT.request = function ( status ) {
		LT.sessionStatusDB.set( status );
	};	// request

	LT.decline = function ( status ) {
		switch ( status ) {
			case "pause":
				LT.sessionStatusDB.set( "active" );
				break;
			case "resume":
				LT.sessionStatusDB.set( "paused" );
				break;
			default:
				// Ignore the rest
		}
	};	// decline

	LT.pause = function () {
		// Chat will stay active for all parties!
		// _videoDisconnect();
		_cameraPause( true );
		_streamPause( true );
		if ( _isStudent() ) {
			_boardDisable();
			_fileManagerDeactivate();
		}
	};	// pause

	LT.resume = function () {
		if ( LT.videoSession ) {
			_cameraPause( false );
			_streamPause( false );
		} else {
			_videoConnect();
		}
		if ( _isStudent() ) {
			_boardWipe();
			_fileManagerActivate();
		}
	};	// resume

	LT.quit = function () {
		_presenceLeave();
		_videoDisconnect();
		_boardDump();
		_fileManagerDeactivate();
		_chatDeactivate();
	};	// quit


	/********************/
	// Helper Functions
	/********************/
	/*
	// User role functions
	*/
	_isTutor = function () {
		return LT.options.userRole == "tutor";
	};

	_isModerator = function () {
		return LT.options.userRole == "moderator";
	};

	_isStudent = function () {
		return LT.options.userRole == "student";
	};

	/*
	// Video (TokBox) helper functions
	*/
	function _videoConnect() {
		LT.videoSession = OT.initSession( LT.options.APIkey, LT.options.sessionID );

		LT.videoSession.on( "streamCreated", _streamCreatedHandler );
		LT.videoSession.on( "sessionConnected", _sessionConnectedHandler );
		LT.videoSession.on( "streamDestroyed", _streamDestroyedHandler );

		// Receive streams in the session
		LT.videoSession.connect( LT.options.sessionToken, _sessionConnectedHandler );
	}

	function _connectionCreatedHandler( event ) {
	}

	function _connectionDestroyedHandler( event ) {
	}

	function _streamCreatedHandler( event ) {
		// Subscribe to any new streams that are created
		for ( var i = 0; i < event.streams.length; i++ ) {
			var stream = event.streams[i];
			// Make sure we don't subscribe to our own
			if ( stream.connection.connectionId != LT.videoSession.connection.connectionId )  {
				// TODO: Separate container for each stream
				_subscribeToStream({ stream: stream, container: LT.streamContainer });
			}
		}
	}

	function _streamDestroyedHandler( event ) {
		for ( var i = 0; i < event.streams.length; i++ ) {
			var stream = event.streams[i];
			_unsubscribeStream( stream.streamId );
		}
	}

	function _streamPropertyChangedHandler( event ) {
	}

	function _sessionConnectedHandler( event ) {
		if ( event === null ) return;

		// Publish my camera's video
		var publishProps = {
			width		: LT.cameraContainer.width(),
			height		: LT.cameraContainer.height(),
			insertMode	: "append"
		};
		LT.publisher = OT.initPublisher( LT.cameraContainer.get( 0 ), publishProps );

		LT.publisher.on( "accessAllowed", _accessAllowedHandler );
		LT.publisher.on( "accessDenied", _accessDeniedHandler );

		// Send my stream to the session
		LT.videoSession.publish( LT.publisher );
	}

	function _accessDialogOpenedHandler( event ) {
	}

	function _accessAllowedHandler( event ) {
		if ( LT.onVideoConnected ) LT.onVideoConnected( event );
	}

	function _accessDeniedHandler( event ) {
		// Disconnect
		_videoDisconnect();
	}

	function _accessDialogClosedHandler( event ) {
	}

	function _subscribeToStreams() {
		if ( LT.subscribedStreams.length > 0 ) {
			for ( var index in LT.subscribedStreams ) {
				_subscribeToStream( LT.subscribedStreams[ index ] );
			}
		}
	}

	function _subscribeToStream( streamData ) {
		// Show other's video
		var subscribeProps = {
			width	: streamData.container.width(),
			height	: streamData.container.height()
		};
		var id = "LT_" + streamData.stream.streamId;
		$( "<div/>" ).attr( "id", id ).appendTo( streamData.container );
		LT.videoSession.subscribe( streamData.stream, id, subscribeProps );
		LT.subscribedStreams[ streamData.stream.streamId ] = streamData;
	}

	function _unsubscribeStreams() {
		if ( LT.subscribedStreams.length > 0 ) {
			for ( var index in LT.subscribedStreams ) {
				_unsubscribeStream( index );
			}
		}
	}

	function _unsubscribeStream( id ) {
		if ( id ) {
			if ( LT.subscribedStreams.length > 0 && LT.subscribedStreams[ id ] ) {
				LT.videoSession.unsubscribe( LT.subscribedStreams[ id ].stream );
				$( "div#LT_" + id ).remove();
				LT.subscribedStreams.splice( id, 1 );
			}
		}
	}

	function _cameraPause( toggle ) {
		if ( LT.publisher ) {
			LT.publisher.publishAudio( toggle );
			LT.publisher.publishVideo( toggle );
		}
	}

	function _streamPause( toggle ) {
		if ( toggle ) {
			_unsubscribeStreams();
		} else {
			_subscribeToStreams();
		}
	}

	function _videoDisconnect() {
		if ( LT.onVideoDisconnected ) LT.onVideoDisconnected();

		if ( LT.subscribedStreams.length > 0 ) {
			_unsubscribeStreams();

			LT.publisher.removeEventListener( "accessDenied", _accessDeniedHandler );
			LT.publisher.removeEventListener( "accessAllowed", _accessAllowedHandler );

			LT.videoSession.unpublish( LT.publisher );
			LT.videoSession.disconnect();
			LT.videoSession.removeEventListener( "streamDestroyed", _streamDestroyedHandler );
			LT.videoSession.removeEventListener( "streamCreated", _streamCreatedHandler );
			LT.videoSession.removeEventListener( "sessionConnected", _sessionConnectedHandler );
		}
	}

	function _videoExceptionHandler( event ) {
		_videoDisconnect();
		// Retry session connect
		switch( event.code ) {
			case 1006:
			case 1008:
			case 1013:
			case 1014:
				if ( window.confirm(
						"There was an error while connecting video:\n\n" +
						event.title + "\n\n" +
						event.message + "\n\n" +
						"Would you like to retry?"
					) ) _videoConnect();
				break;
			default:
		}
	}

	/*
	// RaphBoard helper functions
	*/
	function _setDrawingMode( mode ) {
		LT.drawingMode.child( "last" ).set({
			UUID	: LT.board.UUID,
			mode	: mode
		});
	}

	function _changeDrawingMode( snapshot ) {
		if ( snapshot.val().UUID != LT.board.UUID ) {
			LT.board.setMode( snapshot.val().mode );
		}
	}

	function _clearRedo( board, onComplete ) {
		if ( !board.canRedo() ) {
			LT.drawingRedo.remove( onComplete );
		}
	}

	function _executeCommand( snapshot ) {
		if ( snapshot.val().UUID != LT.board.UUID ) {
			var elements = JSON.parse( snapshot.val().element );
			$.each( elements, function ( k, element ) {
				var shape = element.shape;

				switch( element.command ) {
					case "move":
						var x, y, animation;
						switch( shape.type ) {
							case 'path':
								var t = shape.transform.replace( "t", "" ).split( "," );
								x = t[0] ? t[0] : 0;
								y = t[1] ? t[1] : 0;
								animation = { transform: shape.transform };
								break;
							case 'circle':
							case 'ellipse':
								x = shape.attrs.cx;
								y = shape.attrs.cy;
								animation = { cx: x, cy: y };
								break;
							default:
								x = shape.attrs.x;
								y = shape.attrs.y;
								animation = { x: x, y: y };
						}
						LT.board.move( shape.id, x, y );
						_setUUID( snapshot, "" );
						break;
					case "cut":
						LT.board.cut( shape.id );
						break;
					case "clear":
						LT.board.clear();
						break;
					default:
						LT.board.fromJSON( elements );
						_setUUID( snapshot, "" );
				}
			});
		}
	}

	function _setUUID( snapshot, UUID, onComplete ) {
		// Indicate that we have done the job
		if ( snapshot ) snapshot.child( "UUID" ).ref().set( UUID, onComplete );
	}

	function _undo( snapshot ) {
		if ( snapshot.val().UUID != LT.board.UUID ) {
			LT.board.undo();
			_setUUID( snapshot, "" );
		}
	}

	function _redo( snapshot ) {
		if ( snapshot.val().UUID != LT.board.UUID ) {
			LT.board.redo();
		}
	}

	function _push( db, UUID, element, onComplete ) {
		var elements = [];
		elements.push( element );
		db.push({
			UUID		: UUID,
			element		: JSON.stringify( elements )
		}, onComplete );
	}

	function _getLast( db, onComplete ) {
		// db.once( "value", function ( snapshot ) {
		// 	if ( snapshot.hasChildren() ) {
				db.limit( 1 ).once( "child_added", function ( snapshot ) {
					onComplete( snapshot );
				});
		// 	}
		// });
	}

	function _pop( db, onComplete ) {
		// Remove last entry on Undo/Redo stack
		_getLast( db, function( snapshot ) {
			if ( onComplete ) {
				snapshot.ref().remove( onComplete( $.extend( true, {}, snapshot ) ) );
			} else {
				snapshot.ref().remove();
			}
		});
	}

	function _boardEnable() {
		if ( LT.board ) {
			LT.board
				.on( "before_mode_change", function( board ) {
					LT.mode = board.getMode();
					return true;
				})
				.on( "after_mode_change", function( board ) {
					var newMode = board.getMode();
					if ( newMode != LT.mode ) {
						board.setMode( newMode );
					}
				})
				.on( "before_start", function( board ) {
					LT.undoBufferCount = board.undoBuffer.length;
					LT.redoBufferCount = board.redoBuffer.length;

					switch( board.getMode() ) {
						case "text":
							LT.textX = board.mouseDownX;
							LT.textY = board.mouseDownY;
							$( '#LT_textDialog' ).dialog( 'open' );
							return false;
						default:
							return true;
					}
				})
				.on( "after_end", function( board ) {
					if ( board.undoBuffer.length > LT.undoBufferCount ) {
						_clearRedo( board, _push( LT.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] ) );
					}
				})
				.on( "before_cut", function( board ) {
					LT.undoBufferCount = board.undoBuffer.length;
					return true;
				})
				.on( "after_cut", function( board ) {
					if ( board.undoBuffer.length > LT.undoBufferCount ) {
						_push( LT.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] );
					}
				})
				.on( "before_undo", function( board ) {
					LT.undoBufferCount = board.undoBuffer.length;
					LT.redoBufferCount = board.redoBuffer.length;
					return true;
				})
				.on( "after_undo", function( board ) {
					if ( board.redoBuffer.length > LT.redoBufferCount ) {
						_pop( LT.drawingUndo, _push( LT.drawingRedo, board.UUID, board.redoBuffer[ board.redoBuffer.length - 1 ] ) );
					}
				})
				.on( "before_redo", function( board ) {
					LT.undoBufferCount = board.undoBuffer.length;
					return true;
				})
				.on( "after_redo", function( board ) {
					if ( board.undoBuffer.length > LT.undoBufferCount ) {
						_pop( LT.drawingRedo, _push( LT.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] ) );
					}
				})
				.on( "before_clear", function( board ) {
					LT.undoBufferCount = board.undoBuffer.length;
					return true;
				})
				.on( "after_clear", function( board ) {
					if ( board.undoBuffer.length > LT.undoBufferCount ) {
						_push( LT.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] );
					}
			});
			LT.drawingUndo.once( "value", function ( commands ) {
				var drawingUndoList = [];
				var drawingRedoList = [];
				commands.forEach( function ( command ) {
					drawingUndoList.push( command.name() );
					_executeCommand( command );
				});
				LT.drawingRedo.once( "value", function ( commands ) {
					var reDo = [];
					commands.forEach( function ( command ) {
						drawingRedoList.push( command.name() );
						reDo.push( command );
					});
					var redoNum = reDo.length;
					if ( redoNum > 0 ) {
						var i;
						for ( i=0;i<redoNum;i++ ) {
							_executeCommand( reDo.pop() );
						}
						for ( i=0;i<redoNum;i++ ) {
							LT.board.undo();
						}
						LT.redoDB = LT.drawingRedo.startAt( null, drawingRedoList[ drawingRedoList.length - 1 ] );
					} else {
						LT.redoDB = LT.drawingRedo;
					}
					LT.redoDB.on( "child_added", function( snapshot ) {
						_undo( snapshot );
					});
				});
				if ( drawingUndoList.length > 0 ) {
					LT.undoDB = LT.drawingUndo.startAt( null, drawingUndoList[ drawingUndoList.length - 1 ] );
				} else {
					LT.undoDB = LT.drawingUndo;
				}
				LT.undoDB.on( "child_added", function( snapshot ) {
					if ( snapshot.val().UUID !== "" ) {
						_executeCommand( snapshot );
					} else {
						_redo( snapshot );
					}
				});
				LT.drawingMode.on( "child_added", function( snapshot ) {
					_changeDrawingMode( snapshot );
				});
				LT.drawingMode.on( "child_changed", function( snapshot ) {
					_changeDrawingMode( snapshot );
				});
			});
			LT.board.enable();
		}
	}

	function _boardDisable() {
		if ( LT.board ) {
			if ( LT.board ) LT.board.disable();
			if ( LT.undoDB ) LT.undoDB.off();
			if ( LT.redoDB ) LT.redoDB.off();
			if ( LT.drawingMode ) LT.drawingMode.off();
			if ( LT.drawingRedo ) LT.drawingRedo.off();
			if ( LT.drawingUndo ) LT.drawingUndo.off();
			if ( LT.drawingDB ) LT.drawingDB.off();
		}
	}

	function _boardWipe() {
		if ( LT.board ) {
			_boardDisable();
			LT.board.clear();
			_boardEnable();
		}
	}

	function _boardDump() {
		_boardDisable();
		if ( LT.board ) LT.board = null;
	}

	/*
	// File Manager helper functions
	*/
	function _deleteFiles() {
		var selectedFiles = [];
		$( "input:checkbox.LT_fileListSelect" ).each( function () {
			var sThisVal = ( this.checked ? $( this ).parent().parent().attr( "id" ) : "" );
			if ( sThisVal !== "" ) {
				selectedFiles.push( sThisVal );
			}
		});
		if ( selectedFiles.length > 0 ) {
			if ( confirm( "Are you sure that you want to delete selected file(s)?" ) ) {
				var file;
				for ( var i=0;i<=selectedFiles.length-1;i++ ) {
					var fileRef = LT.filesDB.child( selectedFiles[i] ),
						deleted;
					fileRef.child( 'file' ).once( 'value', function( snap ) {
						file = snap.val();
						filepicker.remove(
							file,
							// 	// TODO: Setup security
							// {
							// 	policy 		: POLICY,
							// 	signature 	: SIGNATURE
							// },
							function () {
								snap.ref().parent().remove();
							},
							function ( FPError ) {
								alert(
									"There's been an error while deleting the file:\n\n" +
									file.filename + "\n\n" +
									FPError
								);
							}
						);
					});
				}
			}
		}
		return true;
	}

	function _addFileListItem( fileToAdd ) {
		var fileRecord = fileToAdd.val();
		$( "#LT_fileList tbody" ).append(
			"<tr id='" + fileToAdd.name() + "'>" +
			"<td><input class='LT_fileListSelect' type='checkbox'/></td><td><a href='" +
			fileRecord.file.url + "' target='_blank'>" +
			fileRecord.file.filename + "</a></td><td>" +
			fileRecord.file.size + "</td><td>" +
			fileRecord.owner + "</td></tr>"
		);
		LT.numFiles++;
		_setFileListControls( LT.numFiles );
	}

	function _delFileListItem( id ) {
		$( "#" + id ).remove();
		LT.numFiles--;
		_setFileListControls( LT.numFiles );
	}

	function _setFileListControls( numFiles ) {
		if ( numFiles === 0 ) {
			if ( $( "#LT_fileList" ).is( ":visible" ) ) $( "#LT_fileList" ).hide();
			$( ".LT_filePicker" ).show();
			$( ".LT_maxFilesReached" ).hide();
		} else if ( numFiles >= LT.options.maxFiles ) {
			if ( !$( "#LT_fileList" ).is( ":visible" ) ) $( "#LT_fileList" ).show();
			$( ".LT_filePicker" ).hide();
			$( ".LT_maxFilesReached" ).show();
		} else {
			if ( !$( "#LT_fileList" ).is( ":visible" ) ) $( "#LT_fileList" ).show();
			$( ".LT_filePicker" ).show();
			$( ".LT_maxFilesReached" ).hide();
		}
		if ( LT.filesCallback ) LT.filesDB.once( "value", function ( files ) { LT.filesCallback( files ); } );
	}

	function _fileManagerActivate() {
		LT.filesDB.on( "child_added", function( snapshot ) {
			_addFileListItem( snapshot );
		});
		LT.filesDB.on( "child_removed", function( snapshot ) {
			_delFileListItem( snapshot.name() );
		});
		_setFileListControls( LT.numFiles );
	}

	function _fileManagerDeactivate() {
		LT.filesDB.off();
		_setFileListControls( 0 );
		$( ".LT_filePicker" ).hide();
	}

	/*
	// Presence (user status) helper functions
	*/
	function _initPresence() {
		var _API_PROTOTYPE = 2;
		var _api = _API_PROTOTYPE;
		var doc = $( document );

		Event.observe( window, "load", function ( event ) {
			Event.observe( window, "click", _active );
			Event.observe( window, "mousemove", _active );
			Event.observe( window, "mouseenter", _active );
			Event.observe( window, "scroll", _active );
			Event.observe( window, "keydown", _active );
			Event.observe( window, "click", _active );
			Event.observe( window, "dblclick", _active );
		});
	}

	function _initJQuery() {
		var _API_JQUERY = 1;
		var _api = _API_JQUERY;
		var doc = $( document );

		doc.ready( function() {
			doc.mousemove( _active );
			try { doc.mouseenter( _active ); } catch ( err ) {}
			try { doc.scroll( _active ); } catch ( err ) {}
			try { doc.keydown( _active ); } catch ( err ) {}
			try { doc.click( _active ); } catch ( err ) {}
			try { doc.dblclick( _active ); } catch ( err ) {}
		});
	}

	function _setIdleTimeout ( ms ) {
		LT.idleTimestamp = new Date().getTime() + ms;

		if ( LT.idleTimer !== null ) {
			clearTimeout( LT.idleTimer );
		}

		LT.idleTimer = setTimeout( _makeIdle, ms + 50 );
		//console.log( "idle in " + ms + ", tid = " + LT.idleTimer );
	}

 	function _clearIdleTimeout () {
 		clearTimeout( LT.idleTimer );
 	}

	function _setAwayTimeout ( ms ) {
		LT.awayTimestamp = new Date().getTime() + ms;

		if ( LT.awayTimer !== null ) {
			clearTimeout ( LT.awayTimer );
		}
		LT.awayTimer = setTimeout( _makeAway, ms + 50 );
		//console.log( "away in " + ms );
	}

 	function _clearAwayTimeout () {
 		clearTimeout( LT.awayTimer );
 	}

	function _makeIdle () {
		var t = new Date().getTime();

		if ( t < LT.idleTimestamp ) {
			//console.log( "Not idle yet. Idle in " + ( LT.idleTimestamp - t + 50 ) );
			LT.idleTimer = setTimeout( _makeIdle, LT.idleTimestamp - t + 50 );

			return;
		}
		//console.log( "** IDLE **" );
		LT.idleNow = true;

		try {
			if ( document.onIdle ) document.onIdle();
		} catch ( err ) {}
	}

	function _makeAway () {
		var t = new Date().getTime();

		if ( t < LT.awayTimestamp ) {
			//console.log( "Not away yet. Away in " + ( LT.awayTimestamp - t + 50 ) );
			LT.awayTimer = setTimeout( _makeAway, LT.awayTimestamp - t + 50 );

			return;
		}

		//console.log( "** AWAY **" );
		LT.awayNow = true;

		try {
			if ( document.onAway ) document.onAway();
		} catch ( err ) {}
	}

	function _active ( event ) {
		var t = new Date().getTime();

		LT.idleTimestamp = t + LT.options.idleTimeout;
		LT.awayTimestamp = t + LT.options.awayTimeout;
		//console.log( "not idle."" );

		if ( LT.idleNow ) {
			_setIdleTimeout( LT.options.idleTimeout );
		}

		if ( LT.awayNow ) {
			_setAwayTimeout( LT.options.awayTimeout );
		}

		try {
			//console.log( "** BACK **" );
			if ( ( LT.idleNow || LT.awayNow ) && document.onBack ) document.onBack( LT.idleNow, LT.awayNow );
		} catch ( err ) {}

		LT.idleNow = false;
		LT.awayNow = false;
	}

	function _presenceLeave() {
		_clearIdleTimeout();
		_clearAwayTimeout();
		document.onIdle = null;
		document.onAway = null;
		document.onBack = null;
		LT.userList.off();
		LT.myStatus.off();
		LT.participants--;
		LT.myStatus.remove();
	}

	function _setUserStatus( status ) {
		LT.currentStatus = status;
		LT.myStatus.set( status );
	}

	// Render someone's online status
	function _addStatus( snapshot, statusContainer, nameContainer ) {
		if ( snapshot.name() != LT.userName ) {
			_updateStatus( snapshot, statusContainer, nameContainer );
		}
		LT.participants = snapshot.numChildren();
	}

	// Change user's status
	function _updateStatus( snapshot, statusContainer, nameContainer ) {
		if ( snapshot.name() != LT.userName ) {
			switch ( snapshot.val() ) {
				case "idle":
					status = "☆";
					break;
				case "away":
					status = "☄";
					break;
				default:	// "online"
					status = "★";
			}
			statusContainer.html( status );
			nameContainer.html( snapshot.name() );
		}
	}

	// Remove the status of a user who left
	function _removeStatus( snapshot, statusContainer, nameContainer ) {
		statusContainer.html( "-" );
		nameContainer.html( "(Unknown)" );
		LT.participants = snapshot.numChildren();
	}

	/*
	// Chat helper functions
	*/
	function _printChatMessage( container, list, name, text, /*isOdd*/ isMe ) {
		// var message = $( "<p/>" );
		// if ( isOdd ) message.addClass( "odd" );
		// message.text( text ).prepend( $( "<em/>" ).text( name+": ") ).appendTo( list );
		var messageLi = $( "<li/>" );
		var message = $( "<a class=\"fc-icon fc-menu-expand\"></a>" ).text( text );
		if ( isMe ) {
			message.addClass( "fc-icon-post2" ).appendTo( messageLi );
		} else {
			message.addClass( "fc-icon-notificationup" ).appendTo( messageLi );
		}
		messageLi.appendTo( list );
		// list[0].scrollTop = list[0].scrollHeight;
		container.scrollTop( list[0].scrollHeight );
	}

	function _chatDeactivate () {
		LT.chatDB.off();
	}

} )( jQuery, window, document );