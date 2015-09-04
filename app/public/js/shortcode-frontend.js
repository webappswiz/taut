(function($) {
  "use strict";
$(document).ready(function(){
	// Tabs
	$('body:not(.bt-other-shortcodes-loaded) .our-team-nav span').on('click',  function (e) {
		var $tab = $(this),
			index = $tab.index(),
			is_disabled = $tab.hasClass('bt-tabs-disabled'),
			$tabs = $tab.parent('.our-team-nav').children('span'),
			$panes = $tab.parents('.our-team-tabs').find('.our-team-pane'),
			$gmaps = $panes.eq(index).find('.bt-gmap:not(.bt-gmap-reloaded)');
		// Check tab is not disabled
		if (is_disabled) return false;
		// Hide all panes, show selected pane
		$panes.hide().removeClass('active').eq(index).show().addClass('active');
		// Disable all tabs, enable selected tab
		$tabs.removeClass('our-team-current').eq(index).addClass('our-team-current');
		// Reload gmaps
		if ($gmaps.length > 0) $gmaps.each(function () {
			var $iframe = $(this).find('iframe:first');
			$(this).addClass('bt-gmap-reloaded');
			$iframe.attr('src', $iframe.attr('src'));
		});
		// Set height for vertical tabs
		tabs_height();
		e.preventDefault();
	});
	$('.tab-history .our-team-nav span').unbind('click');
	$('.tab-history .our-team-nav span').on('click',  function (e) {
		var $tab = $(this),
			index = $tab.index(),
			is_disabled = $tab.hasClass('bt-tabs-disabled'),
			$tabs = $tab.parent('.our-team-nav').children('span'),
			$panes = $tab.parents('.our-team-tabs').find('.our-team-pane'),
			$gmaps = $panes.eq(index).find('.bt-gmap:not(.bt-gmap-reloaded)');
		// Check tab is not disabled
		if (is_disabled) return false;
		// Hide all panes, show selected pane
		//$panes.hide().removeClass('active').eq(index).show().addClass('active');
		$panes.each(function(){
			var self = $(this);
			if($(this).hasClass('active')){
				$(this).removeClass('active').addClass('out');
			}
			setTimeout(function(){
				self.removeClass('out');
			}, 700);
		});
		
		$panes.eq(index).show().addClass('active');
		var height = $panes.eq(index).outerHeight();
		$tab.parents('.our-team-tabs').find('.our-team-panes').animate({height: height}, 700);
		// Disable all tabs, enable selected tab
		$tabs.removeClass('our-team-current').eq(index).addClass('our-team-current');
		// Reload gmaps
		if ($gmaps.length > 0) $gmaps.each(function () {
			var $iframe = $(this).find('iframe:first');
			$(this).addClass('bt-gmap-reloaded');
			$iframe.attr('src', $iframe.attr('src'));
		});
		// Set height for vertical tabs
		tabs_height();
		e.preventDefault(); 
	});
	$(window).resize(function(){
		var height = $('.tab-history .our-team-panes .active').height();
		$('.tab-history .our-team-panes').height(height);
	});
	// Activate tabs
	$('.our-team-tabs').each(function () {
		var active = parseInt($(this).data('active')) - 1;
		$(this).children('.our-team-nav').children('span').eq(active).trigger('click');
		tabs_height();
	});

	// Activate anchor nav for tabs and spoilers
	anchor_nav();
	
	function tabs_height() {
		$('.bt-tabs-vertical, .bt-tabs-vertical-right').each(function () {
			var $tabs = $(this),
				$nav = $tabs.children('.our-team-nav'),
				$panes = $tabs.find('.our-team-pane'),
				height = 0;
			$panes.css('min-height', $nav.outerHeight(true));
		});
	}
	function anchor_nav() {
		// Check hash
		if (document.location.hash === '') return;
		// Go through tabs
		$('.our-team-nav span[data-anchor]').each(function () {
			if ('#' + $(this).data('anchor') === document.location.hash) {
				var $tabs = $(this).parents('.our-team-tabs');
					 
				// Activate tab
				$(this).trigger('click');
				// Scroll-in tabs container
				window.setTimeout(function () {
					$(window).scrollTop($tabs.offset().top - 10);
				}, 100);
			}
		});
		
		// Go through spoilers
		$('.experience-spoiler[data-anchor]').each(function () {
			if ('#' + $(this).data('anchor') === document.location.hash) {
				var $spoiler = $(this);
				// Activate tab
				if ($spoiler.hasClass('experience-spoiler-closed')) $spoiler.find('.experience-details-title:first').trigger('click');
				// Scroll-in tabs container
				window.setTimeout(function () {
					$(window).scrollTop($spoiler.offset().top  - 10);
				}, 100);
			}
		});
	}

	if ('onhashchange' in window) $(window).on('hashchange', anchor_nav);
	
	/**
	 * Accordion
	 */
	$('.experience-main .experience-details-content').hide();
	$('.experience-main').each(function(){
		if($(this).data('active-first') == 'yes'){
			$(this).find('.experience-spoiler').eq(0).addClass('experience-spoiler-opened').children('.experience-details-content').show();
		}
	});
	$('.experience-details-title').click(function(e){
		var $spoiler = $(this).parent();
		var $accordion = $spoiler.parent();
		$accordion.find('.experience-spoiler-opened .experience-details-content').stop();
		if($spoiler.hasClass('experience-spoiler-opened')){
		
			$spoiler.removeClass('experience-spoiler-opened');
			$(this).next('.experience-details-content').slideUp(300);
			
		}else{
			$('.experience-spoiler').removeClass('experience-spoiler-opened');
			$('.experience-spoiler .experience-details-content').slideUp(300);
			$spoiler.addClass('experience-spoiler-opened');
			$(this).next('.experience-details-content').slideDown(300);
		}
		
	});
});
	//$('body').addClass('bt-other-shortcodes-loaded');
})(jQuery);