/**
 * PhotoContainerScaler
 * @author Jeff Fohl jeff@godengo.com
 * @copyright Godengo+Texterity, 2012
 * 
 * Scales image containers to the size of the image
 * so that captions don't push out the edges of the
 * container beyond the width of the image.
 * Recursively checks up to 50 times in order to work
 * with responsive images. See picturefill.js.
 * 
 * Dependencies: jQuery
 */

var PhotoContainerScaler = (function() {
	
	// private parts
	var counter = 0;
	var timeOutID = null;
	function resize () {
		counter++;
		// if we have tried 50 times and still nothing, we break the recursion
		if (counter > 50) {
			return;
		}
		var photos = rjQuery(".image-container");
		if (photos == null) {
			return;
		}
		rjQuery.each(photos,function(key,value) {
			var image = rjQuery(value).find("img");
			rjQuery(value).css({"width":"auto"});
			var width = rjQuery(image).width();
			if (width === null || width <= 28) {
				window.clearTimeout(timeOutID);
				delete timeOutID;
				PhotoContainerScaler.init();
				return;
			} else {
				rjQuery(value).css({"width":width});
			}
		});
	}

	// public parts
	return {
		init: function init() {
			timeOutID = window.setTimeout(function() {
				resize();
			}, 50);
		}
	};
	
})();

WindowResizeResponder.register({
	"method": PhotoContainerScaler.init,
	"when": "load",
	"startDelay": 0
});

