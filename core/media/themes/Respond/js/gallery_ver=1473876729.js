/**
 * gallery.js
 * 
 * Author: Peter Scannell
 * Date: 2013
 * 
 * Handle gallery image manipulation on a page for both slides and
 * thumbnail display.  Take an array of gallery image data and replace
 * source on the page as appropriate.
 * 
 * dependencies:
 *     jQuery
 * 
 */

var GallerySlideshow = (function() {
	var galleries = [];
	
	var classname = {
			"slide": {
				"slide":".slideshow-slide",
				"image":".slideshow-slide-image-image",
				"buttonPrevious":".slideshow-slide-image-left",
				"buttonNext":".slideshow-slide-image-right",
				"displayfields": {
					"description":".slideshow-slide-description",
					"title":".slideshow-slide-title",
					"photocredit":".slideshow-slide-photocredit",
				},
				"pager":".slideshow-slide-pager",
				"pagerItems":".slideshow-slide-pageritems",
				"pagerItem":".slideshow-slide-pageritem",
				"pagerControls":".slideshow-pager-controls",
				"buttonPagePrevious":".previous-page",
				"buttonPageNext":".next-page",
				"pagerItemDivider": ".slideshow-slide-pageritem-divider",
				"thumbnailLink":".thumbnail-link"
			},
			"thumbnail": {
				"thumbnails":".slideshow-thumbnails",
				"thumbnail":".slideshow-thumbnail",
				"pager":".slideshow-gallery-pager",
				"pagerItems":".slideshow-thumbnail-pageritems",
				"pagerItem":".slideshow-thumbnail-pageritem",
				"image":".slideshow-thumbnail-image"
			}
	};

	function populateSlide($gallery) {
		var slide = $gallery.data("galleryImages")[$gallery.data("slideNumber")];
		var $slideElement = $gallery.find(classname.slide.slide);
		$slideElement.find(classname.slide.image).prop("src", slide.image);
		rjQuery.each(classname.slide.displayfields, function(key, element) {
			var $htmlElement = $slideElement.find(element);
			var contents = rjQuery.trim(slide[key]) != "" ? slide[key] : "&nbsp;";	// non-breaking space keeps div height
			$htmlElement.html(contents);
			$gallery.data("galleryContains")[key] ? $htmlElement.show() : $htmlElement.hide();
		});
		$slideElement.removeClass("firstSlide lastSlide")
		if ($gallery.data("slideNumber") == $gallery.data("firstSlide")) {
			$slideElement.addClass("firstSlide");
		} else if ($gallery.data("slideNumber") == $gallery.data("lastSlide")) {
			$slideElement.addClass("lastSlide");
		}
		populateSlidePager($gallery);
	};

	function populateSlidePager($gallery, pageNumber) {
		var numPerPager = calcNumSlidesPerPager($gallery);
		var current = $gallery.data("slideNumber");
		pageNumber = typeof pageNumber != "undefined" ? pageNumber : parseInt((current / numPerPager), 10);
		$gallery.data("displayedPage", pageNumber);
		var slides = $gallery.data("galleryImages");
		var start = pageNumber * numPerPager;
		var end = start + numPerPager;
		if (end > ($gallery.data("lastSlide") + 1)) {
			end = $gallery.data("lastSlide") + 1;
		}
		var dividerHtml = $gallery.data("slidePagerDivider");
		var totalSlides = slides.length;
//		current_item
		var pagerClass = classname.slide.pagerItem.substring(1);

		var html = "";
		var imgTag = $gallery.data("slidePagerHtml").match(/img/i);
		for (var index = start; index < end; index++) {
			var galleryHtml = $gallery.data("slidePagerHtml");
			if (index == current) {
				galleryHtml = galleryHtml
					.replace(pagerClass, pagerClass+" current");
			}
			html += galleryHtml
					.replace(imgTag, imgTag+' slidenum="'+index+'" src="'+slides[index].navimage+'" alt="'+slides[index].title+'" ')
					.replace(dividerHtml, (index+1)+" "+dividerHtml+" "+totalSlides);
		}
		$gallery.find(classname.slide.pagerItems).html(html);

		var slidePager = $gallery.find(classname.slide.pager);
		slidePager.removeClass("first-page last-page");
		pageNumber = pageNumber+1;
		var lastPage = Math.ceil(totalSlides / numPerPager);
		if (pageNumber == 1) {
			slidePager.addClass("first-page");
		} else if (pageNumber == lastPage) {
			slidePager.addClass("last-page");
		}
	};

	function notifySlideChanged($gallery) {
		if ($gallery.data("slideChangeNotify") == "true") {
			rjQuery("body").trigger("changeslide");
		}
	};

	function calcNumSlidesPerPager($gallery) {
		var availWidth = $gallery.find(classname.slide.slide).parent().width() - $gallery.data("controlsWidth");
		var slideWidth = $gallery.data("slideThumbnailWidth");
		var numSlides = parseInt((availWidth / slideWidth), 10);
		numSlides = numSlides < $gallery.data("slidesPerPager") ? numSlides : $gallery.data("slidesPerPager");
		return numSlides;
	};

	function populateThumbnails($gallery) {
		var slides = $gallery.data("galleryImages");
		var start = $gallery.data("thumbnailRange")[0];
		var end = $gallery.data("thumbnailRange")[1];
		var html = "";
		var thumbnailHtml = $gallery.data("thumbnailHtml");
		var imgTag = $gallery.data("thumbnailHtml") .match(/img/i);
		for (var index = start; index < end; index++) {
			html+= thumbnailHtml.replace(imgTag, imgTag+' slidenum="'+index+'" src="'+slides[index].thumbnail+'" alt="'+slides[index].title+'" ');
		}
		$gallery.find(classname.thumbnail.thumbnails).html(html);
		// call GridLayout.layout to fix layout; use window resize startup loop function
		WindowResizeResponder.executeStartupLoop({"method":GridLayout.layout}, 0);
		;
	};

	function showThumbnails($gallery) {
		var slideNum = $gallery.data("slideNumber");
		var numSlides = $gallery.data("galleryImages").length;
		var thumbnailsPerPage = $gallery.data("thumbnailsPerPage");
		if (numSlides > thumbnailsPerPage) {
			if ($gallery.find(classname.thumbnail.pagerItem).length <= 1) {
				populateThumbnailsPager($gallery);
			} else {
				var pageNum = parseInt((slideNum / thumbnailsPerPage), 10) + 1;
				updateThumbnailsPager($gallery, pageNum);
			}
		} else {
			populateThumbnails($gallery);
		}
		$gallery.find(classname.slide.slide).hide();
		$gallery.find(classname.thumbnail.thumbnails).show();
	};

	function populateThumbnailsPager($gallery) {
		var numSlides = $gallery.data("lastSlide") + 1;
		var thumbnailsPerPage = $gallery.data("thumbnailsPerPage");
		var $pager = $gallery.find(classname.thumbnail.pager);
		var $pagerItem = $gallery.find(classname.thumbnail.pagerItem);
		var pagerHtml = $gallery.data("pagerHtml");
		var numPages = parseInt((numSlides / thumbnailsPerPage), 10) + 1;

		var html = "";
		var startSpanTag = pagerHtml.match(/<span>/i);
		var endSpanTag = pagerHtml.match(/<\/span>/i);
		for (var index = 1; index <= numPages; index++) {
			html+= pagerHtml.replace(startSpanTag+endSpanTag, startSpanTag+index+endSpanTag);
		}
		$pagerItem.replaceWith(html);

		var slideNum = $gallery.data("slideNumber");
		var thumbnailsPerPage = $gallery.data("thumbnailsPerPage");
		var pageNum = parseInt((slideNum / thumbnailsPerPage), 10) + 1;
		updateThumbnailsPager($gallery, pageNum);
	};

	function updateThumbnailsPager($gallery, pageNumber) {
		var $pagerItems = $gallery.find(classname.thumbnail.pagerItems).children();
		var thumbnailsPerPage = $gallery.data("thumbnailsPerPage");
		var numSlides = $gallery.data("galleryImages").length;
		var numPages = parseInt((numSlides / thumbnailsPerPage), 10) + 1;
		$pagerItems.removeClass("active disabled");
		$pagerItems.eq(pageNumber).addClass("active");
		if (pageNumber == 1) {
			$pagerItems.filter(".previous").addClass("disabled");
		} else if (pageNumber == numPages) {
			$pagerItems.filter(".next").addClass("disabled");
		}
		var start = (pageNumber - 1) * thumbnailsPerPage;
		var end = pageNumber * thumbnailsPerPage;
		end = end <= numSlides ? end : numSlides;
		$gallery.data("thumbnailRange", [start, end]);
		$gallery.find(classname.thumbnail.pager).show();
		populateThumbnails($gallery);
	};

	function initInteraction($gallery) {
		$gallery.find(classname.slide.buttonPrevious).on("click", function() {
			var slideNum = $gallery.data("slideNumber"); 
			if (slideNum > $gallery.data("firstSlide")) {
				$gallery.data("slideNumber", --slideNum);
				populateSlide($gallery);
				notifySlideChanged($gallery);
			}
			return false;
		});
		$gallery.find(classname.slide.buttonNext).on("click", function() {
			var slideNum = $gallery.data("slideNumber"); 
			if (slideNum < $gallery.data("lastSlide")) {
				$gallery.data("slideNumber", ++slideNum);
				populateSlide($gallery);
				notifySlideChanged($gallery);
			}
			return false;
		});
		$gallery.find(classname.thumbnail.thumbnails).on("click", classname.thumbnail.thumbnail, function() {
			var slideNum = parseInt(rjQuery(this).find("img").attr("slidenum"), 10);
			$gallery.data("slideNumber", slideNum);
			populateSlide($gallery);
			$gallery.find(classname.thumbnail.thumbnails).hide();
			$gallery.find(classname.thumbnail.pager).hide();
			$gallery.find(classname.slide.slide).show();
			$gallery.data("showSlide", true);
			notifySlideChanged($gallery);
			return false;
		});
		$gallery.find(classname.slide.pagerItems).on("click", classname.slide.pagerItem, function() {
			var slideNum = parseInt(rjQuery(this).find("img").attr("slidenum"), 10);
			if (slideNum != $gallery.data("slideNumber")) {
				$gallery.data("slideNumber", slideNum);
				populateSlide($gallery);
				notifySlideChanged($gallery);
			}
			return false;
		});
		$gallery.find(classname.slide.buttonPagePrevious).on("click", function() {
			if (rjQuery(this).closest(classname.slide.pager).hasClass("first-page")) {
				return false;
			}
			var pageNum = $gallery.data("displayedPage") - 1;
			populateSlidePager($gallery, pageNum);
			return false;
		});
		$gallery.find(classname.slide.buttonPageNext).on("click", function() {
			if (rjQuery(this).closest(classname.slide.pager).hasClass("last-page")) {
				return false;
			}
			var pageNum = $gallery.data("displayedPage") + 1;
			populateSlidePager($gallery, pageNum);
			return false;
		});
		$gallery.find(classname.slide.thumbnailLink).on("click", function() {
			showThumbnails($gallery);
			$gallery.data("showSlide", false);
			return false;
		});
		$gallery.find(classname.thumbnail.pagerItems).on("click", "li", function() {
			var $pagerButton = rjQuery(this);
			if (!($pagerButton.hasClass("active") || $pagerButton.hasClass("disabled"))) {
				var pageNumber = $gallery
						.find(classname.thumbnail.pagerItems)
						.children()
						.filter(".active").index();
				if ($pagerButton.hasClass("next")) {
					pageNumber++;
				} else if ($pagerButton.hasClass("previous")) {
					pageNumber--;
				} else {
					pageNumber = $pagerButton.index();
				}
				updateThumbnailsPager($gallery, pageNumber);
			}
			return false;
		});
	};

	return {
		init: function(settings) {
			settings = rjQuery.extend(true, {
				"galleryData": {},						// gallery image objects and metadata
				"thumbnailsPerPage": 16,				// number of thumbnails to display on a page
				"showSlide": "false",					// show a single slide vs thumbnails on start
				"slidesPerPager": 5,					// number of slide images to display in the thumbnail pager
				"slideChangeNotify": "true",			// trigger a 'changeslide' event when a new slide is displayed
				"slidePagerThumbnailWidth": 50			// the width of a pager thumbnail image
			}, settings || {});

			var $gallery = rjQuery("#"+settings.galleryId);
			galleries.push($gallery);

			// store settings
			rjQuery.each(settings, function(key, setting) {
				if (key == "galleryData") {
					$gallery.data("galleryImages", setting["gallery_images"]);
					$gallery.data("galleryMetadata", setting["gallery_metadata"]);
				} else {
					$gallery.data(key, setting);
				}
			});

			$gallery.data("slideNumber", 0);
			$gallery.data("firstSlide", 0);
			$gallery.data("lastSlide", ($gallery.data("galleryImages").length - 1));
			var rangeEnd = $gallery.data("thumbnailsPerPage") <= $gallery.data("galleryImages").length ? $gallery.data("thumbnailsPerPage") : $gallery.data("galleryImages").length;
			$gallery.data("thumbnailRange", [0, rangeEnd]);
			$gallery.data("displayedPage", 0);

			$gallery.data("thumbnailHtml", $gallery.find(classname.thumbnail.thumbnail).outerHTML());
			$gallery.data("slidePagerHtml", $gallery.find(classname.slide.pagerItem).outerHTML());
			$gallery.data("slidePagerDivider", $gallery.find(classname.slide.pagerItemDivider).outerHTML());
			$gallery.data("pagerHtml", $gallery.find(classname.thumbnail.pagerItem).outerHTML());

			var galleryContains = {};
			galleryContains["title"] = $gallery.data("galleryMetadata")["hasCaptions"] == "true";
			galleryContains["photocredit"] = $gallery.data("galleryMetadata")["hasCredits"] == "true";
			galleryContains["description"] = $gallery.data("galleryMetadata")["hasDescriptions"] == "true";
			$gallery.data("galleryContains", galleryContains);

			var slideThumbnailWidth =
				$gallery.data("slidePagerThumbnailWidth") +
				($gallery.find(classname.slide.pagerItem).outerWidth() - $gallery.find(classname.slide.pagerItem).width()) +
				parseInt($gallery.find(classname.slide.pagerItems).css("border-spacing"), 10);
			$gallery.data("slideThumbnailWidth", slideThumbnailWidth);
			var controlsWidth = 0;
			$gallery.find(classname.slide.pagerControls).each(function(index, control) {
				controlsWidth += rjQuery(control).width();
			});
			$gallery.data("controlsWidth", controlsWidth);

			if ($gallery.data("showSlide") == "true") {
				populateSlide($gallery);
				populateSlidePager($gallery);
			} else {
				populateThumbnails($gallery);
				if ($gallery.data("galleryImages").length > $gallery.data("thumbnailsPerPage")) {
					populateThumbnailsPager($gallery);
				}
			}

			initInteraction($gallery);
		},
		
		updateSlidePager: function updateSlidePager() {
			rjQuery(galleries).each(function(index, $gallery) {
				if ($gallery.data("showSlide") == true || $gallery.data("showSlide") =="true") {
					populateSlidePager($gallery);
				}
			});
		}


	};
})();


WindowResizeResponder.register({
	"method": GallerySlideshow.updateSlidePager,
	"when": "load"
});
