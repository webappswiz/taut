/**
 * fnmenu.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://miro.mit-license.org
 *
 * Copyright 2014, M. Hibler
 * http://miro.hibler.me
*/
;( function ( window, document ) {

	'use strict';

	var fcMenu = function ( el, options ) {
			this.el = el;
			this._init();
		};

	fcMenu.prototype = {
		_init : function() {
			var self = this;

			self.menu = self.el.querySelector( 'nav.fc-menu-wrapper' );
			self.trigger = document.getElementById( 'fc-menu' );
			self.isMenuOpenedPartly = false;
			self.isMenuOpenedFully = false;
			self.eventType = mobileCheck() ? 'touchstart' : 'click';
			self.events = {
				onTriggerEnter: function( ev ) {
					if ( !( self.isMenuOpenedPartly || self.isMenuOpenedFully ) ) {
						self._openIconMenu();
					}
				},
				onTriggerAction: function( ev ) {
					ev.stopPropagation();
					ev.preventDefault();

					if ( self.isMenuOpenedFully ) {
						self.close();
					} else {
						self.open();
					}
				},
				onTriggerExit: function( ev ) {
					// if ( self.isMenuOpenedPartly ) {
					// 	self._closeIconMenu();
					// }
				},
				onMenuEnter: function( ev ) {
					self._openIconMenu();
				},
				onBodyClick: function( ev ) {
					self._closeIconMenu();
					self.close();
					this.removeEventListener( self.eventType, self.events.onBodyClick );
				}
			};

			self._initEvents();

			return self;
		},

		_initEvents : function() {
			var self = this;

			if ( !mobileCheck() ) {
				self.trigger.addEventListener( 'mouseover', self.events.onTriggerEnter );
				self.trigger.addEventListener( 'mouseout', self.events.onTriggerExit );
				self.menu.addEventListener( 'mouseover', self.events.onMenuEnter );
			}

			self.trigger.addEventListener( self.eventType, self.events.onTriggerAction );

			self.menu.addEventListener( self.eventType, function( ev ) {
				ev.stopPropagation();
			});
		},

		_openIconMenu : function() {
			if ( this.isMenuOpenedPartly ) return;

			classie.add( this.menu, 'gn-open-all' );

			$( '#fc-menu .gn-menu' ).each(function(){ $( this ).addClass( 'fc-menu-expand' ); });

			document.addEventListener( this.eventType, this.events.onBodyClick );

			this.isMenuOpenedPartly = true;
		},

		_closeIconMenu : function() {
			if ( !this.isMenuOpenedPartly ) return;
			var self = this;

			$( '#fc-menu .gn-menu' ).each(function(){ $( this ).addClass( 'fc-menu-shrink' ).removeClass( 'fc-menu-expand' ); });

			document.removeEventListener( this.eventType, this.events.onBodyClick );

			setTimeout( function () {
				$( '#fc-menu .gn-menu' ).each(function(){ $( this ).removeClass( 'fc-menu-shrink' ); });

				classie.remove( self.menu, 'gn-open-all' );

				self.isMenuOpenedPartly = false;
			}, 250 );
		},

		open : function( callback ) {
			var self = this;

			if ( self.isMenuOpenedFully ) return;
			classie.add( self.trigger, 'gn-selected' );
			self.isMenuOpenedPartly = false;
			self.isMenuOpenedFully = true;
			classie.add( self.menu, 'gn-open-full' );
			self._closeIconMenu();

			document.addEventListener( self.eventType, self.events.onBodyClick );

			if ( callback ) callback();
		},

		close : function( callback ) {
			var self = this;

			mainMenu._closeIconMenu();
			mainMenu.close();

			if( !self.isMenuOpenedFully ) return;
			classie.remove( self.trigger, 'gn-selected' );
			self.isMenuOpenedFully = false;
			classie.remove( self.menu, 'gn-open-full' );
			self._closeIconMenu();

			document.removeEventListener( self.eventType, self.events.onBodyClick );

			if ( callback ) callback();
		}
	};

	// add to global namespace
	window.fcMenu = fcMenu;

})( window, document );