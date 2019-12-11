/**
 * TrackPageView.js
 * 
 * Author: Peter Scannell
 * Date: 2014
 * 
 * When a page is viewed, track_page_views.tpl initializes passes in
 * page settings.  We then call an ajax function to update the
 * core_pageviews table to indicate that the page was viewed.
 * 
 * This class also checks to make sure that only one view is registered
 * per session for a particular user, through a session cookie.
 * 
 */

var TrackPageView = (function() {
	var baseFrapiUrl = "/core/api/frapi/public/index.php/";
	var cookiename = "rivista_pageviews";

	/**
	 * Make an ajax call to update the core_pageviews table
	 * with the page information when the page is viewed.
	 * 
	 * @param settings page settings
	 */
	function updatePageViews(settings) {
		rjQuery.ajax({
			url: baseFrapiUrl+"Pageviews/TrackView.json",
			type: "POST",
			data: {
				'contenttype' : settings.contenttype,
				'pagetype' : settings.pagetype,
				'itemid' : settings.itemid
			},
			error: function() {
				// no action...
//				Console.log("failure");
			},
			success: function(data) {
				// no action...
//				Console.log("success");
			}
		});
	};

	/**
	 * Check to see if this is the first time this session that
	 * the page has been viewed.  Track page viewed through
	 * session cookie.
	 * 
	 * Cookies are composed of page data separated by pipe "|".
	 * Each page's data is just combined together
	 *    contenttype
	 *        cp = core_page
	 *        og = ops_gallery
	 *        oc = ops_customdata
	 *    pagetype
	 *        take first 3 characters of pagetyp
	 *    itemid
	 *        integer
	 * 
	 * @param settings page settings
	 * @returns if new/old session
	 *     true: first time this session page has been viewed
	 *     false: page has already been viewed this session
	 */
	function newPageForSession(settings) {
		var newCookie = "";

		var pageCookie = "cp";	// default: core_page
		if (settings.contenttype == "core_page") {
			pageCookie = "cp";
		} else if (settings.contenttype == "ops_gallery") {
			pageCookie = "og";
		} else if (settings.contenttype == "ops_customdata") {
			pageCookie = "oc";
		} else if (settings.contenttype == "ops_link") {
			pageCookie = "ol";
		}
		pageCookie += settings.pagetype.substring(0, 3);
		pageCookie += settings.itemid;

		var viewCookie = RivistaUtils.getCookie(cookiename);
		if (viewCookie != null && viewCookie != false) {
			if (viewCookie.indexOf(pageCookie) >= 0) {
				return false;	// pageCookie found in cookie, just return false (ie. old page)
			} else {
				newCookie = viewCookie + "|" + pageCookie;
			}
		} else {
			newCookie = pageCookie;
		}
		RivistaUtils.setCookie(cookiename, newCookie, 0);	// 0 for session cookie
		return true;
	};


	/**
	 * Update the core_pageviews table for an ops_link tag.
	 * An ops_link may or may not lead to a page within Rivista,
	 * so we can't capture the destination page for a link.
	 * Instead, we detect click action on the link within
	 * the ops_link article item, and treat it the same as if
	 * were a regular page view.
	 * 
	 * @param tag clicked a tag for ops_link
	 */
	function updateLinkView(tag) {
		var $item = rjQuery(tag).parents(".article-item");
		var settings = {};
		settings["contenttype"] = $item.data("contenttype");
		settings["pagetype"] = $item.data("pagetype");
		settings["itemid"] = $item.data("itemid");
		if (newPageForSession(settings)) {
			updatePageViews(settings);
		}
	};

	return {

		/**
		 * Initialize RegisterView with a pages values:
		 *     contenttype, pagetype, itemid,
		 * then call to update pageviews table if this is
		 * the first view this session.
		 * 
		 * @param settings page settings from template
		 */
		record: function record(settings) {
			settings = rjQuery.extend({
				contenttype: "core_page",	// page content type (database table)
				pagetype: "article",		// page sub-type
				itemid: ""					// id for the page type
			}, settings || {});

			// check if first viewing this session; if so, update table
			if (newPageForSession(settings)) {
				updatePageViews(settings);
			}
		},

		/**
		 * Add jQuery click event detection to links within an ops_link
		 * item within a mixed content list.  This will only be active
		 * if the page contains a mixed content list that includes
		 * ops_link modules.
		 * 
		 */
		initMCLLinkTracking: function initMCLLinkTracking() {
			var $link = rjQuery(".item_pagetype_link a");
			$link.on("click", function(event) {
				updateLinkView(this);
			});
		}

	};
	
})();


