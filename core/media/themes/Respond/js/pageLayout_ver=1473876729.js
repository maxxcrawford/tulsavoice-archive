/**
 * pageLayout.js
 * 
 * Author: Peter Scannell
 * Date: September 2012
 * 
 * Helper routines for the page layout templates.
 * 
 */

var PageLayout = (function() {
	var lastHeight = 0;
	var newHeight = -1;
	var doExtraCheck = true; 

	return {

		/**
		 * At startup, call to update the container minimum height.
		 * Since we are using pictureFill, images will not be loaded
		 * at startup, but will populate some time after the page is
		 * loaded.
		 * Continue checking every 1 second until height stabilizes.
		 * Add a final check after 2 seconds to ensure height has
		 * stabilized.  if height has changed, call again.
		 * 
		 */
		checkColumnHeights: function checkColumnHeights() {
			newHeight = rjQuery("body").height();
			if (0 != rjQuery("#landing-container").length) {
				PageLayout.updateLandingPageColumnHeight();
			}
			if (0 != rjQuery("#publication-container").length) {
				PageLayout.updatePublicationPageColumnHeight();
			}
			if (0 != rjQuery("#index-container").length) {
				PageLayout.updateIndexPageColumnHeight();
			}
			if (0 != rjQuery("#article-container").length) {
				PageLayout.updateArticlePageColumnHeight();
			}
			if (0 != rjQuery("#issue-container").length) {
				PageLayout.updateIssuePageColumnHeight();
			}
			if (0 != rjQuery(".complex-module-container").length) {
				PageLayout.updateComplexModuleColumnHeight();
			}

			if (lastHeight != newHeight) {
				doExtraCheck = true;
				lastHeight = newHeight;
				window.setTimeout(function() {
					PageLayout.checkColumnHeights();
				}, 1000);
			} else if (doExtraCheck) {
				doExtraCheck = false;
				window.setTimeout(function() {
					PageLayout.checkColumnHeights();
				}, 2000);
			}
		},

		/**
		 * Set the container minimum height based on the right column container
		 * height.
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of the right container as the content is
		 * re-arranged.
		 * Currently deprecated.
		 */
		
		updatePublicationContainerHeight: function updatePublicationContainerHeight() {
			var minHeight = rjQuery("#publication-container .column-right").outerHeight();
			rjQuery("#publication-container .publication-columns-container")
				.css({"min-height":minHeight});
		},
		
		/**
		 * Even out the columns in publication.tpl
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updatePublicationPageColumnHeight: function updatePublicationPageColumnHeight() {
			var windowWidth = rjQuery(window).width();
			var heights = new Array();
			var max;
			var pageBodyHeight;
			var columns;
			// always reset the height of each column when something changes
			columns = rjQuery("#publication-container .column-left, #publication-container .column-middle, #publication-container .column-right, #publication-container .columns");
			rjQuery.each(columns,function(key,value) {
				rjQuery(value).css({"min-height":0});
			});
			
			if (0 != rjQuery("#publication-container .top-left-middle-right").length) {
				if (windowWidth >= 980) {
					/* make right height equal to top + middle/right */
					pageBodyHeight = rjQuery("#publication-container .publication-columns-container").height();
					rjQuery("#publication-container .columns-container > .column-right").css({"min-height":pageBodyHeight});
					rjQuery("#publication-container .columns-container > .columns").css({"min-height":pageBodyHeight});
					/* make left and middle equal height */
					heights.push(rjQuery("#publication-container .column-left").height());
					heights.push(rjQuery("#publication-container .column-middle").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .column-left").css({"min-height":max});
					rjQuery("#publication-container .column-middle").css({"min-height":max});
					
				} else if (windowWidth >= 768 && windowWidth < 980) {
					heights.push(rjQuery("#publication-container .column-left").height());
					heights.push(rjQuery("#publication-container .column-middle").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .column-left").css({"min-height":max});
					rjQuery("#publication-container .column-middle").css({"min-height":max});
				}
			} else if (0 != rjQuery("#publication-container .top-middle-right").length || 0 != rjQuery("#publication-container .top-left-right").length) {
				if (windowWidth >= 768) {
					/* make right height equal to top + middle/right */
					pageBodyHeight = rjQuery("#publication-container .publication-columns-container").height();
					rjQuery("#publication-container .columns-container > .column-right").css({"min-height":pageBodyHeight});
					rjQuery("#publication-container .columns-container > .columns").css({"min-height":pageBodyHeight});	
				}
			} else if (0 != rjQuery("#publication-container .top-left-middle").length) {
				if (windowWidth >= 768) {
					/* make left and middle equal height */
					heights.push(rjQuery("#publication-container .column-left").height());
					heights.push(rjQuery("#publication-container .column-middle").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .column-left").css({"min-height":max});
					rjQuery("#publication-container .column-middle").css({"min-height":max});
				}
			} else if (0 != rjQuery("#publication-container .left-middle-right").length) {
				if (windowWidth >= 980) {
					/* make left and middle equal height */
					heights.push(rjQuery("#publication-container .column-left").height());
					heights.push(rjQuery("#publication-container .column-middle").height());
					heights.push(rjQuery("#publication-container .column-right").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .column-left").css({"min-height":max});
					rjQuery("#publication-container .column-middle").css({"min-height":max});
					rjQuery("#publication-container .column-right").css({"min-height":max});
				} else if (windowWidth >= 768 && windowWidth < 980) {
					heights.push(rjQuery("#publication-container .column-left").height());
					heights.push(rjQuery("#publication-container .column-middle").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .column-left").css({"min-height":max});
					rjQuery("#publication-container .column-middle").css({"min-height":max});
				}
			} else if (0 != rjQuery("#publication-container .two-columns").length) {
				if (windowWidth >= 768) {
					/* make left and middle equal height */
					heights.push(rjQuery("#publication-container .respond-container:first-child").height());
					heights.push(rjQuery("#publication-container .respond-container:last-child").height());
					max = Math.max.apply(Math,heights);
					rjQuery("#publication-container .respond-container:first-child").css({"min-height":max});
					rjQuery("#publication-container .respond-container:last-child").css({"min-height":max});
				}
			} 
		},
		
		/**
		 * Even out the columns in landing.tpl
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updateLandingPageColumnHeight: function updateLandingPageColumnHeight() {
			var rows;
			var columns;
			var allColumns;
			var height;
			var max;
			var windowWidth = rjQuery(window).width();
			// always reset the height of each column in each row first
			rows = rjQuery("#landing-container .landing-columns-container");
			rjQuery.each(rows,function(key,value) {
				allColumns = rjQuery(value).find(".respond-container");
				rjQuery.each(allColumns,function(k,v) {
					rjQuery(v).css({"min-height":0});
				});	
			});
			// for tablet landscape and desktop
			if (windowWidth >= 980) {
				// for each row
				rjQuery.each(rows,function(key,value) {
					columns = rjQuery(value).find(".respond-container");
					// measure inner height of row
					height = rjQuery(value).css('height');
					// set the height of each column
					rjQuery.each(columns,function(k,v) {
						rjQuery(v).css({"min-height":height});
					});
				});
			}
			// for tablet portrait
			else if (windowWidth >= 768 && windowWidth < 980) {
				// for each row
				rjQuery.each(rows,function(key,value) {
                    var heights = new Array();
					// reset the height of each column to auto
					columns = rjQuery(value).find(".column-middle.span4,.column-left.span4,.respond-container.span6,.column-middle.span8,.column-middle.span8 + .column-right.span4");				
					rjQuery.each(columns,function(k,v) {
						heights.push(rjQuery(v).height());
					});
					// find the highest value
					max = Math.max.apply(Math,heights);
					rjQuery.each(columns,function(k,v) {
						rjQuery(v).css({"min-height":max});
					});
				});
			}
		},
		
		/**
		 * Even out the columns in complex modules such as Geobase and Calendar
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updateComplexModuleColumnHeight: function updateComplexModuleColumnHeight() {
			var heights = new Array();
			var rows;
			var columns;
			var allColumns;
			var height;
			var max;
			var windowWidth = rjQuery(window).width();
			// always reset the height of each column in each row first
			rows = rjQuery(".complex-module-container .complex-module-columns-container");
			rjQuery.each(rows,function(key,value) {
				allColumns = rjQuery(value).find(".respond-container");
				rjQuery.each(allColumns,function(k,v) {
					rjQuery(v).css({"min-height":0});
				});	
			});
			// for tablet landscape and desktop
			if (windowWidth >= 768) {
				// for each row
				rjQuery.each(rows,function(key,value) {
					columns = rjQuery(value).find(".respond-container");
					// measure inner height of row
					height = rjQuery(value).css('height');
					// set the height of each column
					rjQuery.each(columns,function(k,v) {
						rjQuery(v).css({"min-height":height});
					});
				});
			}
		},
		
		/**
		 * Even out the columns in index.tpl
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updateIndexPageColumnHeight: function updateIndexPageColumnHeight() {
			if (0 == rjQuery("#index-container .column-right").length) {
				return;
			}
			var windowWidth = rjQuery(window).width();
			var heights = new Array();
			var max;
			var columns = rjQuery("#index-container .main-block, #index-container .column-right");		
			rjQuery.each(columns,function(k,v) {
				rjQuery(v).css({"min-height":0});
				heights.push(rjQuery(v).height());
			});
			if (windowWidth >= 768) {
				max = Math.max.apply(Math,heights);
				rjQuery.each(columns,function(k,v) {
					rjQuery(v).css({"min-height":max});
				});
			}
		},
		
		/**
		 * Even out the columns in issue.tpl
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updateIssuePageColumnHeight: function updateIssuePageColumnHeight() {
			var windowWidth = rjQuery(window).width();
			var heights = new Array();
			var max;
			var columns = rjQuery("#issue-container .main-block, #issue-container .column-right");		
			rjQuery.each(columns,function(k,v) {
				rjQuery(v).css({"min-height":0});
				heights.push(rjQuery(v).height());
			});
			if (windowWidth >= 768) {
				max = Math.max.apply(Math,heights);
				rjQuery.each(columns,function(k,v) {
					rjQuery(v).css({"min-height":max});
				});
			}
		},
		
		/**
		 * Even out the columns in article.tpl
		 * Must be called everytime the browser is resized, as changes in browser
		 * width can change the height of various elements.
		 */
		
		updateArticlePageColumnHeight: function updateArticlePageColumnHeight() {
			if (0 == rjQuery("#article-container .column-right").length) {
				return;
			}
			var windowWidth = rjQuery(window).width();
			var heights = new Array();
			var max;
			var columns = rjQuery("#article-container .main-block, #article-container .column-right");		
			rjQuery.each(columns,function(k,v) {
				rjQuery(v).css({"min-height":0});
				heights.push(rjQuery(v).height());
			});
			if (windowWidth >= 980) {
				max = Math.max.apply(Math,heights);
				rjQuery.each(columns,function(k,v) {
					rjQuery(v).css({"min-height":max});
				});
			}
		}
	};
	
})();


// after 1 second, start the loop that will try to ensure the height is set correctly
if (rjQuery("#publication-container, #landing-container, #index-container, #article-container, #issue-container, .complex-module-container").length > 0) {
	WindowResizeResponder.register({
		"method": PageLayout.checkColumnHeights,
		"when": "load",
		"startDelay": 1000
	});
}

