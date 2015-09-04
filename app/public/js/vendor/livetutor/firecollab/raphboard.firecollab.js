/*! ┌───────────────────────────────────────────────────────────────────────────────────────────┐ */
/*! │ <%= meta.title %> v<%= meta.version %> - <%= meta.description %>                                     │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Copyright © <%= meta.copyright %> (<%= meta.homepage %>)               │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Licensed under the MIT (<%= meta.licenses[0]["url"] %>) license.                             │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Requirements: RaphBoard (http://MiroHibler.github.com/RaphBoard/)                         │ */
/*! │               FireCollab (http://MiroHibler.github.com/FireCollab/)                       │ */
/*! └───────────────────────────────────────────────────────────────────────────────────────────┘ */

function RaphBoardAdapter ( containerID, dbName ) {

	var _version = "<%= meta.version %>",

		_obj	= require( "jot/objects.js" ),
		_seqs	= require( "jot/sequences.js" ),
		_values	= require( "jot/values.js" ),

		_self,
		_currentNodeId,

		_attributes		= { /* 37: { x: 0, y: 0 } */ },			// attributes
		_freeTransforms	= { /* 37: { x: 0, y: 0 } */ },			// freeTransform attributes
		_queue			= [										// queue of attributes/freeTransforms
			/* { 37: { x: 0, y: 0 } } */						// attributes
			/* { 37: { freeTransform: { x: 0, y: 0 } } } */		// attributes
			/* { 37: null } */									// element to be deleted
		],

		_update = function ( op, node ) {
			var self = _self,
				board = _self.board;

			if ( node && !( node instanceof Array ) && node.hasOwnProperty( "id" ) ) {
				_currentNodeId = node.id;
			}

			if ( op instanceof Array ) {
				for ( var i = 0; i < op.length; i++ ) {
					_update( op[i], node );
				}

				if ( node instanceof Array ) {	// Document root only!
					_queueFreeTransform( _currentNodeId );
					self._isReady = true;
				}

				return self;
			}

			switch ( op.module_name ) {
				case "objects.js":
					switch ( op.type ) {
						case "prop":
							// creation of a node (element)
							board.fromJSON( op.new_value );
							break;
						case "apply":
							switch ( op.key ) {
								case "element":
									if ( op.op.key === "data" ) {
										if ( !_freeTransforms[_currentNodeId] ) {
											_freeTransforms[_currentNodeId] = board.freeTransform( _currentNodeId );
										}
										_update( op.op, {
											data: {
												ft: {
													attrs: _freeTransforms[_currentNodeId]
												}
											}
										});
									} else {	// NOT updating freeTransform
										// _update( op.op, node );
										if ( !_attributes[_currentNodeId] ) {
											_attributes[_currentNodeId] = board.element( _currentNodeId ).attrs;
										}
										_update( op.op, _attributes[_currentNodeId] );
									}
									break;
								case "data":
								case "ft":
									_update( op.op, node[op.key] );
									break;
								case "center":
								case "scale":
								case "size":
								case "translate":
									_update( op.op, node );
									break;
								case "path":
									_update( op.op, node.path );
									break;
								case "transform":
									var transform = { value: node.matrix.toTransformString() };

									_update( op.op, transform );
									// Update board's element
									// TODO: QUEUE IT, NOT DIRECT!
									board.transform( node.id, transform.value );
									break;
								case "attrs":
									if ( node.attrs[op.op.key] instanceof Object ) {
										_update( op.op, node.attrs[op.op.key] );
									} else {
										var attr = {};

										attr[op.op.key] = node.attrs[op.op.key];
										_update( op.op, attr );

										if ( _freeTransforms[_currentNodeId] ) {	// Updating freeTransform?
											// NOTE: May not be true since we're not removing
											// transformations after they are applied - need to find a
											// betterway...
											node.attrs[op.op.key] = attr[op.op.key];
										} else {
											// Update board's element but queue all
											// modifications in one single action
											// TODO: Needs check!!!
											_queueAttribute( node.id, attr );
										}
									}
									break;
								default:	// value
									var attr = {
										key		: op.key,
										value	: node[op.key]
									};

									_update( op.op, attr );
									node[op.key] = attr.value;
									break;
							}
						default:
							// Nothing yet
					}
					break;
				case "sequences.js":
					if ( node instanceof Array ) {
						if ( op.type == "splice" ) {
							// (Firebase doesn't store empty properties, so we have to check if
							// op.old_value and op.new_value are null before getting length. (?))

							// remove
							var elements = [],
								element;

							for ( var i = 0; i < ( op.old_value ? op.old_value.length : 0 ); i++ ) {
								element = board.elements[op.pos];
								if ( element ) {
									elements.push( element.id );
								} else {
									elements.push({
										cutAt: op.pos
									});
								}
							}
							_queueCut( elements );

							// insert
							elements = [];

							for ( var i = 0; i < ( op.new_value ? op.new_value.length : 0 ); i++ ) {
								elements.push({
									insert	: op.new_value[i],
									at		: op.pos
								});
							}
							_queueAdd( elements );

							return;
						}

						if ( op.type === "apply" ) {
							if ( op.op.module_name === "values.js" ) {
								var attr = {};
								_update( op.op, attr );
								node[op.pos] = attr.value;
							} else {
								if ( node[op.pos] ) {
									// Element already on board
									_update( op.op, node[op.pos] );
								} else {
									// Element still in queue
									var _element = _elementByPos( op.pos );

									if ( _element.node ) {
										if ( !_freeTransforms[_element.id] ) {
											_freeTransforms[_element.id] = JSON.parse( JSON.stringify( _element.node.data.ft.attrs ) );
										}
										_update( op.op, _element.node );
									}
								}
							}

							return;
						}
					}

					switch ( op.type ) {
						case "apply":
							if ( node[op.pos] instanceof Array ) {
								_update( op.op, node[op.pos] );
							} else {
								var newValue;
								_update( op.op, newValue );
								node[op.pos] = newValue;
							}
							break;
						case "splice":
							node.value = node.value.splice( op.pos, op.old_value.length, op.new_value );
							break;
						default:
							// Nothing yet
					}
					break;
				case "values.js":
					if ( op.type == "rep" ) {
						node.value = op.new_value;
					}
					break;
				default:
					console.log( "FireCollab Adapter Not Handled: " + op.module_name + "#" + op.type );
					console.log( op );
					console.log( node );
			}

			return;
		},	// update

		_elementByPos = function ( pos ) {
			var _element = {
				id	: null,
				node: null
			};
			_queue.map( function ( task ) {
				if ( _element.node ) return;
				for ( var id in task ) {
					if ( task[id].hasOwnProperty( "at" ) && task[id].at == pos ) {
						_element.node = JSON.parse( JSON.stringify( task[id].insert.element ) );
						_element.id = id;
						break;	// We've found the node!
					}
				}
			});

			return _element;
		},

		_runAsync = function () {
			setTimeout( function () {
				if ( !_self._isDrawing ) {	// Are we busy?
					// No? Then do something...
					if ( _queue.length > 0 ) {
						_exeQueued();
					}
				}
				_runAsync();
			}, 0 );
		},

		_queueCut = function ( elements ) {
			if ( elements ) {
				elements.map( function ( id ) {
					var elem = {/* ie. 37: null */};
					if ( typeof id == "object" ) {
						// Get the element ID from the _queue
						var _element = _elementByPos( id.cutAt );
						elem[_element.id] = null;
					} else {
						elem[id] = null;
					}
					_queue.push( JSON.parse( JSON.stringify( elem ) ) );
				});
			}
		},

		_queueAdd = function ( elements ) {
			if ( elements ) {
				elements.map( function ( obj ) {
					var elem = {/* ie. 37: obj */};
					elem[obj.insert.element.id] = obj;
					_queue.push( JSON.parse( JSON.stringify( elem ) ) );
				});
			}
		},

		_queueAttribute = function ( id ) {
			if ( id ) {
				var elem = {/* ie.: 37: { x: 0, y: 0 } */};
				elem[id] = _attributes[id];
				_queue.push( JSON.parse( JSON.stringify( elem ) ) );
			}
		},

		_queueFreeTransform = function ( id ) {
			if ( id ) {
				var elem = {/* ie.: 37: { freeTransform: { x: 0, y: 0 } } */};
				elem[id] = {/* freeTransform: { x: 0, y: 0 } */};
				elem[id].freeTransform = _freeTransforms[id];
				_queue.push( JSON.parse( JSON.stringify( elem ) ) );
			}
		},

		_ftCallback = function ( ft, events ) {
			switch ( events[0] ) {
				case "animate start":
					break;
				case "animate end":
				case "apply":
					_self._isDrawing = false;	// And now we're ready for more
					break;
				default:
					// Nothing here
			}

			return;
		},

		_exeQueued = function () {
			if ( _queue.length > 0 ) {
				_self._isDrawing = true;

				for ( var id in _queue[0] ) {
					var attrs = JSON.parse( JSON.stringify( _queue[0][id] ) );
					_queue.shift();

					if ( attrs ) {
						if ( attrs.hasOwnProperty( "freeTransform" ) ) {
							// Modify element
							_self.board.freeTransform( id, attrs.freeTransform, _ftCallback );
						} else if ( attrs.insert ) {
							// Create new element
							_self.board.fromJSON( attrs.insert );
							_self._isDrawing = false;	// And now we're ready for more
						} else {
							// Modify element
							_self.board.modify( id, attrs );
							_self._isDrawing = false;
						}
					} else {
						// Delete the element
						_self.board.cut( id );
						_self._isDrawing = false;
					}
				}
			}

			return;
		},

		_elementIndex = function ( elements, id ) {
			for ( var i = 0; i < elements.length; i++ ) {
				if ( elements[i].id === id ) {
					return i;
				}
			}
			// If there's no element with specified id,
			// return the last index (first non-existant)
			return i;
		},

		_updateElementAttribute = function ( id, path, op ) {
			var _path = path || [ "element", "attrs" ],
				_index = _elementIndex( _self.board.elements, id );

			if ( _index !== null ) {
				var _op = _obj.access(
						[ _index ].concat( _path ),
						op
					);
				_self.eventLoop.pushLocalChange( _op );
			}
		},

		_updateElementAttributes = function ( element, oldAttributes, newAttributes, path ) {
			var _path = path || [ "element" ];

			for ( var _field in newAttributes ) {
				var _newValue = newAttributes[_field];

				if ( _newValue instanceof Object ) {
					_updateElementAttributes(
						element,
						oldAttributes.hasOwnProperty( _field ) ? oldAttributes[_field] : {},
						_newValue,
						_path.concat( [ _field ] )
					);
				} else {
					var _oldValue = ( oldAttributes.hasOwnProperty( _field ) ) ? oldAttributes[_field] : "";
					if ( _newValue !== _oldValue ) {
						_updateElementAttribute(
							element.id,
							_path.concat( [ _field ] ),
							_values.SET(
								_oldValue,
								_newValue
							)
						);
					}
				}
			}
		},

		_previousElement = function ( buffer, elem ) {
			for ( var i = buffer.length - 1; i >= 0; i-- ) {
				if ( buffer[i].element.id === elem.element.id ) {
					return buffer[i];
				}
			}

			return elem;	// If not found, return the same element
		},

		_insertElementBefore = function ( elem, index ) {
			var _op = _obj.access(
					// TODO: Take care of adding elements to
					// sets as well as to paper (root)
					[],
					"sequences.js",
					"INS",
					index,
					[ JSON.parse( JSON.stringify( elem ) ) ]
				);

			_self.eventLoop.pushLocalChange( _op );
		},

		_appendElement = function ( elem ) {
			_insertElementBefore( elem, _self.board.elements.length - 1 );	// it's already been inserted
		},

		_removeElement = function ( index, elem ) {
			if ( index !== null ) {
				var _op = _obj.access(
						// TODO: Take care of removing elements from
						// sets as well as from paper (root)
						[],
						"sequences.js",
						"DEL",
						index,
						[ JSON.parse( JSON.stringify( elem ) ) ]
					);

				_self.eventLoop.pushLocalChange( _op );
			}
		},

		_raphBoardAdapter = new FireCollabAdapter( containerID, dbName ),

		_prototype = {

			get version() {
				return _version;
			},	// get version

			set board( board ) {
				this._board = board;
			},

			get board() {
				return this._board;
			},

			get isDrawing() {
				return this._isDrawing;
			},

			init: function ( containerID, dbName ) {
				_self = this;

				// Call Super handler
				_self._super( containerID, dbName );

				_self._textX = _self._textY = _self._mode = "",
				_self._undoBufferCount = _self._redoBufferCount = 0,
				_self._oldElements = [],

				_self.board = $( "#" + containerID ).RaphBoard();

				_self._isDrawing = false;

				_self.enable();

				_runAsync();

				return _self;
			},	// init

			enable: function () {
				if ( _self.board ) {
					_self.board
						.on( "before_start", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;
							_self._redoBufferCount = board.redoBuffer.length;

							switch ( board.mode() ) {
								case "text":
									// return false;
								default:
									return true;
							}	// switch ( board.mode() )
						})
						.on( "after_end", function( board ) {
							if ( board.undoBuffer.length > _self._undoBufferCount ) {
								var _elem = board.undoBuffer.pop(),
									_prev = _previousElement( board.undoBuffer, _elem );

								board.undoBuffer.push( _elem );

								switch ( _elem.command ) {	// "move|modify|transform|pen|line|arrow|circle|ellipse|rect|text|cut|clear"
									case "move":
									case "modify":
									case "transform":
										// Nothing yet
										break;
									default:	// Add element
										_appendElement( _elem );
								}	// switch ( _elem.command )
							}
						})
						.on( "before_move", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;
							return true;
						})
						.on( "after_move", function( board ) {
							if ( board.undoBuffer.length > _self._undoBufferCount ) {
								var _elem = board.undoBuffer.pop(),
									_prev = _previousElement( board.undoBuffer, _elem );

								board.undoBuffer.push( _elem );

								if ( _prev ) {
									_updateElementAttributes(
										_elem.element,
										_prev.element.data.ft.attrs ? _prev.element.data.ft.attrs : {},
										_elem.element.data.ft.attrs ? _elem.element.data.ft.attrs : {},
										[ "element", "data", "ft", "attrs" ]
									);
								}
							}
						})
						.on( "before_cut", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;
							_self._oldElements = JSON.parse( board.toJSON() );

							return true;
						})
						.on( "after_cut", function( board ) {
							if ( board.undoBuffer.length > _self._undoBufferCount ) {
								var id = board.undoBuffer[ board.undoBuffer.length - 1 ].element.id;
								for ( var i = 0; i < _self._oldElements.length; i++ ) {
									if ( _self._oldElements[i].element.id === id ) {
										_removeElement( i, _self._oldElements[i] );
										break;
									}
								}
							}
							_self._oldElements = null;
						})
						.on( "before_undo", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;
							_self._redoBufferCount = board.redoBuffer.length;

							return true;
						})
						.on( "after_undo", function( board ) {
							if ( board.redoBuffer.length > _self._redoBufferCount ) {
								var _elem = board.redoBuffer[ board.redoBuffer.length - 1 ],
									_prev = _previousElement( board.undoBuffer, _elem );

								switch ( _elem.command ) {	// "move|modify|transform|pen|line|arrow|circle|ellipse|rect|text|cut|clear"
									case "move":
										if ( _prev ) {
											_updateElementAttributes(
												_elem.element,
												_elem.element.data.ft.attrs ? _elem.element.data.ft.attrs : {},
												_prev.element.data.ft.attrs ? _prev.element.data.ft.attrs : {},
												[ "element", "data", "ft", "attrs" ]
											);
										}
										break;
									case "modify":
										if ( _prev ) {
											_updateElementAttributes(
												_elem.element,
												_prev.element.attrs,
												_elem.element.attrs,
												[ "element", "attrs" ]
											);
										}
										break;
									case "transform":
										if ( _prev ) {
											_updateElementAttributes(
												_elem.element,
												{ "transform": _prev.element.transform },
												{ "transform": _elem.element.transform },
												[ "element" ]
											);
										}
										break;
									case "cut":
										// Re-draw the element by inserting it where it was before
										var _nextIndex = _elementIndex( board.elements, _prev.element.id );
										if ( _nextIndex < board.elements.length ) {
											_insertElementBefore( _prev, _nextIndex );
										} else {
											_appendElement( _prev );
										}
										break;
									default:
										// Just delete the element
										_removeElement( _elementIndex( board.elements, _elem.element.id ), _elem );
								}	// switch ( _elem.command )
							}
						})
						.on( "before_redo", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;
							_self._oldElements = JSON.parse( board.toJSON() );

							return true;
						})
						.on( "after_redo", function( board ) {
							if ( board.undoBuffer.length > _self._undoBufferCount ) {
								var _elem = board.undoBuffer.pop(),
									_prev = _previousElement( board.undoBuffer, _elem );

								board.undoBuffer.push( _elem );

								switch ( _elem.command ) {	// "move|modify|transform|pen|line|arrow|circle|ellipse|rect|text|cut|clear"
									case "move":
										if ( _prev ) {
											_updateElementAttributes(
												_elem.element,
												_prev.element.data.ft.attrs ? _prev.element.data.ft.attrs : {},
												_elem.element.data.ft.attrs ? _elem.element.data.ft.attrs : {},
												[ "element", "data", "ft", "attrs" ]
											);
										}
										break;
									case "modify":
										if ( _prev ) {
											// _updateElementAttributes( _elem.element, _prev.element.attrs, _elem.element.attrs );
											_updateElementAttributes(
												_elem.element,
												_prev.element.attrs,
												_elem.element.attrs,
												[ "element", "attrs" ]
											);
										}
										break;
									case "transform":
										if ( _prev ) {
											// _transformElement( _self, _elem.element, _prev.element.transform );
											_updateElementAttributes(
												_elem.element,
												{ "transform": _prev.element.transform },
												{ "transform": _elem.element.transform },
												[ "element" ]
											);
										}
										break;
									case "cut":
										if ( _prev ) {
											_removeElement( _elementIndex( _self._oldElements, _prev.element.id ), _prev );
										}
										break;
									default:
										// Re-draw the element by inserting it where it was before
										var _nextIndex = _elementIndex( _self._oldElements, _prev.element.id );

										if ( _nextIndex < _self._oldElements.length ) {
											_insertElementBefore( _prev, _nextIndex );
										} else {
											_appendElement( _prev );
										}
								}	// switch ( _elem.command )
							}

							_self._oldElements = null;
						})
						.on( "before_clear", function( board ) {
							_self._undoBufferCount = board.undoBuffer.length;

							return true;
						})
						.on( "after_clear", function( board ) {
							if ( board.undoBuffer.length > _self._undoBufferCount ) {
								/*
								// NO CLEAR FUNCTION YET!
								*/
							}
					});

					_self.board.enable();
				}

				return _self;
			},	// enable

			disable: function() {
				if ( _self.board ) {
					_self.board.disable();
				}

				return _self;
			},	// disable

			set: function ( doc ) {
				// Call Super handler
				_self._super( doc );

				_self.board.fromJSON( doc );

				return _self;
			},	// set

			update: function ( op, node ) {
				// Call Super handler
				_self._super();

				_update( op, node );

				return _self;
			},	// update

			clear: function() {
				if ( _self.board ) {
					_self.disable();
					_self.board.clear();
					_self.enable();
				}

				return _self;
			},	// clear

			destroy: function() {
				_self.disable();
				_self.board = null;

				return _self;
			}	// destroy
		};

	_raphBoardAdapter.fn = _raphBoardAdapter.prototype = _raphBoardAdapter.subClass( _prototype ).prototype;

	// The FireCollab Adapter object is actually just the init constructor 'enhanced'
	return _raphBoardAdapter.fn.init( containerID, dbName );
}
