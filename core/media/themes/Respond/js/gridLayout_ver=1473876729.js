//cvar to let infinite scrollling know that there is a grid on the page.
var contains_grid = true;
/**
 * gridLayout.js
 * 
 * Author: Peter Scannell
 * Date: September 2012
 * 
 * Helper routines for the grid layout modules.
 *	 articlelist.grid
 *	 gallerylist.grid
 * 
 */

var GridLayout = (function() {
	var gridModules = [];	// array of grids on the page
	var mediaQueries = [	// list of media queries we pay attention to here, in order of checking
			["320", "(max-width: 320px)"],
			["480", "(min-width: 321px) and (max-width: 480px)"],
			["767", "(min-width: 481px) and (max-width: 767px)"],
			["979", "(min-width: 768px) and (max-width: 979px)"],
			["980", "(min-width: 980px)"]
		];

	/**
	 * Given the number of slides to display in a row, calculate
	 * the slide and margin width in percentages.
	 * 
	 * The slide width is recalculated whenever the number of slides across
	 * changes in the grid.  Slides are space filling, so the width
	 * is set in % to allow the browser to fill the grid automatically.
	 * Width is actually the outerWidth of the slide (including both
	 * the padding and border), since box-sizing: border-box is set
	 * in the stylesheet.
	 * 
	 * The gutter between slides is set in the stylesheet, but is also
	 * converted to % to allow the browser to resize everything.
	 * 
	 * @param $gridModule the grid module element
	 * @param numSlides number of slides in a row
	 */
	function setSlideWidth($gridModule, numSlides) {
		var $slides = $gridModule.find($gridModule.data("slideName"));
		var $slidesParent = $slides.parent();
		$slidesParent
			.removeClass("row_"+$gridModule.data("numSlides"))
			.addClass("row_"+numSlides);
		if ($gridModule.data("autoWidth")) {
			var minWidth = ($gridModule.data("slideWidthFull") * numSlides) - $gridModule.data("slideMarginWidth");
			var slideWidth = ($gridModule.data("slideWidthMin") / minWidth) * 100;
			var slideMarginRight = ($gridModule.data("slideMarginWidth") / minWidth) * 100;
			var slideMarginBottom = ($gridModule.data("slideMarginHeight") / minWidth) * 100;
		} else {
			var parentWidth = $slidesParent.innerWidth();
			var availableWidth = parentWidth - ($gridModule.data("slideMarginWidth") * (numSlides - 1));
			slideWidth = ((availableWidth / numSlides) / parentWidth) * 100;
			slideMarginRight = ($gridModule.data("slideMarginWidth") / parentWidth) * 100;
			slideMarginBottom =  ($gridModule.data("slideMarginHeight") / parentWidth) * 100;
		}
		$slides.not(".inline-module").css({
			"width": slideWidth + "%",
			"margin-left": "0px",
			"margin-right": slideMarginRight + "%",
			"margin-bottom": slideMarginBottom + "%"
		});
		// set margin for last slide in each row
		
		var offset = 1;

		//loop through each slide
		$slides.each(function(){
			//if it has a class of "inline-module",
			//then we have encountered a module that would mess up the grid layout
			if(rjQuery(this).hasClass("inline-module")){
				//add a 1 to the offset
				offset += 1;
			}
			//otherwise, if this is the rightmost item in the grid
			else if((rjQuery(this).index() + offset) % numSlides == 0){
				// change the marging
				rjQuery(this).css("margin-right", "0");
			}
		});

		$gridModule.data("numSlides", numSlides);
	};

	/**
	 * Calculate the number of slides to automatically place in a row
	 * in the grid, based on the slide width set in the admin panel.
	 * 
	 * Call setSlideWidth to calculate a slide's size based on the number
	 * of slides that should fit in a row.
	 * 
	 * @param $gridModule the grid module element
	 */
	function setAutoSlideWidth($gridModule) {
		var $slides = $gridModule.find($gridModule.data("slideName")).not(".inline-module");
		var $slidesParent = $slides.parent();
		// subtract 1 margin width for last slides right margin
		var numSlides = Math.floor(($slidesParent.width() - $gridModule.data("slideMarginWidth")) / $gridModule.data("slideWidthFull"));
		if (numSlides > $slides.length) {
			numSlides = $slides.length;
		}
		if (numSlides > 0) {
			setSlideWidth($gridModule, numSlides);
		}
	};

	/**
	 * Depending on the media breakpoint, determine the value set in
	 * the admin pane for that particular breakpoint.
	 * 
	 * Call setSlideWidth to calculate a slide's size based on the number
	 * of slides that should fit in a row.
	 * 
	 * @param $gridModule the grid module element
	 */
	function setBreakpointSlideWidth($gridModule) {
		var breakpointValues = $gridModule.data("gridBreakPointValues");
		var currentMediaQuery = "980";		// default, just in case
		rjQuery.each(mediaQueries, function(index, query) {
			if (matchMedia && matchMedia(query[1]).matches) {
				currentMediaQuery = query[0];
				return false;
			}
		});
		var numSlides = breakpointValues["default"];
		if (breakpointValues[currentMediaQuery] > 0) {
			numSlides = breakpointValues[currentMediaQuery];
		}
		var $slides = $gridModule.find($gridModule.data("slideName")).not(".inline-module");
		if (numSlides > $slides.length) {
			numSlides = $slides.length;
		}
		if (numSlides > 0) {
			setSlideWidth($gridModule, numSlides);
		}
	};

	/**
	 * Set the slide height each time the browser is resized
	 * or the orientation is changed.
	 * This must be set each time, as the slides are space filling
	 * and the height of a slide will change each time the slide
	 * resizes to fill the available space.
	 * 
	 * Note that this method can handle both absolute and relative
	 * positioning of text content within a slide.
	 * 
	 * NOTE: doneResizing and lastHeight parameters are to handle IE8
	 *       resize bug (throws resize on element resize).
	 * 
	 * @param $gridModule the grid module element
	 */
	function setSlideHeight($gridModule) {
		var $slides = $gridModule.find($gridModule.data("slideName")).not(".inline-module");
		$slides.css("height", "auto");
		var $content = $gridModule.data("slideContent");
		var oldPositionSetting = $content.css("position");
		$content.css("position", "relative");
		var $slideGroups = {};
		$slides.each(function(index, slide) {
			//add these to the $slideGroups array
			var row = Math.floor(index / $gridModule.data("numSlides"));
			if(!$slideGroups[row]){
				$slideGroups[row] = [];
			}
			$slideGroups[row].push(slide);
		});

		var totalSlideHeight = 0;
		//loop through the slide groups
		rjQuery.each($slideGroups, function(index, slide_row){
			var maxHeight = 0;
			//loop through each item within the group, finding the largest
			rjQuery.each(slide_row, function(index2, single_slide){
				//if the height of this slide is larger than the stored height,
				//set the stored height to this slides height
				var $single_slide = rjQuery(single_slide)
				if (maxHeight < $single_slide.height()) {
					maxHeight = $single_slide.height();
				}
			});
			rjQuery(slide_row).height(maxHeight);
			totalSlideHeight += maxHeight;
		});

		//set the content position back to what it was before we changed it to relative
		$content.css("position", oldPositionSetting);

		return totalSlideHeight;
	};


	return {

		/**
		 * Called on each resize/orientationchange.
		 * Calls methods to set individual slide widths
		 * and height.
		 * 
		 * Since this operates on a grid module that is part of a
		 * set of grid modules that are added to on a document.ready call,
		 * and they might not be ready when WindowResizeResponder does its
		 * initial calls on document.ready, we must pass the grid module
		 * that we want to work with back from WindowResizeResponder.
		 * WindowResizeResponder, in turn, gets the list of modules from
		 * the getGridModules function.
		 * 
		 * Note: setAutoSlideWidth must be called before setSlideHeight
		 * 
		 * @param params parameters containing the specific module to resize
		 */
		layout: function layout(params) {
			if (typeof params.element != "undefined" && params.element != null) {
				var $gridModule = params.element;
			} else {
				return;
			}

			if ($gridModule.data("autoWidth")) {
				setAutoSlideWidth($gridModule);
			} else {
				setBreakpointSlideWidth($gridModule);
			}
			var returnValue = setSlideHeight($gridModule);

			return returnValue;
		},

		/**
		 * Show hidden content when WindowResizeResponder startup loop
		 * is done initial resizing content.
		 * 
		 * @param params parameters containing the specific module to show
		 */
		showContent: function showContent(params) {
			if (typeof params.element != "undefined" && params.element != null) {
				var $gridModule = rjQuery(params.element);
				if (!$gridModule.hasClass("content-closed")) {
					return;
				}
			} else {
				return;
			}

			// setup for animation; set starting height and opacity
			$gridModule.css({
				"height": $gridModule.height()+"px",
				"opacity": 0.75
			});
			var animateTime = 300;
			$gridModule.removeClass("content-closed");
			$gridModule.animate({
				"opacity": 1,
				height: "auto"
			}, 300, function() {
				// clear parameters to defaults
				$gridModule.css({
					"height": "",
					"opacity":""
				});
			});

		},

		getGridModules: function getGridModules() {
			return gridModules;
		},

		/**
		 * Initialize the GridModule and store the grid element.
		 * Also store some module specific data in the grid element
		 * that will be re-used by height and width functions.
		 */
		init: function(settings) {
			settings = rjQuery.extend({
				moduleClassName: ".grid",	// module class name
				slide: ".item",				// class name for individual slide
				image: ".image",			// class name for slide image
				content: ".content",		// class name for content
				overrideAutoWidth: "false",	// override automatic width setting
				gridBreakpointValues: {		// if automatic width is overridden, values for each breakpoint
					"default": 3,
					"980": 0,
					"979": 0,
					"767": 0,
					"480": 0,
					"320": 0},
				minimumNumSlides: 1,		// if 0, "", or text specified, this is the absolute minimum number
				slideImageWidth: 110		// width of image, used to determine minimum width of slide
			}, settings || {});

			var $gridModule = rjQuery("#" + settings.moduleId);
			gridModules.push($gridModule);

			var $slides = $gridModule.find(settings.slide);
			var $slide = $gridModule.find(settings.slide).eq(0);
			var $slideImage =  $slide.find(settings.image);
			$gridModule.data("slideName", settings.slide);
			$gridModule.data("slideContent", $slides.find(settings.content));
			$gridModule.data("slideMarginWidth", ($slide.outerWidth(true) - $slide.outerWidth()));
			$gridModule.data("slideMarginHeight", ($slide.outerHeight(true) - $slide.outerHeight()));
			// constrain slide width to a minimum of 20px
			var minWidth = settings.slideImageWidth >= 20 ? settings.slideImageWidth : 20;
			if ($slide.length > 0 && $slideImage.length > 0) {
				$gridModule.data("slideWidthMin", minWidth
						+ $slide.edge("horizontal", false)
						+ $slideImage.edge("horizontal", false));
			} else {
				$gridModule.data("slideWidthMin", minWidth);
			}
			$gridModule.data("slideWidthFull", ($gridModule.data("slideWidthMin") + $gridModule.data("slideMarginWidth")));
			$gridModule.data("autoWidth", (settings.overrideAutoWidth == false || settings.overrideAutoWidth == "false"));

			// guard against non-numeric input
			rjQuery.each(settings.gridBreakpointValues, function(key, value) {
				settings.gridBreakpointValues[key] = parseInt(value, 10);
			});
			// if default is 0 or less, then constrain to minimum
			var minNum = parseInt(settings.minimumNumSlides, 10) > 0 ? parseInt(settings.minimumNumSlides, 10) : 1;
			settings.gridBreakpointValues["default"] = settings.gridBreakpointValues["default"] > 0 ? settings.gridBreakpointValues["default"] : minNum;
			$gridModule.data("gridBreakPointValues", settings.gridBreakpointValues);
		}

	};
	
})();


WindowResizeResponder.register({
	"method": GridLayout.layout,
	"getElements": GridLayout.getGridModules,
	"when": "ready",
	"startupLoop": true,
	"startupCallback": GridLayout.showContent,
	"startupCallbackWhen": "middle"
});

