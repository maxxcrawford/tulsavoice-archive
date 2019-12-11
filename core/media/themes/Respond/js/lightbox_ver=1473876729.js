/**
 * jQuery lightBox plugin
 * This jQuery plugin was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * 
 * Heavily modified:
 * 		author: Peter Scannell
 * 		date: September 2012
 * 		company: Godengo/Texterity
 * 
 * NOTE: We are doing a BIG hack to detect iOS < 5 and Kindle Fire, then doing something different
 *       when bringing up the lightbox to fix it in position.
 *       This will affect swipe support, when and if it is put in place.  If we do implement swipe
 *       support, the code which binds "touchmove" will need to be modified.
 *  
 *  
 * @name jquery-lightbox-0.5.js
 * @author Leandro Vieira Pinho - http://leandrovieira.com
 * @version 0.5
 * @date April 11, 2008
 * @category jQuery plugin
 * @copyright (c) 2008 Leandro Vieira Pinho (leandrovieira.com)
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/deed.en_US
 * @example Visit http://leandrovieira.com/projects/jquery/lightbox/ for more informations about this jQuery plugin
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function(rjQuery) {
	rjQuery.fn.lightBox = function(settings) {
		// Settings to configure the jQuery lightBox plugin how you like
		settings = rjQuery.extend({
			// Configuration related to overlay
			overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			overlayOpacity:			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
			// Configuration related to navigation
			// REMOVED: Not showing prev/next on image
//			fixedNavigation:		false,		// (boolean) Boolean that informs if the navigation (next and prev button) will be fixed or not in the interface.
			// Configuration related to images
			imageLoading:			'/core/media/images/lightbox-ico-loading.gif',		// (string) Path and the name of the loading icon
			imageBtnPrev:			'/core/media/images/lightbox-btn-prev.gif',			// (string) Path and the name of the prev button image
			imageBtnNext:			'/core/media/images/lightbox-btn-next.gif',			// (string) Path and the name of the next button image
			imageBtnClose:			'/core/media/images/lightbox-btn-close.gif',		// (string) Path and the name of the close btn
			imageBlank:				'/core/media/images/lightbox-blank.gif',			// (string) Path and the name of a blank image (one pixel)
			defaultImageWidth:			740,			// (integer) default width to resize image container
			defaultImageHeight:			560,			// (integer) default height to resize image container
			// Configuration related to container image box
			containerBorderSize:	10,			// (integer) If you adjust the padding in the CSS for the container, #lightbox-container-image-box, you will need to update this value
			containerResizeSpeed:	400,		// (integer) Specify the resize duration of container image. These number are miliseconds. 400 is default.
			// Choose to show captions by default or not
			defaultShowCaptions: 	true, 	
			// Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
//			txtImage:				'Image',	// (string) Specify text "Image"
//			txtOf:					'of',		// (string) Specify text "of"
			// Configuration related to keyboard navigation
			keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery lightBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			keyToPrev:				'p',		// (string) (p = previous) Letter to show the previous image
			keyToNext:				'n',		// (string) (n = next) Letter to show the next image.
			// Don?t alter these variables in any way
			imageArray:				[],
			activeImage:			0
		},settings);
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
		// Creating show captions variable from setting
		var showCaptionText = settings.defaultShowCaptions;
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		};
		/**
		 * Start the jQuery lightBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			rjQuery('embed, object, select').css({ 'visibility' : 'hidden' });
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			// Unset total images in imageArray
			settings.imageArray.length = 0;
			// Unset image active information
			settings.activeImage = 0;
			// We have an image set? Or just an image? Let?s see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings.imageArray.push(new Array(
						jQueryMatchedObj[0].getAttribute('href')
						, jQueryMatchedObj[0].getAttribute('title')
						, jQueryMatchedObj[0].getAttribute('description')
						, jQueryMatchedObj[0].getAttribute('photo_credit')
					));
			} else {
				// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the images references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings.imageArray.push(new Array(
						jQueryMatchedObj[i].getAttribute('href')
						, jQueryMatchedObj[i].getAttribute('title')
						, jQueryMatchedObj[i].getAttribute('description')
						, jQueryMatchedObj[i].getAttribute('photo_credit')
					));
				}
			}
			while ( settings.imageArray[settings.activeImage][0] != objClicked.getAttribute('href') ) {
				settings.activeImage++;
			}
			// Call the function that prepares image exibition
			_set_image_to_view();
			if (___isFixedUnsupported()) {
				rjQuery(document).bind("touchmove", function(event) {
					event.preventDefault();
				});
			}
		};

		function _set_interface() {
			var arrPageSizes = ___getPageSize();
			var arrPageScroll = ___getPageScroll();
			var highestZIndex = ___getHighestZIndex();

			rjQuery('#jquery-overlay').css({
				"background-color":	settings.overlayBgColor,
				"opacity":			settings.overlayOpacity,
				"width":			arrPageSizes[0],
				"height":			arrPageSizes[1],
				"z-index":			(highestZIndex + 1)
			}).fadeIn();
			rjQuery('#jquery-lightbox-background').css({
				"z-index":	(highestZIndex + 2)
			});
			rjQuery('#jquery-lightbox').show();

			// Close from overlay or background
			rjQuery('#jquery-overlay,#jquery-lightbox-background').click(function(event) {
				if (event.target == this) {
					_finish();
					return false;
				}
			});
			// Assign the _finish function to lightbox-loading-link and lightbox-secNav-btnClose objects
			rjQuery('#lightbox-loading-link,#lightbox-secNav-btnClose').click(function() {
				_finish();
				return false;
			});

			WindowResizeResponder.register({
				"method": function() {
					var arrPageSizes = ___getPageSize();
					var arrPageScroll = ___getPageScroll();
					rjQuery('#jquery-overlay').css({
						"width": arrPageSizes[0],
						"height": arrPageSizes[1]
					});
					_resize_container_image_box(rjQuery("#lightbox-image").width(), rjQuery("#lightbox-image").height());
				},
				"callerClass": "lightBox",
				"when": "ready"
			});
		};

		/**
		 * Prepares image exibition; doing a image?s preloader to calculate it?s size
		 *
		 */
		function _set_image_to_view() { // show the loading
			// Show the loading
			rjQuery('#lightbox-loading').show();
			// Image preload process
			var objImagePreloader = new Image();
			objImagePreloader.onload = function() {
				rjQuery('#lightbox-image').attr('src',settings.imageArray[settings.activeImage][0]);
				// Perfomance an effect in the image container resizing it
				_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);
				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			};
			objImagePreloader.src = settings.imageArray[settings.activeImage][0];
		};

		/**
		 * Perfomance an effect in the image container resizing it
		 *
		 * @param integer intImageWidth The image's width that will be shown
		 * @param integer intImageHeight The image's height that will be shown
		 */
		function _resize_container_image_box(intImageWidth,intImageHeight) {
			// get window height and width
			var arrPageSizes = ___getPageSize();
			// Get current width and height
			var intCurrentWidth = rjQuery('#lightbox-container-image-box').width();
			var intCurrentHeight = rjQuery('#lightbox-container-image-box').height();
			// Get the width and height of the selected image plus the padding
			var intWidth = (intImageWidth + (settings.containerBorderSize * 2)); // Plus the image?s width and the left and right padding value
			var intHeight = (intImageHeight + (settings.containerBorderSize * 2)); // Plus the image?s height and the left and right padding value
			// Diferences
			var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;

			var $imageContainer = rjQuery('#lightbox-container-image');
			var intVerticalPadding = $imageContainer.outerHeight() - $imageContainer.height();
			var intHorizontalPadding = $imageContainer.outerWidth() - $imageContainer.width();

			var navHeight = rjQuery('#lightbox-secNav').outerHeight(true);
			var intPageWidth = arrPageSizes[2];
			var intWidth = settings.defaultImageWidth;
			if (settings.defaultImageWidth > intPageWidth) {
				intWidth = intPageWidth;
			}
			var intPageHeight = arrPageSizes[3] - navHeight;
			var intHeight = settings.defaultImageHeight;
			if (settings.defaultImageHeight > intPageHeight) {
				intHeight = intPageHeight;
			}

			// Perfomance the effect
			rjQuery('#lightbox-container-image').animate({ width: (intWidth-intHorizontalPadding), height: (intHeight-intVerticalPadding) },settings.containerResizeSpeed,function() { _show_image(); });
			rjQuery('#lightbox-container-image-box').width(intWidth).height(intHeight);
			rjQuery('#lightbox-nav').width(intWidth);
			rjQuery('#jquery-lightbox').width(intWidth).height(intHeight+navHeight);
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( rjQuery.browser.msie ) {
					___pause(250);
				} else {
					___pause(100);	
				}
			}
			// vertically center lightbox in window
			var $lightboxBackground = rjQuery('#jquery-lightbox-background');
			var boxTop = (arrPageSizes[3] - $lightboxBackground.height())/2;
			boxTop = (boxTop > 0) ? boxTop : 0;
			// position fixed not supported, add document scroll and use position: absolute
			if (___isFixedUnsupported()) {
				boxTop += rjQuery(document).scrollTop();
				$lightboxBackground.css({
					"position": "absolute"
				});
			}
			$lightboxBackground.css({
				"top":	boxTop
			});
			_vertical_center_image();
		};
		/**
		 * Show the prepared image
		 *
		 */
		function _show_image() {
			rjQuery('#lightbox-loading').hide();
			rjQuery('#lightbox-image').fadeIn(function() {
				_show_image_data();
				_set_navigation();
				_vertical_center_image();
			});
			_preload_neighbor_images();
		};
		/**
		 * Show the image information
		 *
		 */
		function _show_image_data() {
			if (showCaptionText==true) {
				rjQuery('#lightbox-image-details').fadeIn("fast");
			}
			rjQuery('#lightbox-container-image-data-box').slideDown('fast');
			rjQuery('#lightbox-image-details-caption').hide();
			if ( settings.imageArray[settings.activeImage][1] ) {
				rjQuery('#lightbox-image-details-caption').html(settings.imageArray[settings.activeImage][1]).show();
			}
			rjQuery('#lightbox-image-details-description').hide();
			if ( settings.imageArray[settings.activeImage][2] ) {
				rjQuery('#lightbox-image-details-description').html(settings.imageArray[settings.activeImage][2]).show();
			}
			rjQuery('#lightbox-image-details-photo-credit').hide();
			if ( settings.imageArray[settings.activeImage][3] ) {
				rjQuery('#lightbox-image-details-photo-credit').html(settings.imageArray[settings.activeImage][3]).show();
			}
			// If we have a image set, display 'Image X of X'
			if ( settings.imageArray.length > 1 ) {
				rjQuery('#lightbox-image-details-currentNumber-imageNumber').html(settings.activeImage + 1);
				rjQuery('#lightbox-image-details-currentNumber-totalImages').html(settings.imageArray.length);
				rjQuery('#lightbox-image-details-currentNumber').show();
//				rjQuery('#lightbox-image-details-currentNumber').html(settings.txtImage + ' ' + ( settings.activeImage + 1 ) + ' ' + settings.txtOf + ' ' + settings.imageArray.length).show();
			} else {
				rjQuery('#lightbox-image-details-currentNumber').hide();
			}
		};
		
		function _vertical_center_image() {
			// vertically center image
			var imageTop = (rjQuery('#lightbox-container-image').height() - rjQuery('#lightbox-image').height())/2;
			imageTop = (imageTop > 0) ? imageTop : 0;
			rjQuery('#lightbox-image').css({
				"top": imageTop
			});
		};

		/**
		 * Display the button navigations
		 *
		 */
		function _set_navigation() {
			rjQuery('#jquery-lightbox-background,#lightbox-nav').show();
			// first

			// Instead to define this configuration in CSS file, we define here. And it?s need to IE. Just.
			rjQuery('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
			
			// Show the prev button, if not the first image in set
			if ( settings.activeImage > 0 ) {
				rjQuery('#lightbox-nav-btnPrev').show();
				rjQuery('#lightbox-nav-bottom-btnPrev').removeClass("grayed-out");
				rjQuery('#lightbox-nav-btnPrev,#lightbox-nav-bottom-btnPrev')
				.unbind()
				.bind('click',function() {
					if (settings.activeImage > 0) {
						settings.activeImage = settings.activeImage - 1;
						_set_image_to_view();
					}
					return false;
				});
			} else {
				rjQuery('#lightbox-nav-btnPrev').hide();
				rjQuery('#lightbox-nav-bottom-btnPrev').addClass("grayed-out");
			}

			// Show the next button, if not the last image in set
			var lastImage = settings.imageArray.length - 1;
			if ( settings.activeImage < lastImage ) {
				rjQuery('#lightbox-nav-btnNext').show();
				rjQuery('#lightbox-nav-bottom-btnNext').removeClass("grayed-out");
				rjQuery('#lightbox-nav-btnNext,#lightbox-nav-bottom-btnNext')
				.unbind()
				.bind('click',function() {
					if (settings.activeImage < lastImage) {
						settings.activeImage = settings.activeImage + 1;
						_set_image_to_view();
					}
					return false;
				});
			} else {
				rjQuery('#lightbox-nav-btnNext').hide();
				rjQuery('#lightbox-nav-bottom-btnNext').addClass("grayed-out");
			}

			// Show the Caption button
			var showCaption = true;
			if (showCaption) {
				if (showCaptionText == true) {
					rjQuery('#lightbox-caption-show-button').hide();
					rjQuery('#lightbox-caption-hide-button').show();
				}
				else {
					rjQuery('#lightbox-caption-hide-button').hide();
					rjQuery('#lightbox-caption-show-button').show();
				}
				rjQuery('#lightbox-nav-caption').show();
				rjQuery('#lightbox-nav-caption')
					.unbind()
					.bind('click',function() {
						var $captionDetails = rjQuery('#lightbox-image-details');
						if ($captionDetails.is(':visible')) {
							rjQuery('#lightbox-image-details').fadeOut("fast");
							rjQuery('#lightbox-caption-hide-button').hide();
							rjQuery('#lightbox-caption-show-button').show();
							showCaptionText=false;
						} else {
							rjQuery('#lightbox-image-details').fadeIn("fast");
							rjQuery('#lightbox-caption-show-button').hide();
							rjQuery('#lightbox-caption-hide-button').show();
							showCaptionText=true;
						}
						return false;
					});
			} else {
				rjQuery('#lightbox-nav-caption').hide();
			}

			// Enable keyboard navigation
			_enable_keyboard_navigation();
		}
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			rjQuery(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}
		/**
		 * Disable the support to keyboard navigation
		 *
		 */
		function _disable_keyboard_navigation() {
			rjQuery(document).unbind();
		}
		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if ( objEvent == null ) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			} else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			// Verify the keys to close the ligthBox
			if ( ( key == settings.keyToClose ) || ( key == 'x' ) || ( keycode == escapeKey ) ) {
				_finish();
			}
			// Verify the key to show the previous image
			if ( ( key == settings.keyToPrev ) || ( keycode == 37 ) ) {
				// If we?re not showing the first image, call the previous
				if ( settings.activeImage != 0 ) {
					settings.activeImage = settings.activeImage - 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
			// Verify the key to show the next image
			if ( ( key == settings.keyToNext ) || ( keycode == 39 ) ) {
				// If we?re not showing the last image, call the next
				if ( settings.activeImage != ( settings.imageArray.length - 1 ) ) {
					settings.activeImage = settings.activeImage + 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
		}
		/**
		 * Preload prev and next images being showed
		 *
		 */
		function _preload_neighbor_images() {
			if ( (settings.imageArray.length -1) > settings.activeImage ) {
				objNext = new Image();
				objNext.src = settings.imageArray[settings.activeImage + 1][0];
			}
			if ( settings.activeImage > 0 ) {
				objPrev = new Image();
				objPrev.src = settings.imageArray[settings.activeImage -1][0];
			}
		}
		/**
		 * Remove jQuery lightBox plugin HTML markup
		 *
		 */
		function _finish() {
			rjQuery('#jquery-lightbox-background,#jquery-lightbox').hide();

			rjQuery('#jquery-overlay').fadeOut(function() { rjQuery('#jquery-overlay').hide(); });
			rjQuery('#jquery-overlay,#jquery-lightbox-background,#jquery-lightbox').css({
				"z-index":	""
			});
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			rjQuery('embed, object, select').css({ 'visibility' : 'visible' });
			if (___isFixedUnsupported()) {
				rjQuery(document).unbind("touchmove");
			}
		}
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
				pageWidth = xScroll;		
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		};
		/**
		 / THIRD FUNCTION
		 * getPageScroll() by quirksmode.com
		 *
		 * @return Array Return an array with x,y page scroll values.
		 */
		function ___getPageScroll() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		};
		 /**
		  * Stop the code execution from a escified time in milisecond
		  *
		  */
		 function ___pause(ms) {
			var date = new Date(); 
			curDate = null;
			do { var curDate = new Date(); }
			while ( curDate - date < ms);
		 };

		/**
		 * Loop through all the elements on the page and return the highest z-index
		 * 
		 * @return zindex - highest z-index value of all elements on page
		 */
		function ___getHighestZIndex() {
			var elements = rjQuery("*");
			var zindex = 0;
			rjQuery.each(elements, function(index, element) {
				var indexCurrent = parseInt(rjQuery(element).css("z-index"), 10);
				zindex = (indexCurrent > zindex) ? indexCurrent : zindex;
			});
			return zindex;
		};

		/**
		 * Checking specifically for Kindle Fire browser for iOS < 5 to check a
		 * couple of mobile browser instances where the position:fixed property
		 * is known to be un-supported.
		 */
		function ___isFixedUnsupported() {
			var under5 = false;
			if(/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) { 
				under5 = ((/OS [2-4]_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) ||
						(/CPU like Mac OS X/i.test(navigator.userAgent)));
			}
			var isKindle = /Silk/i.test(navigator.userAgent.toLowerCase());
			return under5 || isKindle;
		};



		 // Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
})(rjQuery); // Call and execute the function immediately passing the jQuery object

rjQuery(document).ready(function() {
//	rjQuery('a[rel=lightbox]').lightBox();
	var galleries = rjQuery(".lightbox_gallery");
	rjQuery.each(galleries, function() {
		rjQuery(this).find("a[rel=lightbox]").lightBox();
	});
});