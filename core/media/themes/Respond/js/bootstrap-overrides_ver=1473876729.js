/* ************************* START ************************* /
 * 
 * OVERRIDEN FILE: bootstrap-collapse.js
 * 
 * ************************* START **************************/

// override after document ready
rjQuery(document).ready( function() {

	/* =============================================================
	 * Override the Twitter Bootstrap's Collapse module show function
	 * to generalize the active menus.
	 * 
	 * change from:
	 *    actives = this.$parent && this.$parent.find('> .accordion-group > .in')
	 * 
	 * change to:
	 *    actives = this.$parent && this.$parent.find('.in')
	 * 
	 * ============================================================ */
	rjQuery.fn.collapse.Constructor.prototype.show  = function () {
	    var dimension
	    , scroll
	    , actives
	    , hasData

	  if (this.transitioning) return

	  dimension = this.dimension()
	  scroll = rjQuery.camelCase(['scroll', dimension].join('-'))
	  actives = this.$parent && this.$parent.find('.in')	// CHANGED

	  if (actives && actives.length) {
	    hasData = actives.data('collapse')
	    if (hasData && hasData.transitioning) return
	    actives.collapse('hide')
	    hasData || actives.data('collapse', null)
	  }

	  this.$element[dimension](0)
	  this.transition('addClass', rjQuery.Event('show'), 'shown')
	  rjQuery.support.transition && this.$element[dimension](this.$element[0][scroll])
	}


	/* =============================================================
	 * Extends Twitter Bootstrap's Collapse module.
	 *     Override current click functionality.
	 *     Add toggle class switching to the collapse activators.
	 *     Add ignore functionality to selected parts of accordion
	 * ============================================================ */
	!(function ($) {
		var $secondaryButtons = rjQuery(".menu-item-wrapper button");
		var $menuContainers = rjQuery(".menu-container, #sitesearch");

		// remove current functionality
		$(document).off('click.collapse.data-api');

		// add new functionality
		$(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
			// if clicking on an ignore target, just return
			if (rjQuery(e.target).attr("data-target-ignore") == "ignore") {
				return;
			}
			var $this = $(this);
			var href;
			var target = $this.attr('data-target')
					|| e.preventDefault()
					|| (href = $this.attr('href')) 
					&& href.replace(/.*(?=#[^\s]+$)/, ''); //strip for ie7
			var $target = $(target);
			var option = $target.data('collapse') ? 'toggle' : $this.data();

			// MODIFIED bootstrap 2.2.1 functionality
			$this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed');
			// override twitter bootstrap functionality (collapse) to handle weird problem
			// with Chrome on Android phones.
			// Standard .collapse("toggle") makes menu disappear on second appearance
			if ($this.hasClass("menu-collapsed")) {
				$menuContainers.removeClass("in");
			} else {
				$target.collapse(option);
			}

			// Added data-parent functionality
			// check if current menu clicked (clicked on "open" menu)
			// find all menu elements with the same data-parent and remove "open" class
			// then, if new menu clicked, mark it "open"
			// handle sticky menu if necessary
			var mainMenuClicked = $this.hasClass("menu-collapsed");
			var dataParent = $this.attr('data-parent');
			var $menus = rjQuery("*[data-parent='"+dataParent+"']");

			var newState = $this.hasClass("open") ? "closed" : "open";		// check if old/new menu clicked
			$menus.removeClass("open");
			if (newState == "open") {
				$this.addClass('open');
				$target.addClass("in");
			}
			// If one of the main menus is chosen, close all sub-menus
			if (mainMenuClicked) {
				$secondaryButtons.removeClass('open');
				$secondaryButtons.each(function(index, secondaryButton) {
					$($(secondaryButton).attr("data-target")).css("height",0).removeClass("in");
				})
				if (typeof StickyHeader != "undefined" && rjQuery.isFunction(StickyHeader.handleMenuDropdown)) {
					StickyHeader.handleMenuDropdown(newState);
				}
			}
		});
	})(window.rjQuery);


});



/* ************************* END ************************* /
 * 
 * OVERRIDEN FILE: bootstrap-collapse.js
 * 
 * ************************* END **************************/



/* ************************* START ************************* /
 * 
 * EXTENSION OF FILE: bootstrap-dropdown.js
 * 
 * See: https://github.com/twitter/bootstrap/commit/ed74992853054c57f33ef5d21941f0869e287552
 * and: https://github.com/twitter/bootstrap/issues/4550
 * 
 * Extended on 12/12/2012 in order to fix problem of dropdown links not working on touch devices.
 * 
 * ************************* START **************************/

rjQuery(document).ready(function() {
	  rjQuery(document)
	    .on('touchstart.dropdown.data-api', '.dropdown-menu', function (e) {
            try{
                //if the target attribute exists, go to it. 
                if(e.target){
                    document.location.href = e.target;
                }
                e.stopPropagation();
            }
            catch(exception){
                //outputEvent(exception);
            }
        });
});

/* ************************* END ************************* /
 * 
 * OVERRIDEN FILE: bootstrap-dropdown.js
 * 
 * ************************* END **************************/


 /**
 * Function to output an event to the browser as the entire page.
 * This function needs to be used to display to certain browsers
 * such as the Kindle Fire HD which have no logging capability.
 * 
 * @param event
 */
 function outputEvent(event){
     var output = "";
     rjQuery.each(event, function(key, value){
         output += key + ": " + value + "<br />";
     });
     
     document.write(output);
 }


 /* ************************* END ************************* /
  * 
  * OVERRIDEN FUNCTION FROM FILE: bootstrap-tooltip.js
  *     VERSION: bootstrap-tooltip.js v2.2.1
  *     BUILD: twitter-bootstrap-3b3dd3a
  * 
  * ************************* END **************************/
 /**
  * This function overrides the functionality for Tooltip hide
  * in bootstrap-min.js.  It is copied directly from version
  * twitter-bootstrap-3b3dd3a (in source control).  This
  * version corrects an error where the original element to
  * which the tooltip is attached is hidden, along with the tooltip,
  * when the user moves the cursor off the element.
  */
rjQuery.fn.tooltip.Constructor.prototype.hide  = function () {
	var that = this;
	var $tip = rjQuery(this.tip());

	$tip.removeClass('in')

	function removeWithAnimation() {
		var timeout = setTimeout(function () {
			$tip.off(rjQuery.support.transition.end).detach()
		}, 500);

		$tip.one(rjQuery.support.transition.end, function () {
			clearTimeout(timeout)
			$tip.detach()
		});
	};

	rjQuery.support.transition && $tip.hasClass('fade') ?
			removeWithAnimation() :
			$tip.detach();

	return this
}
