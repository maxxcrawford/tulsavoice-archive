/**
 * Rivisat_ajax.js
 * Created on Mar 30, 2007
 * @author     Habes Alkhraisat <hma@jensentechnologies.com>
 * 
 * Modified September 2012
 *     removed dependency on prototype.js
 *     divided functions into private and public
 *     fixed all window global variable definitions
 * 
 * DEPENDENCY
 *     jQuery
 * 
 */


var RivistaAjax = (function() {

	var node_array = [];
	var label_array= [];
	var iconon_array = [];
	var iconoff_array = [];
	var url = "/core/ajaxserver.php?sid=" + new Date().getTime();
	var asynchronous = true;
	var forcePageReload = null;


	function doAjaxCall(params,type,callback) {
		var myAjax = rjQuery.ajax({
			url: url,
			type: type,
			data: params,
			async: asynchronous,
			headers: {
				'Cache-Control': 'no-store, no-cache, must-revalidate',
				'Accept-Encoding': 'compress, gzip'
			},
			error: function() {
				if (typeof console != 'undefined' && typeof console.log != 'undefined') {
					console.log('Failed XHR in Rivista_ajax.js:');
					console.log(arguments);
				}
			},
			complete: callback
		});
	};

	function doToggleField_handler(transport) {
		if (transport.readyState == 4 && transport.status == 200){
			if(transport.responseText) {
				node_t = node_array.shift();
				iconon = iconon_array.shift();
				iconoff = iconoff_array.shift();
				label_t = label_array.shift().split('|');

				/* Check if response is json or simple string */
				var result;
				try {
					var data = eval("("+transport.responseText.trim()+")");
					result = data.result;
					data = data.updateFields;
				} catch (e) {
					result = transport.responseText.trim();
					data = [];
				}

				var result_split = result.split(";");
				if (result_split.length > 1) {
					alert(result_split[1]);
					node_t.childNodes[0].src = '/admin/media/images/' + iconoff;	
					node_t.childNodes[0].alt= label_t[0];
					node_t.childNodes[0].title= label_t[0];
					changeAllRelated(node_t.childNodes[0].src,node_t.childNodes[0].id,label_t[0]);
				} else {
					if(result=='f'){
						node_t.childNodes[0].src = '/admin/media/images/' + iconoff;	
						node_t.childNodes[0].alt= label_t[0];
						node_t.childNodes[0].title= label_t[0];
						changeAllRelated(node_t.childNodes[0].src,node_t.childNodes[0].id,label_t[0]);
					} else {
						node_t.childNodes[0].src = '/admin/media/images/' + iconon;
						node_t.childNodes[0].alt= label_t[1];
						node_t.childNodes[0].title= label_t[1];
						changeAllRelated(node_t.childNodes[0].src,node_t.childNodes[0].id,label_t[1]);
					}
				}

				if(forcePageReload) {
					window.location.reload();
				} else if(data.length > 0) {
					var container = getParentByTagName(node_t, "tr");
					for(var i = 0; i < data.length; i++) {
						var field = data[i];
						for(var c = 0; c < container.childNodes.length; c++) {
							if((" "+container.childNodes[c].className+" ").indexOf(" " + field.domClass + " ") > -1) {
								container.childNodes[c].innerHTML = field.value;
							}
						}
					}
				}
			}
		}
	};
	
	function changeAllRelated(imgsrc, id, n_label) {
		imgsrc = typeof imgsrc != "undefined" ? imgsrc : "";
		n_label = typeof n_label != "undefined" ? n_label : "";
		id = typeof id != "undefined" ? id : null;
		if (id == null || id == "") {
			return;
		}
		// select all img tags with the same id
		rjQuery.each(rjQuery("img[id="+id+"]"), function(index, image) {
			rjQuery(image)
				.attr("src", imgsrc)
				.attr("alt", n_label)
				.attr("title", n_label);
		});
	};

	function increaseViews(params,id) {
		params = "req=increaseviews&field="+params+"&id="+id;
		doAjaxCall(params,"GET", function(transport) {
		});
	};
	
	function getParentByTagName(obj, tagName) {
		var parent = rjQuery(obj).closest(tagName);
		return (parent.length > 0 ? parent[0] : null);
	};
	
	function calendarLinkCheck (node) {
		if (rjQuery(node).hasClass('load_calendar')) {		
			return node;
		}
		// loop through parents to see if there is an ancestor with the class name of 'load_calendar'
		var parents = rjQuery(node).parents();	
		for (var i=0;i<parents.length;i++) {
			if (rjQuery(parents[i]).hasClass('load_calendar')) {
				return parents[i];
			}
		}
		return false;
	};
        

    function showAllTodaysEvents(calendarFullID){
        //show all of the hidden items under this calendar for today
        var $calendarFull = rjQuery("#" + calendarFullID); 
        
        //store the max height into data
        $calendarFull.find(".calendar-events-list").data("maxheight", $calendarFull.find(".calendar-events-list").css("max-height"));
        $calendarFull.find(".calendar-events-list").css("max-height", "none");
        $calendarFull.find(".calendar-show-more").hide();
        $calendarFull.find(".calendar-show-less").show();
    };

    function hideExtraEvents(calendarFullID, maxDisplayed){
        var $calendarFull = rjQuery("#" + calendarFullID); 
        //show all of the hidden items under this calendar for today
        
        //restore the max height
        $calendarFull.find(".calendar-events-list").css("max-height", $calendarFull.find(".calendar-events-list").data("maxheight"));
        $calendarFull.find(".calendar-show-less").hide();
        $calendarFull.find(".calendar-show-more").show();
    };
    
    
    
	return {

		/*
		 * dependentFields is a comma delimited list of fields that should also be updated
		 * after the toggle occurs. Options can be provided for each field in the list by
		 * piping. For example, to update the datepublished field you might do this:
		 * 
		 * datepublished|pubfield|dateformat
		 * 
		 * Position 1 (datepublished): The rivista field to be updated (where the new value comes from)
		 * Position 2 (pubfield): The class on the element that should be updated (optional,
		 *                        defaults to the same as position 1).
		 * Position 3 (dateformat): Indicate formatting to be applied to the new value. (optional, no
		 *                          formatting applied if not provided.                                                  
		 */
		doToggleField: function(node,params,label,iconon,iconoff,confirmMsg,forceReload,dependentFields) {

			// display an optional confirm message
			if(confirmMsg) {
				if(!confirm(confirmMsg)) {
					return false;
				}
			}

			label_array.push(label);
			node_array.push(node);
			params = "req=toggle&"+params;
			if(dependentFields.trim() !== "") {
				params = params + "&additionalFields=" + dependentFields;
			}
			iconon_array.push(iconon);
			forcePageReload = forceReload;
			iconoff_array.push(iconoff);
			node.childNodes[0].src = "/admin/media/images/ajax-loader.gif";
			doAjaxCall(params,"GET",doToggleField_handler);
		},

		/**
		 * Call method in validate.js to see if the email address validates.
		 * 
		 * @param fld email field of html id/class of email field
		 */
		checkEmailValidity:function(fld) {
			var $field = rjQuery(fld);
			if ($field.length == 0) {
				return false;
			}
			var emailVal = rjQuery.trim($field.val());
			$field.val(emailVal);
			if (!checkEmail($field[0])) {
				alert(window.status);
			}
		},

		/**
		 * Called to check to see if an email address is already in use as
		 * an identifier for a user.  If the email field cannot be identified,
		 * just return.
		 * 
		 * @param fld email field object or html id/class string of email field
		 *     if string, use css style, ie. #email_field or .email_field
		 * @param id user id
		 */
		checkEmailUsed:function(fld, id) {
			id = typeof id != "undefined" ? id : "";
			var $field = rjQuery(fld);
			if ($field.length == 0) {
				return false;
			}
			var emailVal = rjQuery.trim($field.val());
			$field.val(emailVal);
			if (emailVal == "") {
				alert('The Email field cannot be left blank.');
				return false;
			}
			var params = "req=checkEmail&email="+escape(emailVal)+"&id="+id;
			doAjaxCall(params,"GET", function(transport) {
				if (transport.responseText.trim()=='f') {
					alert('The email address you specified already exists.');
					$field.focus();
				} else {
					alert('The email address seems to be ok!');
					return true;
				}
			});
		},
		// backwards compatibility
		checkEmail: function(fld, id) {
			return RivistaAjax.checkEmailUsed(fld, id);
		},

		/**
		 * Called to check to see if a screen name is already in use as
		 * an identifier for a user.
		 * 
		 * @param fld screen name field object or html id/class string of screen name field
		 *     if string, use css style, ie. #screen_name or .screen_name
		 * @param id user id
		 */
		checkScreennameUsed: function(fld, id) {
			id = typeof id != "undefined" ? id : "";
			var $field = rjQuery(fld);
			if ($field.length == 0) {
				return false;
			}
			var screenNameVal = rjQuery.trim($field.val());
			$field.val(screenNameVal);
			if (screenNameVal == "") {
				return true;
			}
			var params = "req=checkScreenname&screenname="+escape(screenNameVal)+"&id="+id;
			doAjaxCall(params,"GET", function(transport) {
				if (transport.responseText) {
					if (transport.responseText=='f') {
						alert('That screen name is in use.  Please choose another.');
						fld.focus();
					} else{
						alert('That screen name seems ok!');
						return;
					}
				}
			});
		},
		// backwards compatibility
		checkScreenname: function(fld, id) {
			return RivistaAjax.checkScreennameUsed(fld, id);
		},

		getGeobaseListings:function(geobaseid,search,initOptions) {
			var params = "req=getGeobaseListings&geobaseid="+escape(geobaseid)+'&search='+escape(search);
			var options = initOptions || {};
			if(options.zipcodes) {
				var zipcodes = options.zipcodes.replace(/[^0-9,]/g,""); //strip out text
				if(zipcodes) params = params + "&zipcodes=" + escape(zipcodes);
			}
			doAjaxCall(params,"GET", function(transport) {
				if(transport.responseText){
					// incoming data is json encoded
					//geobasedata=transport.responseText;
					if (window.listingscallback) {
						listingscallback(transport.responseText);
					}
				}
			});
		},
		
		getGeobaseListing:function(listingid) {
			var params = "req=getGeobaseListing&listingid="+escape(listingid);
			doAjaxCall(params,"GET", function(transport) {
				if(transport.responseText){
					// incoming data is json encoded
					//geobasedata=transport.responseText;
					if (window.getGeobaseListingCallback) {
						getGeobaseListingCallback(transport.responseText);
					}
				}
			});
		},
		
		opsCalendarLoadEvent: function(eventID,calendarID,calendarPageID,publicationID) {
			if (rjQuery('#event_data_' + eventID + ' td.description div.event').length == 0) {
				var $calendar = rjQuery('#calendar_' + calendarID);
				var params = "req=getCalendarEvent&eventid="+escape(eventID)+"&calendarid="+escape(calendarID)+"&calendarpageid="+escape(calendarPageID)+"&publicationid="+escape(publicationID);
				$calendar.find('.ajaxloader').show();
				doAjaxCall(params,"GET", function(transport) {
					if (transport.responseText){
						$calendar.find('.ajaxloader').hide();
						rjQuery('#event_data_' + eventID + ' td.description').append(transport.responseText);
					}
				});
			} else {
				rjQuery('#event_data_' + eventID + ' td.description div.event').toggle();
			}
		},
		
		bindCalendarEvents: function(calendarID, calendarPageID, publicationID, moduleID) {
			var $calendar = rjQuery('#calendar_' + calendarID);
			$calendar.bind('click', function(e) {
				var node = calendarLinkCheck(e.target);
					if (node) {
						// ok, we've landed on something interesting: an anchor with a className that includes 'load_calendar'... so load the calendar.			
						e.preventDefault(); // prevent default browser action
						rjQuery('#calendar_' + calendarID + ' .mini_view td a').each(function(index, day) {
							day.parentNode.className = (day == node) ? 'currentday' : 'eventday'; // highlight the day we clicked, blur the others
						});
						var dateMembers = node.getAttribute('calendar_request_date').split(':');
						var calendarView = node.getAttribute('calendar_view');
						var calendarTemplate = node.getAttribute('template');
						var calendarCategory = this.getAttribute('calendar_category'); // 'this' refers to the calendar root node
						var loadEventDescriptions = node.getAttribute('loadeventdescriptions');
						if (loadEventDescriptions == null) {
							loadEventDescriptions = 'yes'; // default to loading event descriptions unless explicitly told not to
						}
						RivistaAjax.loadCalendar(
							calendarID
							, parseInt(dateMembers[0], 10)
							, parseInt(dateMembers[1], 10)
							, parseInt(dateMembers[2], 10)
							, calendarView
							, calendarCategory
							, calendarTemplate
							, calendarPageID
							, publicationID
                            , rjQuery(".calendar-show-less").data("max-displayed")
                            , loadEventDescriptions
						);
					}
			});
            RivistaAjax.setupExpansionHandlers();
		},
		
		loadCalendar:function(calendarID, y, m, d, view, filter, template, calendarPageID, publicationID, maxDisplayed, loadEventDescriptions) {
            if(!maxDisplayed){
                if(rjQuery(".calendar-show-less").data("max-displayed")){
                    var maxDisplayed = rjQuery(".calendar-show-less").data("max-displayed")
                }
                else{
                    var maxDisplayed = 5;
                    rjQuery(".calendar-show-less").data("max-displayed", 5);
                }
            }
            
			calendarID = escape(calendarID);
			var $calendar = rjQuery('#calendar_' + calendarID);
			$calendar.find('.eventContainer').hide();
			$calendar.find('.ajaxloader').show();
			var params = {
				'req': 'getCalendar'
				, 'view': view
				, 'm': m
				, 'y': y
				, 'd': d
				, 'calid': calendarID
				, 'categoryfilter': escape(filter)
				, 'template': template
				, 'calendarpageid': calendarPageID
                , 'publicationid' : publicationID
				, 'maxDisplayed' : maxDisplayed
				, 'loadeventdescriptions' : loadEventDescriptions
			};			
			doAjaxCall(params, "GET", function(answer) {
				var $calendar = rjQuery('#calendar_' + calendarID);
				if (view == 'day_view') {
					$calendar.find('.eventsContainer').html(answer.responseText);
				}
				else {
					$calendar.replaceWith(answer.responseText);
				}
				$calendar.find('.eventsContainer').show();
				$calendar.find('.ajaxloader').hide();
                RivistaAjax.setupExpansionHandlers();
			});
		},

		getModuleTags: function(moduleid, contentid, func) {
			var params = {
					'req': 'getModuleTags',
					'moduleid': moduleid,
					'contentid': contentid
			};
			doAjaxCall(params, "GET", func);
		},

		/**
		 * When a user clicks the button to flag a comment as inappropriate,
		 * make a call to the server to mark the comment in the database.
		 * If the call was successful, replace the button with the flagString.
		 * 
		 * @param id the comment id
		 * @param flagString replacement string for UI
		 */
		flagComment: function(id, flagString) {
			var params = "req=flagUserComment&id="+id;
			doAjaxCall(params,"GET", function(transport) {
				if (transport.responseText) {
					if (transport.responseText=='f') {
						alert('Sorry, this comment could not be flagged.');
					} else{
						var flagId = transport.responseText;
						rjQuery("#flag"+flagId).parent().html('<span class="flagged">'+flagString+'</span>')
					}
				}
			});
		},

        setupExpansionHandlers: function(){
            var $calendar_show_more = rjQuery(".calendar-show-more");
            var $calendar_show_less = rjQuery(".calendar-show-less")
            $calendar_show_more.unbind("click");
            $calendar_show_less.unbind("click");
            
            
            $calendar_show_more.bind("click", function(e){
                var calendarFullID = rjQuery(this).parents(".module").attr("id");
                showAllTodaysEvents(calendarFullID);
            });
            
            $calendar_show_less.bind("click", function(e){
                var calendarFullID = rjQuery(this).parents(".module").attr("id");
                var maxDisplayed = rjQuery(this).data("max-displayed");
                hideExtraEvents(calendarFullID, maxDisplayed);
            });

			if (typeof WindowResizeResponder != "undefined") {
				WindowResizeResponder.register({
					method: function() {
						var width = rjQuery(document).width();
						var $calendar_show_more = rjQuery(".calendar-show-more");
						var $calendar_show_less = rjQuery(".calendar-show-less");

						if(width > 979) {
							//on desktop sizes, show all items
							$calendar_show_more.click();
							
							$calendar_show_more.hide();
							$calendar_show_less.hide();
							
						} else if(!$calendar_show_more.is(":visible") && !$calendar_show_less.is(":visible")) {
							$calendar_show_more.show();
							$calendar_show_less.show();
							$calendar_show_less.click();
						}
					},
					"when":"ready"
				});
			}

		}
	};

})();
