(function ($) {
	 "use strict";
$(document).ready(function () {
    $('#parallax-block').btparallaxfix("50%", 0.5);
	$(window).resize(function(){
		$('#parallax-block').btparallaxfix("50%", 0.5);
     });
     var options = {
         slideSize: {'type': 'full', 'size': ''}, // type = full or auto
         parallaxType: 'dynamic', // parallaxType = static or dynamic
         item_width: 200,
         item_height: 200,
         rows: 2,
         spacing: 5,
         scroll_direction: 'rtl',
         speed: 2,
         next_prev_s: 200,
         contentType: 'video' // contentType = image or video
     };
     $('#parallax-block').btParallax(options);
});

$(document).ready(function () {
     $('#parallax-block-modern').btparallaxfix("50%", 0.5);
     var options = {
         slideSize: {'type': 'full', 'size': '1170'}, // type = full or auto
         parallaxType: 'dynamic', // parallaxType = static or dynamic
         item_width: 'auto',
         item_height: 'auto',
		 centerPadding:50,
         rows: 1,
         spacing: 15,
         scroll_direction: 'rtl',
         speed: 2,
         next_prev_s: 200,
         contentType: 'image' // contentType = image or video
     };
     $('#parallax-block-modern').btParallax(options);
 });
 })(jQuery);