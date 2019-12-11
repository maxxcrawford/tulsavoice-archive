/*
 * For doing fancy things with contentitemlists 
 */

var ContentItemListArranger = (function(rjQuery) {

	return {
		/**
		 * Handles showing and hiding of tags based on item width. 
		 * Also removes floating of images where they take up most of the container
		 */
		cropItemTags: function cropItemTags() {
			var $itemTags = rjQuery('.article-tags');

			$itemTags.each( function () {
				$this = rjQuery(this);
				var tagsNextToImage = 1;
				if ($this.parents('.content-item-list.vertical-blurb').length || 	//If we are inside a vertical-blurb list (full-width image)
					$this.parents('.content-item-list.grid').length ||  			//or a grid list (full-width image)
					$this.width() - $this.parents('.article-item').find('.article-image').outerWidth(true) < 100) { //Or the image takes most of its container (100px is arbitrary)
					//The image will be big and the tags and other content go below it so we don't want to consider the image in our width calculations.
					tagsNextToImage = 0; 
					$this.parents('.article-item').find('.article-image').css({"margin-bottom":"6px"});
				} else { //Make sure the image is floating left again in case floating was removed previously
					$this.parents('.article-item').find('.article-image').css({"margin-bottom":"0px"});
				}
				var containerWidth = $this.width() - $this.parents('.article-item').find('.article-image').outerWidth(true) * tagsNextToImage;
				var $tags = $this.find('.article-tag').hide();
				var totalWidth = 0;
				$tags.each( function () {
					$this = rjQuery(this);
					if(totalWidth + $this.outerWidth(true) < containerWidth) { // Can we fit the next category here?
						$this.show();
						totalWidth += $this.outerWidth(true);
					} else { // Nope. We can't. Don't show any more categories.
						totalWidth = containerWidth; 
					}
				});
			});
		},

		/**
		 * Manage article item images when images are positioned on the bottom.
		 * Currently used in:
		 *     contentItemlistGridLayout.js
		 *     ContentItemListSlideshowCarousel.js
		 *     ContentItemListSlideshowFader.js
		 * 
		 * Must use absolute position in order to position images to bottom,
		 * but must reset while resizing a slide.
		 * The caller must call this before and after the resizing process:
		 * before:
		 *     ContentItemListArranger.positionBottomImages(<containerObject>, false, <setItemHeightBool>);
		 * after:
		 *     ContentItemListArranger.positionBottomImages(<containerObject>, true, <setItemHeightBool>);
		 * 
		 * NOTE: css padding of image parent must be specified in itemlist.less to correspond
		 * to padding for article-item, as the article-image in absolute doesn't pay attention to
		 * its article-item padding.
		 * 
		 * @param $container top-level element for article items
		 * @param action
		 *     "set": set image to bottom
		 *     "reset": reset image to defaults
		 * @param setItemHeight set and reset item height; used when caller doesn't set height itself
		 *     true: loop over items, finding the greatest height, then set height of all items
		 *     false: don't set height, done by caller
		 */
		positionBottomImages: function positionBottomImages($container, action, setItemHeight) {
			var positionBottom = (typeof action != "undefined" && action == "set") ? true : false;
			setItemHeight = typeof setItemHeight != "undefined" ? setItemHeight : false;
			var $imageBlocks = $container.find(".image_pos_bottom");
			if ($imageBlocks.length == 0) {
				return;
			}
			var $items = $container.find(".article-item");
			// position image at bottom of item
			if (positionBottom) {
				if (setItemHeight) {	// set height if not set by caller
					var itemHeight = 0;
					$items.each(function(index, item) {
						itemHeight = Math.max(rjQuery(item).height(), itemHeight);
					})
					$items.css({"height":(itemHeight+"px")});
				}
				$imageBlocks.css({"position":"absolute", "bottom":""});
			// reset position of image to default for resizing
			} else {
				if (setItemHeight) {
					$items.css({"height":""})
				}
				$imageBlocks.css({"position":"", "bottom":"auto"});
			}
		}

	};

})(rjQuery);




if(rjQuery('.content-item-list.grid').length) { // Grid resizing prevents the tags from cropping properly. On grid view we need to crop tags after the grid settles down.
	window.setTimeout(function () { ContentItemListArranger.cropItemTags(); }, 1000);
}

WindowResizeResponder.register({
	"method": ContentItemListArranger.cropItemTags,
	"when": "ready"
});

