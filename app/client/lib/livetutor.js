// ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ \\
// │ LiveTutor 1.2.0 - Cross-browser online tutoring system                                      │ \\
// │ 	Version History:                                                                         │ \\
// │ 		v1.2.0: Refactoring + various bug fixes                                              │ \\
// │ 		v1.1.5: Various bug fixes                                                            │ \\
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
// │ Copyright © 2012-2015 LiveTutor Inc. (http://livetutor.io)                                  │ \\
// ├─────────────────────────────────────────────────────────────────────────────────────────────┤ \\
// │ Requirements: jQuery, jQuery UI, FireCollab, RaphBoard, Firebase, Ink File Picker           │ \\
// └─────────────────────────────────────────────────────────────────────────────────────────────┘ \\

( function ( $, window, document, undefined ) {

	// Local variable
	var LT = function ( options ) {
		var self = this;

		self.init( options );
	};

	LT.prototype = {

		_defaults: {
			debugLevel       : OT.DEBUG,

			// Firebase
			dbPath           : 'https://livetutor.firebaseio.com/Clients/',

			// OpenTok (TokBox)
			APIkey           : '',
			sessionID        : '',
			sessionToken     : '',
			videoResolution  : '1280x720',		// ['1280x720'|'640x480'|'320x240']
			videoFrameRate   : 30,				// [30|15|7|1]
			videoFitMode     : 'cover',		// ['contain'|'cover']
			videoInsertMode  : 'append',		// ['replace'|'after'|'before'|'append']

			// Ink File Picker File Manager
			fpAPIkey         : '',
			// TODO: Setup security
			fpPolicy         : '',
			fpSignature      : '',
			maxFiles         : 4,					// Max. number of concurrent files per session
			maxFileSize      : ( 5 * 1024 * 1024 ),	// 5MB
			acceptFileTypes  : '.doc,.xls,.ppt,.pdf,.txt,.gif,.jpg,.jpeg,.png,.zip',
			// The bucket or container in the specified file store where the file should end up
			// If empty - it will use default set in InkFilepicker's S3 configuration
			fpContainer      : 'livetutor_filepicker',

			// Misc
			id               : '',					// Application's session ID
			userRole         : '',					// User's role ("tutor|moderator|student")
			// Total session price, or remaining amount
			sessionPrice     : 0,					// amount
			// Session price per minute, used in timing
			pricePerMinute   : 0,					// amount per minute
			// Remaining Session Time
			sessionLength    : 0,					// seconds
			// Trigger event n seconds before session expires
			expiringAlert    : 0,					// seconds, 0 means no alert

			// "true" - start session in paused mode
			startPaused      : false,

			// "true" - pause session if one of participants disconnects
			pauseOnDisconnect: false,

			// "false" (default) - self.timer will increase each second
			// "true" - self.timer will decrease each second
			countDown        : false,

			// Initial presence status
			maxParticipants  : 2,
			idleTimeout      : 60000,				// 60s
			awayTimeout      : 300000				// 300s
		},

		/********************/
		// Helper Functions
		/********************/
		/*
		// User role functions
		*/
		_isTutor: function () {
			var self = this;

			return self.options.userRole == 'tutor';
		},

		_isModerator: function () {
			var self = this;

			return self.options.userRole == 'moderator';
		},

		_isStudent: function () {
			var self = this;

			return self.options.userRole == 'student';
		},

		/*
		// Video (TokBox) helper functions
		*/
		_videoConnect: function () {
			var self = this;

			// First check for System Requirements
			if ( OT.checkSystemRequirements() ) {
				self.session = OT.initSession( self.options.APIkey, self.options.sessionID );

				self.session.on({
					streamCreated      : self._streamCreatedHandler.bind( self ),
					streamDestroyed    : self._streamDestroyedHandler.bind( self ),
					sessionConnected   : self._sessionConnectedHandler.bind( self ),
					sessionDisconnected: self._sessionDisconnectedHandler.bind( self )
				});

				// Receive streams in the session
				self.session.connect( self.options.sessionToken, self._sessionConnectedHandler );
			} else {
				// The client does not support WebRTC.
				// You can display your own message.
			}
		},

		_streamCreatedHandler: function ( event ) {
			var self = this;

			// Subscribe to any new streams that are created
			// Make sure we don't subscribe to our own
			if ( event.stream && event.stream.connection.connectionId != self.session.connection.connectionId )  {
				// TODO: Separate container for each stream
				self._subscribeToStream({
					stream   : event.stream,
					container: self.streamContainer
				});
			}
		},

		_streamDestroyedHandler: function ( event ) {
			var self = this;

			if ( event.stream ) {
				self._unsubscribeFromStream( event.stream, event );
			}
		},

		_sessionConnectedHandler: function ( event ) {
			if ( event === null ) return;
			var self = this,
				width = $( '.' + self.cameraContainer ).width(),
				height = $( '.' + self.cameraContainer ).height(),
				// Publish my camera's video
				publishProperites = {
					fitMode   : self.options.videoFitMode,
					resolution: self.options.videoResolution,
					frameRate : self.options.videoFrameRate,
					width     : ( width > 0 ) ? width : '100%',
					height    : ( height > 0 ) ? height : '100%'
				};

			if ( self.session.capabilities.publish ) {
				self.publisher = OT.initPublisher( self.cameraContainer, publishProperites );

				self.publisher.on({
					accessDialogOpened: self._accessDialogOpenedHandler.bind( self ),
					accessDialogClosed: self._accessDialogClosedHandler.bind( self ),
					accessAllowed     : self._accessAllowedHandler.bind( self ),
					accessDenied      : self._accessDeniedHandler.bind( self ),
					streamCreated     : self._publishedStreamCreatedHandler.bind( self ),
					streamDestroyed   : self._publishedStreamDestroyedHandler.bind( self )
				});

				// Send my stream to the session
				self.session.publish( self.publisher );
			} else {
				// The client cannot publish.
				// You may want to notify the user.
			}
		},

		_sessionDisconnectedHandler: function ( event ) {
			var self = this;
		},

		_accessDialogOpenedHandler: function ( event ) {
			// The Allow/Deny dialog box is opened.
			var self = this;

			// Show allow camera message
			// pleaseAllowCamera.style.display = 'block';
		},

		_accessDialogClosedHandler: function ( event ) {
			// The Allow/Deny dialog box is closed.
			var self = this;

			// Hide allow camera message
			// pleaseAllowCamera.style.display = 'none';
		},

		_accessAllowedHandler: function ( event ) {
			// The user has granted access to the camera and mic.
			var self = this;
		},

		_accessDeniedHandler: function ( event ) {
			// The user has denied access to the camera and mic.
			var self = this;

			// Disconnect
			self._videoDisconnect();
		},

		_publishedStreamCreatedHandler: function ( event ) {
			var self = this;

			if ( event && event.stream ) {
				self.publishedStream = event.stream;

				console.log( 'Published stream resolution: ' + event.stream.videoDimensions.width + 'x' + event.stream.videoDimensions.height );
				console.log( 'Published stream frame rate: ' + event.stream.frameRate );

				if ( self.onCameraPublished ) self.onCameraPublished( event );
			}
		},

		_publishedStreamDestroyedHandler: function ( event ) {
			var self = this;

			if ( event && event.stream && event.stream.streamId == self.publishedStream.streamId ) {
				if ( self.onCameraUnpublished ) self.onCameraUnpublished( event );
			}
		},

		_subscribeToStreams: function () {
			var self = this;

			for ( var index in self.subscribedStreams ) {
				self._subscribeToStream( self.subscribedStreams[ index ] );
			}
		},

		_subscribeToStream: function ( streamData ) {
			var self = this;

			// Check if already subscribed
			if ( self.subscribedStreams[ streamData.stream.streamId ] ) return;

			// Show other's video
			if ( self.onSubscribedToStream ) {
				self.onSubscribedToStream( streamData, self._onSubscribeToStream.bind( self ) );
			} else {
				self._onSubscribeToStream( streamData );
			}
		},

		_onSubscribeToStream: function ( streamData ) {
			var self = this,
				width = $( '.' + streamData.container ).width(),
				height = $( '.' + streamData.container ).height(),
				subscribeProps = {
					fitMode   : self.options.videoFitMode,
					insertMode: self.options.videoInsertMode,
					width     : ( width > 0 ) ? width : '100%',
					height    : ( height > 0 ) ? height : '100%'
				},
				id = 'LT_' + streamData.stream.streamId;

			self.session.subscribe( streamData.stream, id, subscribeProps );
			self.subscribedStreams[ streamData.stream.streamId ] = streamData;
		},

		_unsubscribeFromStreams: function () {
			var self = this;

			for ( var streamId in self.subscribedStreams ) {
				self._unsubscribeFromStream( self.subscribedStreams[ streamId ].stream );
			}
		},

		_unsubscribeFromStream: function ( stream, event ) {
			var self = this;

			if ( stream ) {
				if ( self.onUnsubscribedFromStream ) {
					self.onUnsubscribedFromStream( stream, event );
				}

				if ( self.session ) self.session.unsubscribe( stream );

				delete self.subscribedStreams[ stream.streamId ];
			}
		},

		_cameraPause: function ( toggle ) {
			var self = this;

			if ( self.publisher ) {
				self.publisher.publishAudio( toggle );
				self.publisher.publishVideo( toggle );

				if ( toggle && self.session ) {
					self.session.unpublish( self.publisher );

					self.session.disconnect();
				}
			}
		},

		_streamPause: function ( toggle ) {
			var self = this;

			if ( toggle ) {
				self._unsubscribeFromStreams();
			} else {
				self._subscribeToStreams();
			}
		},

		_videoDisconnect: function () {
			var self = this;

			self._unsubscribeFromStreams();

			if ( self.publisher ) {
				self.publisher.off();

				if ( self.session ) {
					self.session.unpublish( self.publisher );
				}

				self.publisher.destroy();

				self.publisher = null;
			}

			if ( self.session ) {
				self.session.disconnect();

				self.session.off();

				self.session = null;
			}
		},

		_exceptionHandler: function ( event ) {
			var self = this;

			_videoDisconnect();
			// Retry session connect
			switch ( event.code ) {
				case 1006:
				case 1008:
				case 1013:
				case 1014:
					if (
						window.confirm(
							'There was an error while connecting video:\n\n' +
							event.title + '\n\n' +
							event.message + '\n\n' +
							'Would you like to retry?'
						)
					) self._videoConnect();

					break;

				default:
			}
		},

		/*
		// RaphBoard helper functions
		*/
		_setDrawingMode: function ( mode ) {
			var self = this;

			self.drawingMode.child( 'last' ).set({
				UUID: self.board.UUID,
				mode: mode
			});
		},

		_changeDrawingMode: function ( snapshot ) {
			var self = this;

			if ( snapshot.val().UUID != self.board.UUID ) {
				self.board.setMode( snapshot.val().mode );
			}
		},

		_clearRedo: function ( board, onComplete ) {
			var self = this;

			if ( !board.canRedo() ) {
				self.drawingRedo.remove( onComplete );
			}
		},

		_executeCommand: function ( snapshot ) {
			var self = this;

			if ( snapshot.val().UUID != self.board.UUID ) {
				var elements = JSON.parse( snapshot.val().element );

				$.each( elements, function ( k, element ) {
					var shape = element.shape;

					switch ( element.command ) {
						case 'move':
							var x, y, animation;

							switch ( shape.type ) {
								case 'path':
									var t = shape.transform.replace( 't', '' ).split( ',' );

									x = t[ 0 ] ? t[ 0 ] : 0;
									y = t[ 1 ] ? t[ 1 ] : 0;

									animation = {
										transform: shape.transform
									};

									break;

								case 'circle':
								case 'ellipse':
									x = shape.attrs.cx;
									y = shape.attrs.cy;

									animation = {
										cx: x, cy: y
									};

									break;

								default:
									x = shape.attrs.x;
									y = shape.attrs.y;

									animation = {
										x: x, y: y
									};
							}

							self.board.move( shape.id, x, y );
							self._setUUID( snapshot, '' );

							break;

						case 'cut':
							self.board.cut( shape.id );

							break;

						case 'clear':
							self.board.clear();

							break;

						default:
							self.board.fromJSON( elements );
							self._setUUID( snapshot, '' );
					}
				});
			}
		},

		_setUUID: function ( snapshot, UUID, onComplete ) {
			var self = this;

			// Indicate that we have done the job
			if ( snapshot ) snapshot.child( 'UUID' ).ref().set( UUID, onComplete );
		},

		_undo: function ( snapshot ) {
			var self = this;

			if ( snapshot.val().UUID != self.board.UUID ) {
				self.board.undo();
				self._setUUID( snapshot, '' );
			}
		},

		_redo: function ( snapshot ) {
			var self = this;

			if ( snapshot.val().UUID != self.board.UUID ) {
				self.board.redo();
			}
		},

		_push: function ( db, UUID, element, onComplete ) {
			var self = this,
				elements = [];

			elements.push( element );

			db.push({
				UUID		: UUID,
				element		: JSON.stringify( elements )
			}, onComplete );
		},

		_getLast: function ( db, onComplete ) {
			var self = this;

			// db.once( "value", function ( snapshot ) {
			// 	if ( snapshot.hasChildren() ) {
			db.limit( 1 ).once( 'child_added', function ( snapshot ) {
						onComplete( snapshot );
					});
			// 	}
			// });
		},

		_pop: function ( db, onComplete ) {
			var self = this;

			// Remove last entry on Undo/Redo stack
			self._getLast( db, function ( snapshot ) {
				if ( onComplete ) {
					snapshot.ref().remove( onComplete( $.extend( true, {}, snapshot ) ) );
				} else {
					snapshot.ref().remove();
				}
			});
		},

		_boardEnable: function () {
			var self = this;

			if ( self.board ) {
				self.board
					.on( 'before_mode_change', function ( board ) {
						self.mode = board.getMode();

						return true;
					})
					.on( 'after_mode_change', function ( board ) {
						var newMode = board.getMode();

						if ( newMode != self.mode ) {
							board.setMode( newMode );
						}
					})
					.on( 'before_start', function ( board ) {
						self.undoBufferCount = board.undoBuffer.length;
						self.redoBufferCount = board.redoBuffer.length;

						switch ( board.getMode() ) {
							case 'text':
								self.textX = board.mouseDownX;
								self.textY = board.mouseDownY;
								$( '#LT_textDialog' ).dialog( 'open' );

								return false;

							default:
								return true;
						}
					})
					.on( 'after_end', function ( board ) {
						if ( board.undoBuffer.length > self.undoBufferCount ) {
							self._clearRedo( board, self._push( self.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] ) );
						}
					})
					.on( 'before_cut', function ( board ) {
						self.undoBufferCount = board.undoBuffer.length;

						return true;
					})
					.on( 'after_cut', function ( board ) {
						if ( board.undoBuffer.length > self.undoBufferCount ) {
							self._push( self.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] );
						}
					})
					.on( 'before_undo', function ( board ) {
						self.undoBufferCount = board.undoBuffer.length;
						self.redoBufferCount = board.redoBuffer.length;

						return true;
					})
					.on( 'after_undo', function ( board ) {
						if ( board.redoBuffer.length > self.redoBufferCount ) {
							self._pop( self.drawingUndo, self._push( self.drawingRedo, board.UUID, board.redoBuffer[ board.redoBuffer.length - 1 ] ) );
						}
					})
					.on( 'before_redo', function ( board ) {
						self.undoBufferCount = board.undoBuffer.length;

						return true;
					})
					.on( 'after_redo', function ( board ) {
						if ( board.undoBuffer.length > self.undoBufferCount ) {
							self._pop( self.drawingRedo, self._push( self.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] ) );
						}
					})
					.on( 'before_clear', function ( board ) {
						self.undoBufferCount = board.undoBuffer.length;

						return true;
					})
					.on( 'after_clear', function ( board ) {
						if ( board.undoBuffer.length > self.undoBufferCount ) {
							self._push( self.drawingUndo, board.UUID, board.undoBuffer[ board.undoBuffer.length - 1 ] );
						}
					});

				self.drawingUndo.once( 'value', function ( commands ) {
					var drawingUndoList = [],
						drawingRedoList = [];

					commands.forEach( function ( command ) {
						drawingUndoList.push( command.key() );
						self._executeCommand( command );
					});

					self.drawingRedo.once( 'value', function ( commands ) {
						var reDo = [];

						commands.forEach( function ( command ) {
							drawingRedoList.push( command.key() );
							reDo.push( command );
						});

						var redoNum = reDo.length;

						if ( redoNum > 0 ) {
							var i;

							for ( i = 0; i < redoNum; i++ ) {
								self._executeCommand( reDo.pop() );
							}

							for ( i = 0; i < redoNum; i++ ) {
								self.board.undo();
							}

							self.redoDB = self.drawingRedo.startAt( null, drawingRedoList[ drawingRedoList.length - 1 ] );
						} else {
							self.redoDB = self.drawingRedo;
						}

						self.redoDB.on( 'child_added', function ( snapshot ) {
							self._undo( snapshot );
						});
					});

					if ( drawingUndoList.length ) {
						self.undoDB = self.drawingUndo.startAt( null, drawingUndoList[ drawingUndoList.length - 1 ] );
					} else {
						self.undoDB = self.drawingUndo;
					}

					self.undoDB.on( 'child_added', function ( snapshot ) {
						if ( snapshot.val().UUID !== '' ) {
							self._executeCommand( snapshot );
						} else {
							self._redo( snapshot );
						}
					});

					self.drawingMode.on( 'child_added', function ( snapshot ) {
						self._changeDrawingMode( snapshot );
					});

					self.drawingMode.on( 'child_changed', function ( snapshot ) {
						self._changeDrawingMode( snapshot );
					});
				});

				self.board.enable();
			}
		},

		_boardDisable: function () {
			var self = this;

			if ( self.board ) {
				if ( self.board ) self.board.disable();

				if ( self.undoDB ) self.undoDB.off();

				if ( self.redoDB ) self.redoDB.off();

				if ( self.drawingMode ) self.drawingMode.off();

				if ( self.drawingRedo ) self.drawingRedo.off();

				if ( self.drawingUndo ) self.drawingUndo.off();

				if ( self.drawingDB ) self.drawingDB.off();
			}
		},

		_boardWipe: function () {
			var self = this;

			if ( self.board ) {
				self._boardDisable();

				self.board.clear();

				self._boardEnable();
			}
		},

		_boardDump: function () {
			var self = this;

			self._boardDisable();

			if ( self.board ) self.board = null;
		},

		/*
		// File Manager helper functions
		*/
		_deleteFiles: function () {
			var self = this,
				selectedFiles = [];

			$( 'input:checkbox.LT_fileListSelect' ).each( function () {
				var sThisVal = ( this.checked ? $( this ).parent().parent().attr( 'id' ) : '' );

				if ( sThisVal !== '' ) {
					selectedFiles.push( sThisVal );
				}
			});

			if ( selectedFiles.length ) {
				if ( confirm( 'Are you sure that you want to delete selected file(s)?' ) ) {
					var file;

					for ( var i = 0; i <= selectedFiles.length - 1; i++ ) {
						var fileRef = self.filesDB.child( selectedFiles[ i ] ),
							deleted;

						fileRef.child( 'file' ).once( 'value', function ( snap ) {
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
										'There\'s been an error while deleting the file:\n\n' +
										file.filename + '\n\n' +
										FPError
									);
								}
							);
						});
					}
				}
			}

			return true;
		},

		_addFileListItem: function ( fileToAdd ) {
			var self = this,
				fileRecord = fileToAdd.val();

			$( '#LT_fileList tbody' ).append(
				'<tr id=\'' + fileToAdd.key() + '\'>' +
				'<td><input class=\'LT_fileListSelect\' type=\'checkbox\'/></td><td><a href=\'' +
				fileRecord.file.url + '\' target=\'_blank\'>' +
				fileRecord.file.filename + '</a></td><td>' +
				fileRecord.file.size + '</td><td>' +
				fileRecord.owner + '</td></tr>'
			);

			self.numFiles++;

			self._setFileListControls( self.numFiles );
		},

		_delFileListItem: function ( id ) {
			var self = this;

			$( '#' + id ).remove();

			self.numFiles--;

			self._setFileListControls( self.numFiles );
		},

		_setFileListControls: function ( numFiles ) {
			var self = this;

			if ( numFiles === 0 ) {
				if ( $( '#LT_fileList' ).is( ':visible' ) ) $( '#LT_fileList' ).hide();
				$( '.LT_filePicker' ).show();
				$( '.LT_maxFilesReached' ).hide();
			} else if ( numFiles >= self.options.maxFiles ) {
				if ( !$( '#LT_fileList' ).is( ':visible' ) ) $( '#LT_fileList' ).show();
				$( '.LT_filePicker' ).hide();
				$( '.LT_maxFilesReached' ).show();
			} else {
				if ( !$( '#LT_fileList' ).is( ':visible' ) ) $( '#LT_fileList' ).show();
				$( '.LT_filePicker' ).show();
				$( '.LT_maxFilesReached' ).hide();
			}

			if ( self.filesCallback ) self.filesDB.once( 'value', function ( files ) { self.filesCallback( files ); } );
		},

		_fileManagerActivate: function () {
			var self = this;

			if ( self.filesDB ) {
				self.filesDB.on( 'child_added', function ( snapshot ) {
					self._addFileListItem( snapshot );
				});

				self.filesDB.on( 'child_removed', function ( snapshot ) {
					self._delFileListItem( snapshot.key() );
				});

				self._setFileListControls( self.numFiles );
			}
		},

		_fileManagerDeactivate: function () {
			var self = this;

			if ( self.filesDB ) {
				self.filesDB.off();

				self._setFileListControls( 0 );

				$( '.LT_filePicker' ).hide();
			}
		},

		/*
		// Presence (user status) helper functions
		*/
		_initPresence: function () {
			var self = this,
				_API_PROTOTYPE = 2,
				_api = _API_PROTOTYPE,
				doc = $( document );

			Event.observe( window, 'load', function ( event ) {
				Event.observe( window, 'click', self._active.bind( self ) );
				Event.observe( window, 'mousemove', self._active.bind( self ) );
				Event.observe( window, 'mouseenter', self._active.bind( self ) );
				Event.observe( window, 'scroll', self._active.bind( self ) );
				Event.observe( window, 'keydown', self._active.bind( self ) );
				Event.observe( window, 'click', self._active.bind( self ) );
				Event.observe( window, 'dblclick', self._active.bind( self ) );
			});
		},

		_initJQuery: function () {
			var self = this,
				_API_JQUERY = 1,
				_api = _API_JQUERY,
				doc = $( document );

			doc.ready( function () {
				doc.mousemove( self._active.bind( self ) );

				try { doc.mouseenter( self._active.bind( self ) ); } catch ( err ) {}

				try { doc.scroll( self._active.bind( self ) ); } catch ( err ) {}

				try { doc.keydown( self._active.bind( self ) ); } catch ( err ) {}

				try { doc.click( self._active.bind( self ) ); } catch ( err ) {}

				try { doc.dblclick( self._active.bind( self ) ); } catch ( err ) {}
			});
		},

		_setIdleTimeout: function ( ms ) {
			var self = this;

			self.idleTimestamp = new Date().getTime() + ms;

			if ( self.idleTimer !== null ) {
				clearTimeout( self.idleTimer );
			}

			self.idleTimer = setTimeout( self._makeIdle.bind( self ), ms + 50 );
			//console.log( "idle in " + ms + ", tid = " + self.idleTimer );
		},

		_clearIdleTimeout: function () {
			var self = this;

			clearTimeout( self.idleTimer.bin );
		},

		_setAwayTimeout: function ( ms ) {
			var self = this;

			self.awayTimestamp = new Date().getTime() + ms;

			if ( self.awayTimer !== null ) {
				clearTimeout( self.awayTimer );
			}

			self.awayTimer = setTimeout( self._makeAway.bind( self ), ms + 50 );
			//console.log( "away in " + ms );
		},

		_clearAwayTimeout: function () {
			var self = this;

			clearTimeout( self.awayTimer );
		},

		_makeIdle: function () {
			var self = this,
				t = new Date().getTime();

			if ( t < self.idleTimestamp ) {
				//console.log( "Not idle yet. Idle in " + ( self.idleTimestamp - t + 50 ) );
				self.idleTimer = setTimeout( self._makeIdle.bind( self ), self.idleTimestamp - t + 50 );

				return;
			}
			//console.log( "** IDLE **" );
			self.idleNow = true;

			try {
				if ( document.onIdle ) document.onIdle();
			} catch ( err ) {}
		},

		_makeAway: function () {
			var self = this,
				t = new Date().getTime();

			if ( t < self.awayTimestamp ) {
				//console.log( "Not away yet. Away in " + ( self.awayTimestamp - t + 50 ) );
				self.awayTimer = setTimeout( self._makeAway.bind( self ), self.awayTimestamp - t + 50 );

				return;
			}

			//console.log( "** AWAY **" );
			self.awayNow = true;

			try {
				if ( document.onAway ) document.onAway();
			} catch ( err ) {}
		},

		_active: function ( event ) {
			var self = this,
				t = new Date().getTime();

			self.idleTimestamp = t + self.options.idleTimeout;
			self.awayTimestamp = t + self.options.awayTimeout;
			//console.log( "not idle."" );

			if ( self.idleNow ) {
				self._setIdleTimeout( self.options.idleTimeout );
			}

			if ( self.awayNow ) {
				self._setAwayTimeout( self.options.awayTimeout );
			}

			try {
				//console.log( "** BACK **" );
				if ( ( self.idleNow || self.awayNow ) && document.onBack ) document.onBack( self.idleNow, self.awayNow );
			} catch ( err ) {}

			self.idleNow = false;
			self.awayNow = false;
		},

		_presenceLeave: function () {
			var self = this;

			self._clearIdleTimeout();
			self._clearAwayTimeout();

			document.onIdle = null;
			document.onAway = null;
			document.onBack = null;

			self.userList.off();
			self.myStatus.off();
			self.participants--;
			self.myStatus.remove();
		},

		_setUserStatus: function ( status ) {
			var self = this;

			self.currentStatus = status;
			self.myStatus.set( status );
		},

		// Render someone's online status
		_addStatus: function ( snapshot, statusContainer, nameContainer ) {
			var self = this;

			if ( snapshot.key() != self.userName ) {
				self._updateStatus( snapshot, statusContainer, nameContainer );
			}

			self.participants = snapshot.numChildren();
		},

		// Change user's status
		_updateStatus: function ( snapshot, statusContainer, nameContainer ) {
			var self = this;

			if ( snapshot.key() != self.userName ) {
				switch ( snapshot.val() ) {
					case 'idle':
						status = '☆';
						break;

					case 'away':
						status = '☄';
						break;
					default:	// 'online'
						status = '★';
				}

				statusContainer.html( status );
				nameContainer.html( snapshot.key() );
			}
		},

		// Remove the status of a user who left
		_removeStatus: function ( snapshot, statusContainer, nameContainer ) {
			var self = this;

			statusContainer.html( '-' );
			nameContainer.html( '(Unknown)' );
			self.participants = snapshot.numChildren();
		},

		/*
		// Chat helper functions
		*/
		_printChatMessage: function ( container, list, name, text, /*isOdd*/ isMe ) {
			var self = this;

			// var message = $( "<p/>" );
			// if ( isOdd ) message.addClass( "odd" );
			// message.text( text ).prepend( $( "<em/>" ).text( name+": ") ).appendTo( list );
			var messageLi = $( '<li/>' ),
				message = $( '<a class="fc-icon fc-menu-expand"></a>' ).text( text );

			if ( isMe ) {
				message.addClass( 'fc-icon-post2' ).appendTo( messageLi );
			} else {
				message.addClass( 'fc-icon-notificationup' ).appendTo( messageLi );
			}

			messageLi.appendTo( list );
			// list[0].scrollTop = list[0].scrollHeight;
			container.scrollTop( list[ 0 ].scrollHeight );
		},

		_chatDeactivate: function () {
			var self = this;

			self.chatDB.off();
		}
	};

	LT.prototype.init = function ( options ) {
		var self = this;

		self.options = $.extend( {}, self._defaults, options );

		// System Event handlers for Session statuses:
		// "initialize|initialized|active|pause|paused|resume|close|closed"
		// (custom event handlers may be added too!)
		self._on = {
			initialize : null,
			initialized: null,
			active     : null,
			pause      : null,
			paused     : null,
			resume     : null,
			close      : null,
			closed     : null
		};

		self.version = '1.2.0';

		if ( self.options.APIkey !== '' ) {

			self.sessionsDB = new Firebase( self.options.dbPath + self.options.APIkey + '/Sessions/' );

			if ( self.options.id !== '' ) {
				self.sessionStatusDB = self.sessionsDB.child( self.options.id ).child( 'Status' );

				if ( self._isTutor() ) {
					self.sessionStatusDB.once( 'value', function ( sessionStatus ) {
						if ( sessionStatus.val() === null ) {
							self.sessionStatusDB.set( self.options.startPaused ? 'paused' : 'initialize' );
						}
					});
				}

				self.sessionStatusDB.on( 'value', function ( sessionStatus ) {
					self.sessionStatus = sessionStatus.val();
					// Call event handler
					if (
						self._on.hasOwnProperty( self.sessionStatus ) &&
						self._on[ self.sessionStatus ]
					) self._on[ self.sessionStatus ]();
				});
			}

			// Firebase Presence
			self.participants  = 0;
			self.idleNow       = false;
			self.idleTimestamp = null;
			self.idleTimer     = null;
			self.awayNow       = false;
			self.awayTimestamp = null;
			self.awayTimer     = null;

			try { if ( Prototype ) self._initPresence(); } catch ( err ) {}

			try { if ( jQuery ) self._initJQuery(); } catch ( err ) {}
		}
	};	// init

	LT.prototype.on = function ( trigger, callback ) {
		var self = this;

		if ( trigger ) {
			if ( typeof ( trigger ) === 'object' ) {
				self._on = $.extend( {}, self._on, trigger );
			} else {
				self._on[ trigger ] = callback;
			}
		}
		// Enable chaining
		return self;
	};	// on

	LT.prototype.off = function ( trigger ) {
		var self = this;

		if ( typeof ( trigger ) === 'string' ) {
			// Clear single handler
			if ( self._on.hasOwnProperty( trigger ) ) self._on[ trigger ] = null;
		} else {
			// Clear all handlers
			for ( var trigg in self._on ) {
				self._on[ trigg ] = null;
			}
		}
		// Enable chaining
		return self;
	};

	LT.prototype.price = function ( handler ) {
		var self = this;

		self.priceDB = self.sessionsDB.child( self.options.id ).child( 'Price' );

		self.priceDB.on( 'value', function ( savedPrice ) {
			var currentPrice = 0;

			if ( savedPrice.val() === null ) {
				if ( self._isTutor() ) self.priceDB.set( currentPrice );
			} else {
				currentPrice = savedPrice.val();
			}

			if ( handler ) handler( self.options.countDown ? self.options.sessionPrice - currentPrice : currentPrice );
		});

		if ( self._isTutor() ) {
			var sessionTimer = self.sessionsDB.child( self.options.id ).child( 'Timer' );

			sessionTimer.on( 'value', function ( timer ) {
				self.priceDB.once( 'value', function ( savedPrice ) {
					self.priceDB.set( Math.floor( timer.val() / 60 ) * self.options.pricePerMinute );
				});
			});
		}
		// Enable chaining
		return self;
	};	// price

	LT.prototype.timer = function ( handler, expiring, expired ) {
		var self = this,
			sessionTimer;

		self.sessionTimer = self.sessionsDB.child( self.options.id ).child( 'Timer' );

		self.sessionTimer.on( 'value', function ( timer ) {
			if ( timer.val() === null ) {
				if ( self._isTutor() ) self.sessionTimer.set( 0 );
			} else {
				sessionTimer = timer.val();

				if ( sessionTimer < self.options.sessionLength ) {
					if ( sessionTimer > ( self.options.sessionLength - self.options.expiringAlert ) ) {
						if ( expiring ) expiring();
					}
				} else {
					self.sessionTimer.off();
					self.sessionStatusDB.set( 'expired' );
					self.sessionStatusDB.off();

					if ( expired ) expired();
				}
			}

			if ( handler ) {
				handler(
					self.options.countDown ? self.options.sessionLength - sessionTimer : sessionTimer,
					self.options.sessionLength
				);
			}
		});

		if ( self._isTutor() ) {
			var tutorTimer = window.setInterval( function () {
				if ( self.sessionStatus == 'active' ) {
					self.sessionTimer.set( sessionTimer + ( sessionTimer < self.options.sessionLength ? 1 : 0 ) );
				}
			}, 1000 );
		}
		// Enable chaining
		return self;
	};	// timer

	LT.prototype.video = function (
		cameraContainer,
		streamContainer,
		onCameraPublished,
		onCameraUnpublished,
		onSubscribedToStream,
		onUnsubscribedFromStream
	) {
		var self = this;

		// Initialize Video
		self.cameraContainer = cameraContainer;
		self.streamContainer = streamContainer;
		self.onCameraPublished = onCameraPublished;
		self.onCameraUnpublished = onCameraUnpublished;
		self.onSubscribedToStream = onSubscribedToStream;
		self.onUnsubscribedFromStream = onUnsubscribedFromStream;

		self.publisher = null;
		self.session = null;
		self.subscribedStreams = {};
		// Set this for helpful debugging messages in console
		OT.setLogLevel( self.options.debugLevel );
		// Listen for exceptions
		OT.on( 'exception', self._exceptionHandler );

		// Enable chaining
		return self;
	};	// video

	LT.prototype.testVideo = function () {
		var self = this;

		// TODO: Check if it still works the same with v2.2
		// Test OpenTok capabilities
		var result = {};

		OT.runTests( function ( data ) {
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
				result[ i ] = data.cat_network.port_access[ i ].result;
			}
		});

		return result;
	};	// testVideo

	LT.prototype.drawingBoard = function ( container ) {
		var self = this;

		// Initialize Drawing Board
		self.drawingDB = self.sessionsDB.child( self.options.id ).child( 'Drawing' );
		self.drawingMode = self.drawingDB.child( 'Mode' );
		self.drawingUndo = self.drawingDB.child( 'Undo' );
		self.drawingRedo = self.drawingDB.child( 'Redo' );

		self.textX = self.textY = self.mode = '';
		self.undoBufferCount = self.redoBufferCount = 0;
		self.board = container.RaphBoard();

		self._boardEnable();

		// Enable chaining
		return self;
	};	// drawingBoard

	LT.prototype.fireCollab = function ( boardContainer ) {
		var self = this;

		// Initialize Drawing Board
		self.drawingDB = self.sessionsDB.child( self.options.id ).child( 'Drawing' );

		self.raphBoardDoc = [];

		FireCollab.initDB( self.drawingDB.toString() );

		// Initialize RaphBoard
		self.raphBoardAdapter = new RaphBoardAdapter( boardContainer );

		self.raphBoardAdapter
			.on( 'init', initBoard )
			.on( 'update', updateBoard );
		FireCollab.register( self.raphBoardAdapter );

		function initBoard ( content ) {
			self.raphBoard = self.raphBoardAdapter.board;

			self.raphBoardAdapter.set( content !== null ? content : self.raphBoardDoc );
		}

		function updateBoard ( op, opMetadata ) {
			self.raphBoardAdapter.update( op, self.raphBoard.elements );
		}

		// Enable chaining
		return self;
	};	// FireCollab

	LT.prototype.fileManager = function ( container, callback ) {
		var self = this;

		// TODO: Implement container instead of fixed elements
		self.filesCallback = callback;
		// Initialize File Manager
		self.filesDB = self.sessionsDB.child( self.options.id ).child( 'Files' );
		self.fU = $( '.LT_fileUpload' );

		filepicker.setKey( self.options.fpAPIkey );

		// self.fU.attr({
		// 	"data-fp-class"				: "LT_filePicker",
		// 	"data-fp-drag-text"			: "Click here or drop files to upload",
		// 	"data-fp-store-location"	: "S3",
		// 	"data-fp-store-access"		: "public",
		// 	"data-fp-extensions"		: self.options.acceptFileTypes,
		// 	"data-fp-container"			: self.options.fpContainer,
		// 	"data-fp-store-path"		: self.options.APIkey + "/" + self.options.id + "/",
		// 	"data-fp-maxSize"			: self.options.maxFileSize
		// });
		// self.fU[0].type = "filepicker-dragdrop";
		// self.fU[0].onchange = function ( e ) {
		// 	var closer = $( ".LT_filePicker > div > span" ).get(0);
		// 	if ( closer ) {
		// 		closer.click();
		// 	}
		// 	if ( e.fpfile ) {
		// 		self.filesDB.push({
		// 			file		: e.fpfile,
		// 			owner		: self.userName
		// 		});
		// 	}
		// };
		// filepicker.constructWidget( self.fU[0] );

		filepicker.makeDropPane( self.fU[ 0 ], {
			multiple  : false,
			location  : 'S3',
			access    : 'public',
			extensions: self.options.acceptFileTypes,
			// container : self.options.fpContainer,
			path      : self.options.APIkey + '/' + self.options.id + '/',
			maxSize   : self.options.maxFileSize,

			dragEnter : function () {
				self.fU.html( 'Drop file to upload' );
			},

			dragLeave : function () {
				self.fU.html( 'Drag and drop files here' );
			},

			onSuccess : function ( InkBlobs ) {
				self.filesDB.push({
					file : InkBlobs[ 0 ],
					owner: self.userName
				});

				self.fU
					.html( 'Done! Drag and drop another file here' )
					.removeAttr( 'disabled' );
			},

			onError   : function ( type, message ) {
				self.fU.html( '(' + type + ') ' + message );
			},

			onProgress: function ( percentage ) {
				self.fU.html( 'Uploading (' + percentage + '%)' );
			}
		});

		// Get files for this session
		self.numFiles = 0;

		$( '#LT_maxListedFiles' ).html( self.options.maxFiles );
		$( '.LT_fl_delete_all' ).button({
			icons: {
				primary: 'ui-icon-trash'
			},
			text : false
		});

		self._fileManagerActivate();

		// Enable chaining
		return self;
	};	// fileManager

	LT.prototype.deleteFiles = function () {
		var self = this;

		return self._deleteFiles();
	};	// deleteFiles

	LT.prototype.presence = function ( userName, statusContainer, nameContainer ) {
		var self = this;

		// Initialize Presence Status
		if ( userName !== '' ) {
			// Initialize Presence Status
			self.userName = userName;
			self.userList = self.sessionsDB.child( self.options.id ).child( 'Presence' );

			self.userList.once( 'value', function ( snapshot ) {
				self.participants = snapshot.numChildren();
			});

			if ( self.participants < self.options.maxParticipants ) {
				self.currentStatus = 'online';
				self.myStatus = self.userList.child( userName );

				// If we lose our internet connection, we want ourselves removed from the list.
				self.myStatus.onDisconnect().remove();

				self.myStatus.on( 'value', function ( snapshot )  {
					if ( snapshot.val() === null ) {
						self._setUserStatus( self.currentStatus );
					}
				});
				// Anytime an online status is added, removed, or changed, we want to update the GUI
				self.userList.on( 'child_added', function ( snapshot ) {
					self._addStatus( snapshot, statusContainer, nameContainer );
				});

				self.userList.on( 'child_changed', function ( snapshot ) {
					self._updateStatus( snapshot, statusContainer, nameContainer );
				});

				self.userList.on( 'child_removed', function ( snapshot ) {
					if ( self.options.pauseOnDisconnect && self.sessionStatus == 'active' ) {
						self.sessionStatusDB.set( 'pause' );
					}

					self._removeStatus( snapshot, statusContainer, nameContainer );
				});

				document.onIdle = function () {
					self._setUserStatus( 'idle' );
				};

				document.onAway = function () {
					self._setUserStatus( 'away' );
				};

				document.onBack = function ( isIdle, isAway ) {
					self._setUserStatus( 'online' );
				};

				self._setIdleTimeout( self.options.idleTimeout );
				self._setAwayTimeout( self.options.awayTimeout );
			}
		}
		// Enable chaining
		return self;
	};	// presence

	LT.prototype.chat = function ( container, messageList, userInput ) {
		var self = this;

		// TODO: Implement container ONLY (and append other elements to it)
		// Initialize Text Chat
		var numMessages = 0;

		messageList.html( '' );

		self.chatDB = self.sessionsDB.child( self.options.id ).child( 'Chat' );

		self.chatDB.on( 'child_added', function ( snapshot ) {
			var message = snapshot.val();

			numMessages++;

			self._printChatMessage(
				container,
				messageList,
				message.name,
				message.text,
				// ( numMessages % 2 ) == 1
				( message.name == self.userName )
			);
		});

		userInput.keypress( function ( e ) {
			var text;

			// TODO: Check how this works for tablets
			if ( e.keyCode == 13 ) {
				text = userInput.val();

				self.chatDB.push({
					name: self.userName,
					text: text
				});

				userInput.val( '' );
			}
		});
		// Enable chaining
		return self;
	};	// chat

	LT.prototype.request = function ( status ) {
		var self = this;

		self.sessionStatusDB.set( status );
	};	// request

	LT.prototype.decline = function ( status ) {
		var self = this;

		switch ( status ) {
			case 'pause':
				self.sessionStatusDB.set( 'active' );
				break;

			case 'resume':
				self.sessionStatusDB.set( 'paused' );
				break;
			default:
			// Ignore the rest
		}
	};	// decline

	LT.prototype.pause = function () {
		var self = this;

		// Chat will stay active for all parties!
		if ( self.session ) {
			// 	self._cameraPause( true );
			// 	self._streamPause( true );
			// } else {
			self._videoDisconnect();
		}

		if ( self._isStudent() ) {
			self._boardDisable();
			self._fileManagerDeactivate();
		}
	};	// pause

	LT.prototype.resume = function () {
		var self = this;

		if ( !self.videoSession ) {
			// if ( self.videoSession ) {
			// 	self._cameraPause( false );
			// 	self._streamPause( false );
			// } else {
			self._videoConnect();
		}

		if ( self._isStudent() ) {
			self._boardWipe();
			self._fileManagerActivate();
		}
	};	// resume

	LT.prototype.quit = function () {
		var self = this;

		self._presenceLeave();
		self._videoDisconnect();
		self._boardDump();
		self._fileManagerDeactivate();
		self._chatDeactivate();
	};	// quit

	// Export as global variable
	window.LiveTutor = LT;

})( jQuery, window, document );
