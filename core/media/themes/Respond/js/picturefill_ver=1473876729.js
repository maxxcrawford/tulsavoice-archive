/**
 * PictureFill
 * Modified: Peter Scannell
 * Date: August 2012
 * Based on:
 *     Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with divs).
 *     Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2
 * 
 * NOTE: Currently, this routine only works with the max-width media query.  It is linked to the php
 * function addresponsiveimg which currently only sets up for max-width.  If we decide to support
 * other media queries, then both getCurrentMediaQuery and tallyMediaQueries must be updated.
 * 
 */


var PictureFill = (function() {
	var mediaQueries = [];

	// Enable strict mode
	"use strict";

	/**
	 * Loop through all the picture fill data blocks and create an array with
	 * all the breakpoints we are paying attention to on the current page.
	 */
	function tallyMediaQueries() {
		mediaQueries = [];
		// Note: getAttribute is faster than jQuery.attr
		rjQuery.each(rjQuery("div.data-media-block"), function() {
			if (rjQuery.inArray(this.getAttribute("data-media"), mediaQueries) == -1) {
				mediaQueries.push(this.getAttribute("data-media"));
			}
		});
		var start = "(max-width: ".length;
		mediaQueries.sort(function(a,b) {
			var a1 = parseInt(a.substring(start), 10);
			var b1 = parseInt(b.substring(start), 10);
			return (a1 - b1);
		});
	};

	/**
	 * Loop through the array of breakpoints to see which one applies for the
	 * current media query/resize state of the browser.
	 * 
	 * @returns matched breakpoint or empty string for no match (default)
	 */
	function getCurrentMediaQuery() {
		var currentMediaQuery = "";
		rjQuery.each(mediaQueries, function(index, value) {
			if (matchMedia && matchMedia(value).matches) {
				currentMediaQuery = value;
				return false;
			}
		});
		return currentMediaQuery;
	};


	return {
		/**
		 * Check to see if we need to replace pictures based on the detected breakpoint.
		 * If so, replace the img src with the correct value for the breakpoint.
		 * 
		 * We can optionally process a smaller set of elements by checking for the
		 * "unloaded" class on the element.  This is useful in the case of infinite scroll
		 * where we don't want to process all the elements on the page each time we add
		 * more content, but only newly added image elements.
		 * 
		 * @param params
		 *     "unloadedOnly" : true = only process elements with "unloaded" class set
		 */
		fillPictures: function fillPictures(params) {
			var unloadedOnly = RivistaUtils.paramExists("unloadedOnly", params) ? params["unloadedOnly"] : false;
			// call tally every time, in case media blocks are added/removed at runtime (<10ms on IE)
			tallyMediaQueries();
			var mediaQuery = getCurrentMediaQuery();

			var $targets = unloadedOnly != false ? rjQuery("div.data-picture-block.unloaded") : rjQuery("div.data-picture-block");

			// Note: getAttribute is faster than jQuery.attr
			$targets.each(function() {
				var match = null;
				rjQuery.each(rjQuery(this).find("div"), function() {
					var dataMedia = this.getAttribute("data-media");
					if (dataMedia == mediaQuery) {
						match = this.getAttribute("data-src");
						return false;
					} else if (dataMedia == null) {
						match = this.getAttribute("data-src");
					}
				});

				// Find any existing img element in the picture element
				var picImg = rjQuery(this).find("img");
				if( match != null && typeof match != "undefined") {
					if(picImg.length == 0) {
						picImg = rjQuery("<img />", {
							src: match,
							alt: rjQuery(this).attr("data-alt")
						});
						rjQuery(this).append(picImg);
					} else {
						picImg.attr('src', match);
					}
				} else if( picImg.length > 0 ) {
					picImg.remove();
				}
			});

			$targets.removeClass("unloaded");
		}


	};

})();



/* Trigger picture replacement on orientationchange or resize.
 * Put within a timeout to prevent IE from going crazy...
 * This time can be relatively long, as this just relates to picture
 * sharpness, and the user probably won't notice this while resizing.
 */
WindowResizeResponder.register({
	"method": PictureFill.fillPictures,
	"when": "ready"
});
