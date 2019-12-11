/**
 * Class for loading and displaying a gallery using XHR.
 * @author Jeff Fohl
 * @copyright Godengo Inc., 2009
 *
 * * Updated: 2012
 * by Peter Scannell for Godengo-Texterity
 * 
 * DEPENDENCIES:
 * 		jQuery
 * 
 **/

var slideshowGalleryObjects = [];

function SlideshowGallery(galleryContainer, galleryId, options) {
	this.initialize(galleryContainer, galleryId, options);
}

function resizeSlideshowGalleryContents() {
	rjQuery.each(slideshowGalleryObjects, function() {
		this.setGalleryContainerHeight();
		this.setContentContainerHeight();
		this.setNavigationMenu("resize");
	});
}


SlideshowGallery.prototype = {
		initialize: function(galleryContainer, galleryID, options) {
			// parameters. these are the default values.
			this.options = rjQuery.extend({
				increment : 2, // seconds between fades
				fadeSpeed : 0.5, // duration of fade in seconds
				aspectRatio : 1, // aspect ratio (width/height)
				mouseActuation: "click", // type of mouse interaction: "click" or "hover"
				fixNavMenu: false // adjust navigation menu - for horizontal menu only
			}, options || {});

			this.galleryContainer = rjQuery("#"+galleryContainer);

			this.playSpeed = this.options.increment*1000; // time in seconds before start of next fade
			this.fadeSpeed = (this.options.fadeSpeed*1000)/20; // time in seconds divided by the number of fade increments
			this.slideIncrement = null; // holds the setTimeout for the next slide

			// these value initialized in initImages
			this.currentSlide = 0; // the slide that is now visible
			this.nextSlide = 0; // the next slide to be shown
			this.first = 0; // the first slide
			this.last = 0; // the last slide
			this.firstVisibleMenuItem = 0;

			this.play = true; // play or stop
			this.playDirection = "forwards";

			this.initControls();
			this.initMenu();
			this.initContents();
			this.initImages();

			// after creation setup contents
			this.setGalleryContainerHeight();
			this.setContentContainerHeight();
			this.setNavigationMenu("resize");

/* TODO: Make sure that we don't need this with picturefill
			// the following parameter tells us if we are using IE 6,7, or 8 so that we can turn on image cache busting if necessary
			// to avoid Stack overflow bug in IE. See Mantis ticket #23191. - JF
			this.cacheBust = (Prototype.Browser.IE) && (this.slides.length > 11);
			this.randomNumber = '';
*/

			slideshowGalleryObjects.push(this);
		},

		initImages: function() {
			this.galleryImages = this.galleryContainer.find(".galleryImage");
			this.first = 0;
			this.last = this.galleryImages.length - 1;
			this.currentSlide = this.first;
			this.nextSlide = this.first;  // reset in next call
			// setup current slide, slides opacity/xOpacity, slides to hide/show
			this.setCurrentSlideFromNext();
		},

		initMenu: function() {
			this.menuItems = [];
			var galleryMenu = this.galleryContainer.find(".galleryMenu");
			if (galleryMenu.length > 0) {
				this.menuItems = this.galleryContainer.find(".galleryMenuItem");
				this.menuItems.filter(":first").addClass("selected");

				var that = this;
				// default event is click
				if (this.options.mouseActuation == "hover") {
					rjQuery(galleryMenu).on("hover", ".galleryMenuItem", function(event) {
						// inArray gives array position for menu item
						that.playSlide(rjQuery.inArray(this, that.menuItems));
					});
				} else {
					rjQuery(galleryMenu).on("click", ".galleryMenuItem", function(event) {
						// inArray gives array position for menu item
						that.playSlide(rjQuery.inArray(this, that.menuItems));
					});
				}
			}
		},
		
		initContents: function() {
			this.contents = [];
			if (this.galleryContainer.find(".contentContainer").length > 0) {
				this.contents = this.galleryContainer.find(".galleryContent");
				if (rjQuery.support.opacity) {
					this.contents.css({
						"opacity": 0,
						"filter": "alpha(opacity=0)",
						"visibility": "hidden"
					});
					this.contents.filter(":first")
						.addClass("selected")
						.css({
							"opacity": 1,
							"filter": "alpha(opacity=100)",
							"visibility": "visible"
						});
				} else {
					this.hideContent();
					this.showContent(this.first);
				}
			}
		},
		
		initControls: function() {
			var that = this;
			this.controls = [];
			if (this.galleryContainer.find(".controls").length > 0) {
				this.controls = this.galleryContainer.find("button");
				rjQuery(this.controls.siblings(".previous")).on("click", function() {
					that.playPreviousSlide();
				});
				rjQuery(this.controls.siblings(".next")).on("click", function() {
					that.playNextSlide();
				});
				rjQuery(this.controls.siblings(".playpause")).on("click", function() {
					that.playPause();
				});
				this.playPauseButton = rjQuery(this.controls.siblings(".playpause"));
				rjQuery(this.playPauseButton).find(".play").hide();
				rjQuery(this.playPauseButton).find(".pause").show();
				this.play = true; // play or stop
			}
			// enable next/previous buttons for gallery menu
			rjQuery(this.galleryContainer.find(".galleryMenu button.btn.previous")).on("click", function() {
				that.playPreviousSlide();
			});
			rjQuery(this.galleryContainer.find(".galleryMenu button.btn.next")).on("click", function() {
				that.playNextSlide();
			});
			rjQuery(this.galleryContainer.find(".galleryMenuNavigation.previous")).on("click", function() {
				that.playPreviousSlide();
			});
			rjQuery(this.galleryContainer.find(".galleryMenuNavigation.next")).on("click", function() {
				that.playNextSlide();
			});

		},

		hideSlides: function(slideNum) {
			if (typeof slideNum == "undefined") {
				this.galleryImages.hide();
			} else {
				rjQuery(this.galleryImages[slideNum]).hide();
			}
		},

		showSlides: function(slideNum) {
			slideNum = typeof slideNum != "undefined" ? slideNum : 0;
			rjQuery(this.galleryImages[slideNum]).show();
		},
		
		hideContent: function(slideNum) {
			if (this.contents.length > 0) {
				if (typeof slideNum == "undefined") {
					rjQuery(this.contents).css("visibility","hidden");
				} else {
					rjQuery(this.contents[slideNum]).css("visibility","hidden");
				}
			}
		},
		showContent: function(slideNum) {
			if (this.contents.length > 0) {
				slideNum = typeof slideNum != "undefined" ? slideNum : 0;
				rjQuery(this.contents[slideNum]).css("visibility","visible");
			}
		},

		incrementGalleryMenu: function() {
			if (this.menuItems.length > 0) {
				rjQuery(this.menuItems[this.previousSlide]).removeClass("selected");
				rjQuery(this.menuItems[this.currentSlide]).addClass("selected");
			}
		},
		
		incrementContents: function() {
			if (this.contents.length > 0) {
				rjQuery(this.contents[this.previousSlide]).removeClass("selected");
				rjQuery(this.contents[this.currentSlide]).addClass("selected");
			}
		},

		// Gallery xFade function //
		xFade: function() {
			var thisGallery = this;

			// make sure no older fades are hanging around
			for (var index = thisGallery.first; index < thisGallery.last; index++) {
				if (index != thisGallery.currentSlide && index != thisGallery.nextSlide) {
					thisGallery.hideSlides(index);
					thisGallery.hideContent(index);
				}
			}

			var $currentSlide = rjQuery(this.galleryImages[this.currentSlide]);
			var currentOpacity = Math.round(($currentSlide.prop("xOpacity") - 0.05)*100)/100;
			var nextOpacity = Math.round((1 - currentOpacity)*100)/100;

			this.showSlides(this.nextSlide);
			if (rjQuery.support.opacity) {
				this.showContent(this.nextSlide);
			}
			this.setOpacity(this.currentSlide, currentOpacity);
			this.setOpacity(this.nextSlide, nextOpacity);
			$currentSlide.prop("xOpacity", currentOpacity);

			if (currentOpacity <= 0) {
				this.setCurrentSlideFromNext();
				if (this.play === true) {
					this.slideIncrement = window.setTimeout( function(){ thisGallery.xFade() }, this.playSpeed);
				}
			} else {
				this.slideIncrement = window.setTimeout( function(){ thisGallery.xFade() }, this.fadeSpeed);
			}
		},

		// reset xopacity of all slides to 0
		resetxOpacity : function() {
			rjQuery(this.galleryImages).prop("xOpacity", 0);
		},

		setCurrentSlideFromNext : function() {
			var $nextSlide = rjQuery(this.galleryImages[this.nextSlide]);
			this.resetxOpacity();
			$nextSlide.prop("xOpacity", 1);
			this.hideSlides();
			this.showSlides(this.nextSlide);
			this.hideContent(this.currentSlide);
			this.showContent(this.nextSlide);
			this.setOpacity(this.nextSlide, 1);
			this.previousSlide = this.currentSlide;
			this.currentSlide = this.nextSlide;
			this.nextSlide = (this.currentSlide + 1) <= this.last ? (this.currentSlide + 1) : this.first;
			this.incrementContents();
			this.incrementGalleryMenu();
			this.setNavigationMenu("slide");
		},

		// set the opacity of slides //
		setOpacity: function (slideNum, opacity) {
			opacity = typeof opacity != "undefined" ? opacity : 0;
			rjQuery(this.galleryImages[slideNum]).css({
				"opacity": opacity,
				"filter": "alpha(opacity=" + (opacity*100) + ")"
			});
			if (this.contents.length > 0) {
				if (rjQuery.support.opacity) {
					rjQuery(this.contents[slideNum]).css({
						"opacity": opacity,
						"filter": "alpha(opacity=" + (opacity*100) + ")"
					});
				}
			}
		},

		playPreviousSlide: function() {
			window.clearTimeout(this.slideIncrement);
			this.play = false;
			this.playDirection = "backwards";
			if (this.controls.length > 0) {
				rjQuery(this.playPauseButton).find(".pause").hide();
				rjQuery(this.playPauseButton).find(".play").show();
			}
			this.nextSlide = this.currentSlide - 1;
			if (this.nextSlide < 0) {
				this.nextSlide = this.last;
			}
			this.xFade();
		},

		playNextSlide : function() {
			window.clearTimeout(this.slideIncrement);
			this.play = false;
			this.playDirection = "forwards";
			if (this.controls.length > 0) {
				rjQuery(this.playPauseButton).find(".pause").hide();
				rjQuery(this.playPauseButton).find(".play").show();
			}
			this.nextSlide = this.currentSlide + 1;
			if (this.nextSlide >= this.galleryImages.length) {
				this.nextSlide = this.first;
			}
			this.xFade();
		},
		
		playSlide : function(slideNum) {
			slideNum = typeof slideNum != "undefined" ? slideNum : 0;
			this.play = false;
			window.clearTimeout(this.slideIncrement);
			if (this.controls.length > 0) {
				rjQuery(this.playPauseButton).find(".pause").hide();
				rjQuery(this.playPauseButton).find(".play").show();
			}
			this.nextSlide = slideNum;
			if (slideNum == this.currentSlide) {
				this.setCurrentSlideFromNext();
			} else {
				this.xFade();
			}
		},

		playPause : function() {
			if (this.play === true) {
				window.clearTimeout(this.slideIncrement);
				this.play = false;
				this.playDirection = null;
				if (this.controls.length > 0) {
					rjQuery(this.playPauseButton).find(".pause").hide();
					rjQuery(this.playPauseButton).find(".play").show();
				}
			} else {
				window.clearTimeout(this.slideIncrement);
				this.play = true;
				this.playDirection = "forward";
				if (this.controls.length > 0) {
					rjQuery(this.playPauseButton).find(".play").hide();
					rjQuery(this.playPauseButton).find(".pause").show();
				}
				this.xFade();
			}
		},

		setGalleryContainerHeight : function () {
			var imageContainer = this.galleryContainer.find(".imageContainerSpace");
			var galleryContainer = this.galleryContainer.find(".galleryMenuSpace");
			var containerHeight = imageContainer.width() / this.options.aspectRatio;
			imageContainer.css({"min-height":containerHeight});
			galleryContainer.css({"min-height":containerHeight});
		},
		
		setContentContainerHeight : function() {
			if (0 != this.galleryContainer.find(".contentContainerSpace").length) {
				var heights = new Array();
				var galleryContents = this.galleryContainer.find(".galleryContent");
				rjQuery.each(galleryContents,function(key,value) {
					heights.push(rjQuery(value).height());
				});
				var max = Math.max.apply(Math,heights);
				var contentContainer = this.galleryContainer.find(".contentContainerSpace, .contentContainer");
				contentContainer.css({"height":max});
				// special case for sg-splash-right-menu
				if (rjQuery(this.galleryContainer).hasClass("sg-splash-right-menu")) {
					// set the controls to have a bottom value equal to the height of the content container
					var contentContainerSpaceHeight = this.galleryContainer.find(".contentContainerSpace").innerHeight();
					var controls = this.galleryContainer.find(".controls");
					controls.css({"bottom":contentContainerSpaceHeight});
				}
			}
		},

		/**
		 * Setup the navigation menu at the bottom of the slides.
		 * If the space available to the menu is enough for all the menu items,
		 * then show the menu without left and right arrows.
		 * If the space available to the menu is too small for all the menu items,
		 * then show the menu with left and right arrows and truncate the menu
		 * to fit into the available space.
		 * 
		 * If the current menu item is out of the range of the visible menu items,
		 * then set the visible menu items to show the current menu item.
		 * 
		 * @params calledFrom
		 *     "resize" - called as a result of a resize event
		 *     "slide" - called as a result of a change slide action
		 */
		setNavigationMenu : function(calledFrom) {
			if (this.options.fixNavMenu != true) {
				return;
			}
			calledFrom = typeof calledFrom != "undefined" ? calledFrom : "resize";
			var $galleryMenuSpace = this.galleryContainer.find(".galleryMenuSpace");
			var $galleryMenu = this.galleryContainer.find(".galleryMenu");
			if ($galleryMenuSpace.length == 0 ||
					$galleryMenu.length == 0 ||
					this.menuItems.length == 0) {
				return;
			}
			var $nextMenu = $galleryMenuSpace.find(".galleryMenuNavigation.next");
			var $prevMenu = $galleryMenuSpace.find(".galleryMenuNavigation.previous");

			var menuWidth = $galleryMenuSpace.width();
			var menuItemWidth = this.menuItems.outerWidth(true);
			var spaceAvail = parseInt((menuWidth/menuItemWidth), 10);
			if (spaceAvail < this.menuItems.length) {
				$nextMenu.show();
				$prevMenu.show();
				// recalculate spaceAvail with left and right arrows visible
				var navSlidesWidth = $nextMenu.outerWidth(true) + $prevMenu.outerWidth(true);
				spaceAvail = parseInt(((menuWidth - navSlidesWidth)/menuItemWidth), 10);
				var lastVisibleMenuItem = (this.firstVisibleMenuItem + spaceAvail) - 1;
				if (calledFrom == "resize") {
					this.firstVisibleMenuItem = (this.currentSlide - spaceAvail) + 1;
					this.firstVisibleMenuItem = this.firstVisibleMenuItem > this.first ? this.firstVisibleMenuItem : this.first;
				} else if (this.currentSlide < this.firstVisibleMenuItem || this.currentSlide > lastVisibleMenuItem) {
					if (this.playDirection == "forwards") {
						if (this.currentSlide == this.first) {
							this.firstVisibleMenuItem = this.first;
						} else {
							this.firstVisibleMenuItem = (++this.firstVisibleMenuItem < this.last) ? this.firstVisibleMenuItem : this.first;
						}
					} else if (this.playDirection == "backwards") {
						if (this.currentSlide == this.last) {
							this.firstVisibleMenuItem = this.last - (spaceAvail - 1);
						} else {
							this.firstVisibleMenuItem = (--this.firstVisibleMenuItem >= this.first) ? this.firstVisibleMenuItem : this.last;
						}
					}
				}

				var last = this.firstVisibleMenuItem + spaceAvail;
				this.menuItems.hide();
				for (var i = this.firstVisibleMenuItem; i < last; i++) {
					rjQuery(this.menuItems[i]).show();
				}
			} else {
				$nextMenu.hide();
				$prevMenu.hide();
				this.menuItems.show();
			}
		}
		
};



WindowResizeResponder.register({
	"method": resizeSlideshowGalleryContents,
	"when": "load"
});


/*
 * Run when everything has loaded, to start slideshow.
 * Wait for the playSpeed increment before starting
 * the slideshow to give time for the first slide to
 * display.
 * 
 */
rjQuery(window).load(function(event) {
	rjQuery.each(slideshowGalleryObjects, function() {
		var gallery = this;
		window.setTimeout(function() {
			gallery.xFade();
		}, gallery.playSpeed);
	});
});

