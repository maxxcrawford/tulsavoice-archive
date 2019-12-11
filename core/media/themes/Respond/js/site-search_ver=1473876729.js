/**
 * Summary: Script for URI-encoding search queries
 * 
 * Description: This code is included on every page in the head to make sure that the search term is properly encoded
 * before it is sent to Rivista to preserve characters like ampersands as part of the search term. Loaded in
 * RivistaPage:run() method.
 *
 */

rjQuery(document).ready(function() {
	var coreSearch = [];
	// get an array of all CoreSearch forms on the page
	searchForms = rjQuery("form");
	for (var i=0;i < searchForms.length;i++) {
		// loop through elements
		var elements = searchForms[i].elements;
		for (var x = 0;x < elements.length; x++) {
			if (elements[x].name === "mod" && elements[x].value === "CoreSearch") {
				coreSearch.push(searchForms[i]);
			}
		}
	}
	
  	if (coreSearch.length > 0) {
  	   for (var z = 0;z < coreSearch.length; z++) {
  	    	rjQuery(coreSearch[z]).submit(function() {
  	    		var searchTextField = this.elements['query'];
                var originalValue = searchTextField.value;
                searchTextField.value = encodeURIComponent(searchTextField.value);
                setTimeout(function() {
                    searchTextField.value = originalValue;
                }, 1);
  	   		});
  	   }
  	}
    
    rjQuery("#collapsed-search-btn").on("click", function() {
       
       rjQuery(this).toggleClass("active");
    });
    
    // make sure all columns in the search results are visible
    // hide the columns if they overlap
      
        var colTimer = null;
        
        rjQuery(window).on('orientationchange resize', function(event) {
            window.clearTimeout(colTimer);
            colTimer = window.setTimeout(function() {

                // resize pagination if necessary
                rjQuery('.pagination').each(function() {
                    var $pagination = rjQuery(this);
                    $pagination.find('.pagination_page a, .pagination_page').show();
                    var pagersize = 0;
                    // hide extra pages if pagination is too large to fit
                    // make sure active page is showing, hide pages to the left and right
                    // keep next and prev buttons
                    $pagination.find('li a:visible').each(function() {
                        pagersize += rjQuery(this).outerWidth();
                    });
                    var paginationWidth = $pagination.width();
                    if (pagersize > paginationWidth) {
                        var before = $pagination.find('.beforeactive');
                        var after = $pagination.find('.afteractive');
                        
                        var hideStartPages = function() {
                            if (pagersize > paginationWidth && before.length > 2) {
                                // hide starting pages
                                $pagination.find(".firstpage").nextUntil(".active").andSelf().each(function() {
                                    var a = rjQuery(this).find("a:visible");
                                    if (a.length > 0) {
                                        pagersize -= a.outerWidth();
                                        rjQuery(this).hide();
                                    }
                                    return pagersize > paginationWidth;
                                });
                            }
                        };
                        var hideEndPages = function() {
                            if (after.length > 2) {
                                // hide last pages
                                var li = $pagination.find(".lastpage").parent().prev();
                                
                                if(li.hasClass("disabled")){
                                    li = li.prev();
                                }
                                
                                //while the width of the pager is above what it should be, or the height is big enough for 2 lines, loop through and hide elements.
                                while(
                                    (pagersize > paginationWidth 
                                     || $pagination.height() > rjQuery(".pagination").find("a").outerHeight() + 5)
                                     && li.length != 0 
                                     && !li.hasClass(".active")
                                ){
                                    var a = li.find("a:visible");
                                    
                                    if (a.length > 0) {
                                        pagersize -= a.outerWidth();
                                        li.hide();
                                    }
                                    
                                    li = li.prev();
                                }
                            }
                        };

                        if (rjQuery(".pagination_ellipses.pagination_first a:visible")) {
                            //if the starting ellipses is visible, lop of pages before active first
                            hideStartPages();
                            hideEndPages();
                        } else {
                            //otherwise start at the end
                            hideEndPages();
                            hideStartPages();
                        }
                    }
                });

            }, 300);

        }).trigger("resize");
    
    rjQuery('.menu-container, #sitesearch').on('hide show', function(event) {    
       // safari fix to ensure transition end fires, otherwise menu gets stuck
       var target = event.target;
       setTimeout(function() {
           if (rjQuery.support.transition && rjQuery.support.transition.end) {
               rjQuery(target).trigger(rjQuery.support.transition.end);
           }
       }, 300);
    });
  
    
    
});
