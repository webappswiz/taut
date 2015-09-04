var escape = function ( $ ) {
	var unwanted = $( "#page-bg" ),
		wanted = $( ".container" );

		// Remove Joomla (and other unwanted) CSS
		// TODO: Check this out!
		$( "link[rel=stylesheet]" ).map(function(){
			if ( this.href.indexOf( "com_livetutor" ) == -1 ) {
				this.remove();
			}
		});

		// Escape from Joomla template
		unwanted.replaceWith( wanted );
	}
