/**
 * RivistaGoogleDFP
 * @author Jeff Fohl jeff@godengo.com
 * @author Peter Scannell pscannell@gtxcel.com
 * @copyright GTxcel, 2012 - 2014
 * 
 * Dependencies: jQuery, googletag
 * 
 * Google DFP API documentation: https://support.google.com/dfp_premium/answer/1650154?hl=en
 * 
 * USE:
 * 
 * Initialize and display on page load:
 * 
 *     RivistaGoogleDFP.init({"rads":{<associative array of ads>}, "adCategory":<optional category>}, "publisherId":<publisher id>);
 * 
 *         {<associative array of ads>} = {
 *                                       radKey1:{"min":<minWidth>, "max":<maxWidth>, "height":<height>,"width":<width>, "slotname":<Google DFP slotname1>},
 *                                       radKey2:{"min":<minWidth>, "max":<maxWidth>, "height":<height>,"width":<width>, "slotname":<Google DFP slotname2>}
 *                                      }
 * 
 *         "radKey" - generated; usually including module id, but not required
 *         "min" - optional; minimum browser width for ad display
 *         "max" - optional; maximum browser width for ad cisplay
 *         IMPORTANT NOTE: slotname, height, and width are ALL REQUIRED
 *             These values must match those set when you create the google dfp ad
 *             If you specify a height and width that is different from what you need,
 *             you will either get no ad or an ad of the new size.
 *             Slotname matches the slot name you created in the google ad.
 *                "slotname":"id_1234567890"	// id is the string name you created for the google dfp ad
 *                 "height":300					// height pixel value - MUST be integer
 *                 "width":250					// width pixel value - MUST be integer
 * 
 * Initialize and display after page loads (usually called for single Google DFP ad unit)
 *     RivistaGoogleDFP.storeAds({<associative array of ads>});
 *     RivistaGoogleDFP.display(<Google DFP radKey>);
 *     
 *         <Google DFP radKey> = unique string to use as lookup key for Google ad
 * 
 *     The ad unit is registered and displayed in an html div:
 *         <div id="google_dfp_container_<radKey>" class="rad"></div>
 * 
 *         The caller is responsible for creating and displaying this div.
 * 
 * 
 * Once loaded, all ads on the page can be refreshed (reloaded) through a call to refreshAds
 * with no parameters:
 *     RivistaGoogleDFP.refreshAds();
 * 
 *     Certain modules will call this automatically through the updateallads event; for example:
 *     slideshow gallery.
 * 
 *     It is possible to refresh the ad units for one or more Google DFP ads, but this will not be common.
 *         Refresh single ad:
 *             RivistaGoogleDFP.refreshAd: function(radKey);
           Refresh multiple ads:
 *             RivistaGoogleDFP.refreshAds(<array of radKeys>);
 * 
 */

var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

(function() {
	var gads = document.createElement('script');
	gads.async = true;
	gads.type = 'text/javascript';
	var useSSL = 'https:' == document.location.protocol;
	gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
	var node = document.getElementsByTagName('script')[0];
	node.parentNode.insertBefore(gads, node);
})();


var RivistaGoogleDFP = (function(rjQuery,googletag){
	var rads = {};			// ad plus ad parameters - radKey: ad parameters
	var slots = {};			// Google Ad slots for ad - radKey: Google DFP slot
	var adUnits = [];		// list of radKeys on page
	var slottedAds = [];	// list of radKeys for which Google ad slots have been set
	var loadedAds = [];		// list of radKeys for ads that have been loaded and displayed on the page
	var pubid = '';			// publisher id (same for all ads)
	var adcategory = '';	// optional ad Category (same for all ads)
	var postid = '';		// optional Post Id target
    var listing_id = '';    // optional Geobase Listing ID Target

	/**
	 * Keep track of whether or not a particular Google DFP operation has been performed
	 * for each of the ad positions we need to register.
	 * 
	 * @param radKey Rivista unique key for an ad
	 * @param statusType the particular type of operation we are tracking
	 */
	function storeStatus(radKey, statusType) {
		if (rjQuery.inArray(statusType, ["initialized", "slotted", "loaded"]) == -1) {
			return;
		}
		if (checkStatus(radKey, statusType)) {
			return;
		}
		if (statusType == "initialized") {
			adUnits.push(radKey);
		} else if (statusType == "slotted") {
			slottedAds.push(radKey);
		} else if (statusType == "loaded") {
			loadedAds.push(radKey);
		}
	};

	/**
	 * Check to see if an ad position has been added to any of our status lists.
	 * 
	 * @param radKey Rivista unique key for an ad
	 * @param statusType the particular type of operation we are tracking
	 */
	function checkStatus(radKey, statusType) {
		if (rjQuery.inArray(statusType, ["initialized", "slotted", "loaded"]) == -1) {
			return null;
		}
		if (statusType == "initialized") {
			return (rjQuery.inArray(radKey, adUnits) != -1);
		} else if (statusType == "slotted") {
			return (rjQuery.inArray(radKey, slottedAds) != -1);
		} else if (statusType == "loaded") {
			return (rjQuery.inArray(radKey, loadedAds) != -1);
		}
	};

	/**
	 * Setup and store the Google DFP slot for the slot id for the ad.
	 * Checks to see if it was already setup and stored.
	 * Google ads can use the same slotname for a Google DFP ad,
	 * as long as the placement for the ad (html div) has a unique
	 * id (should have one anyway).  Google DFP will just attempt
	 * to populate the div by id for each ad placed.
	 * 
	 * @param radKey Rivista unique key for an ad
	 */
	function setAdUnitSlot(radKey) {
		if (!checkStatus(radKey, "slotted")) {
			var dfpRad = rads[radKey];
			var slotId = RivistaGoogleDFP.htmlIdPrefix+radKey;
			var slot = googletag.defineSlot('/'+pubid+'/'+dfpRad.slotname, [dfpRad.width, dfpRad.height], slotId).addService(googletag.pubads());
			// if we have created an ad category for this ad, register it as a "category" variable
			if (adcategory !== null) {
				slot.setTargeting("category", adcategory);
			}
			slot.setTargeting("post_id", postid);
            slot.setTargeting("listing_id", listing_id);
			googletag.display(slotId);
			slots[radKey] = slot;
			storeStatus(radKey, "slotted");
		}
	};


	return {
		initialized: false,
		htmlIdPrefix: "google_dfp_",		// with radKey forms html id for actual display div
		htmlContainerIdPrefix: "google_dfp_container_",	// with radKey forms html id for container

		/**
		 * Initialize the Google DFP ad service with all the ads from modules that
		 * load ads when the page is loaded.  This call is really only for initial
		 * setup and load.
		 * 
		 * Ad Id is passed in as the key to the rads object.  Using this value and the
		 * unique interfaceId, we generate a radKey to use for creation of the ad slot
		 * and to keep track of ads in our system.
		 * 
		 * @param settings
		 *     rads set of page-load Google DFP ads to initialize
		 *     publisherId google publisher id
		 *     adCategory OPTIONAL ad category setting
		 *     htmlIdPrefix OPTIONAL if caller wants to use a different html id
		 *     htmlContinerIdPrefix OPTIONAL if caller wants to use a different html container id
		 */
		init: function(settings) {
			settings = rjQuery.extend(
					{
						"rads": {},
						"publisherId": "",
						"adCategory": "",
						"postId":"",
                        "listing_id":"",
						"htmlIdPrefix": "google_dfp_",
						"htmlContainerIdPrefix": "google_dfp_container_"
					},
					settings||{}
			);

			// store global values for later use
			pubid = settings.publisherId;
			adcategory = settings.adCategory;
			postid = settings.postId;
            listing_id = settings.listing_id;
			RivistaGoogleDFP.htmlIdPrefix = settings.htmlIdPrefix;
			RivistaGoogleDFP.htmlContainerIdPrefix - settings.htmlContainerIdPrefix;

			// add new ads to rads associative array and mark initialized
			RivistaGoogleDFP.storeAds(settings.rads);

			// setup for googletag for our page
			// this gets called when the googletag object is ready,
			// sometimes before and sometimes after the page loads.
			googletag.cmd.push(function() {
				googletag.pubads().enableSingleRequest();	// enable all ads to be refreshed with a single call
				googletag.pubads().disableInitialLoad();	// initialize and load ads, but don't display until later
                googletag.pubads().collapseEmptyDivs();     // Collapse Empty Divs
				googletag.enableServices();					// start the googletag services

				// Place the display call(s) in window.load to ensure that all the ad html is ready,
				// including some MCL html generated on page load
				// Once the googletag object has been initialized and all the initial ads have been
				// stored, load all the ads if the ad position is visible on the page
				rjQuery(window).load(function() {
					// If there is an MCL, register MCL ads first, since they are created and loaded
					// on a different path than other ads on the page.
					// Pass in true to exclude ads with "fromajax" class
					MCLAdsGoogleDFP.registerNewAds(true);
					// This will load/display ALL current ads, including MCL ads that have been registered
					RivistaGoogleDFP.displayAll();

					// HORRIBLE HACK: Since we don't know if the googletag object is fully initialized,
					//     we must wait a little while before calling ajax-added ads the first time.
					setTimeout(function() {
						RivistaGoogleDFP.initialized = true;
					}, 2000);

				});
			});

		},

		/**
		 * Given an associative array of ad objects, check to see if the ad will fit on
		 * the page given min and max parameters.
		 * If we are going to display the ad, just tore it in the rads associative array
		 * and mark it initialized.
		 * The "display" call will ensure that the ad slot is created and initialized
		 * for this as when it is called.
		 * 
		 * @param newRads object containing one or more ad objects
		 */
		storeAds: function(newRads) {
			// add new ads to rads associative array
			rads = rjQuery.extend(newRads, rads);

			// check to see if the ad will fit on the page
			// also check to see that height and width are set, as these are required for display
			rjQuery.each(newRads, function(radKey, params) {
				var radMin = (RivistaUtils.paramExists("min", params) && params['min'] != null) ? params['min'] : false;
				var radMax = (RivistaUtils.paramExists("max", params) && params['max'] != null) ? params['max'] : false;
				var pushKey = false;
				if (radMin !== false && radMax !== false) {
					if (radMin <= document.documentElement.clientWidth && radMax >= document.documentElement.clientWidth) {
						pushKey = true;
					}
				} else if (radMin !== false) {
					if (radMin <= document.documentElement.clientWidth) {
						pushKey = true;
					}
				} else if (radMax !== false) {
					if (radMax >= document.documentElement.clientWidth) {
						pushKey = true;
					}
				} else {
					pushKey = true;
				}

				// make sure height and width values are set
				var radHeight = (RivistaUtils.paramExists("height", params) && params['height'] != null) ? params['height'] : false;
				var radWidth = (RivistaUtils.paramExists("width", params) && params['width'] != null) ? params['width'] : false;
				if (radHeight !== false && radWidth !== false && pushKey == true) {
					storeStatus(radKey, "initialized");
				} else {
					// if not initialized, delete the rads object and remove the display div
					delete rads[radKey];
					rjQuery("#"+RivistaGoogleDFP.htmlContainerIdPrefix+radKey).remove();
				}
			});
		},

		/**
		 * Load an individual ad by ad position.
		 * 
		 * This method also calls to create a Google DFP ad slot for each ad,
		 * calling setAdUnitSlot.  setAdUnitSlot checks to see if an ad slot
		 * has already been set.  If not, it will set it.  setAdUnitSlot will
		 * also call the "display" method to get the ad ready for display.
		 * googletag.pubads().disableInitialLoad() was set earlier, which prevents
		 * the ad from displaying until a refresh call is made.
		 * 
		 * Then we call the "refreshAd" method of googletag, passing the radKey for
		 * the ad to the refresh method to actually load and display the ad in the div.
		 * 
		 * We store the ad position value in the loadedAds array so we don't try
		 * to load it again and then make sure the ad div is visible.
		 * 
		 * @param radKey Rivista unique key for an ad
		 */
		display: function(radKey) {
			var $radUnit = rjQuery("#"+RivistaGoogleDFP.htmlContainerIdPrefix+radKey);
			if ($radUnit.length == 0) {
				return;
			}
			if (!checkStatus(radKey, "loaded")) {
				setAdUnitSlot(radKey);	// if not already done...
				storeStatus(radKey, "loaded");
			}
			$radUnit.show();
			RivistaGoogleDFP.refreshAd(radKey);
		},

		/**
		 * Load all ads that have been created.
		 * 
		 * Similar to "display" This method also checks to see if the display div
		 * exists on the page, then calls to create a Google DFP ad slot for each ad.
		 * 
		 * After checking each ad and making sure its adUnit is set, we call "refreshAds"
		 * with no parameters, which, in turn, will call Google "refresh" with no
		 * parameters, which will refresh all ads at once.
		 * 
		 */
		displayAll: function() {
			rjQuery.each(adUnits, function(index, radKey) {
				var $radUnit = rjQuery("#"+RivistaGoogleDFP.htmlContainerIdPrefix+radKey);
				if ($radUnit.length != 0) {
					if (!checkStatus(radKey, "loaded")) {
						setAdUnitSlot(radKey);	// if not already done...
						storeStatus(radKey, "loaded");
					}
					$radUnit.show();
				}
			});
			RivistaGoogleDFP.refreshAds();
		},

		/**
		 * Refresh the ad on the page given its ad key.  Each ad
		 * position is associated with a different Google DFP slot, so we
		 * can refresh individual ads if necessary.
		 * 
		 * The Google refresh call can refresh multiple ads at once, so the
		 * ad slot must be passed to the google service in an array.
		 * 
		 * @param radKey Rivista unique key for an ad
		 */
		refreshAd: function(radKey) {
			if (checkStatus(radKey, "loaded")) {
				if (RivistaUtils.paramExists(radKey, slots)) {
					slots[radKey].addService(googletag.pubads());
					googletag.pubads().refresh([slots[radKey]]);
				}
			}
		},

		/**
		 * Refresh a list of ads.  Do not include a list to refresh all
		 * ads at once.
		 * 
		 * The Google refresh call can refresh multiple ads at once, by passing
		 * an array of ad slots to the google service.
		 * 
		 * If an array of ad slots is not passed to refresh() all ads on the
		 * page associated with the pubService will be refreshed.
		 * 
		 * @param radKeysArray array of radKeys to use to get slots to pass to refresh
		 *     leave blank to refresh all ads
		 */
		refreshAds: function(radKeysArray) {
			if (rjQuery.type(radKeysArray) == "undefined") {
				googletag.pubads().refresh();
			} else {
				radKeysArray = RivistaUtils.checkObject(radKeysArray, [], "array");
				if (radKeysArray.length > 0) {
					var refreshSlots = [];
					rjQuery.each(radKeysArray, function(index, radKey) {
						if (RivistaUtils.paramExists(radKey, slots)) {
							refreshSlots.push(slots[radKey]);
						}
					});
					if (refreshSlots.length > 0) {
						googletag.pubads().refresh(refreshSlots);
					}
				}
			}
		}


	};


})(rjQuery,googletag);



/**
 * Manage GoogleDFP ads placed within a mixed content list.
 */
var MCLAdsGoogleDFP = (function(rjQuery) {


	return {
		/**
		 * Check to see if any Google DFP ads placed in mixed content lists have the
		 * notdisplayed class tag.  If so, register those ads with the googletag
		 * object.
		 * 
		 * These ads may be created after the initial page load, so we give
		 * each ad must have its own unique display div with a
		 * unique html id so that the ad service can correctly populate
		 * the display area.  The Google DFP slot name is reusable, as
		 * long as the html id is registered with the googletag object.
		 * 
		 * Ad Key (radKey)
		 * We create a unique key using the moduleId and timestamp in
		 * milliseconds.  Ad information and the html id are stored
		 * under this key.
		 * 
		 * HTML Id
		 * We generate the html id from the module id and the timestamp
		 * in milliseconds.  We don't expect that multiple ads will be
		 * created at exactly the same time, so this should be OK.
		 * 
		 * Data values populated and passed in from contentitemsummary.tpl
		 * @param data-moduleid Rivista module id
		 * @param data-slotname Google DFP slot name
		 * @param data-height admin setting for ad display height
		 * @param data-width admin setting for ad display width
		 * @param data-min admin setting for min browser width
		 * @param data-max admin setting for max browser width
		 * 
		 * @returns radKeys list of keys for generate ad objects
		 */
		registerNewAds: function(noAjax) {
			noAjax = RivistaUtils.checkObject(noAjax, false);
			var radKeys = [];
			var $dfpAds = rjQuery(".rad.googledfp.notdisplayed");
			if (noAjax != false) {
				$dfpAds = $dfpAds.not(".fromajax");
			}
			$dfpAds.each(function(index, dfpAd) {
				var $dfpAd = rjQuery(dfpAd);
				if ($dfpAd.length > 0) {
					var radKey = $dfpAd.attr("data-moduleid")+"_"+RivistaUtils.generateUUID(8);
					var slotname = $dfpAd.attr("data-slotname");
					var htmlId = RivistaGoogleDFP.htmlContainerIdPrefix+radKey;
					$dfpAd.attr("id", htmlId);

					var htmlInnerId = RivistaGoogleDFP.htmlIdPrefix+radKey;
					var height = ($dfpAd.attr("data-height") != "" && $dfpAd.attr("data-height") > 0) ? parseInt($dfpAd.attr("data-height"), 10) : null;
					var width = ($dfpAd.attr("data-width") != "" && $dfpAd.attr("data-width") > 0) ? parseInt($dfpAd.attr("data-width"), 10) : null;
					$dfpAd.find(".dfp").attr("id", htmlInnerId).css({"height":(height+"px"), "width":(width+"px")});

					var rad = {};
					var min = ($dfpAd.attr("data-min") != "" && $dfpAd.attr("data-min") > 0) ? $dfpAd.attr("data-min") : null;
					var max = ($dfpAd.attr("data-max") != "" && $dfpAd.attr("data-max") > 0) ? $dfpAd.attr("data-max") : null;
					rad[radKey] = {
							"slotname": slotname,
							"height": height,
							"width": width,
							"min": min,
							"max": max
					}
					RivistaGoogleDFP.storeAds(rad);
					radKeys.push(radKey);
					$dfpAd.removeClass("notdisplayed");
				}
			});
			return radKeys;
		},

		/**
		 * Register and display all new ads - ie. those where the html ad slot
		 * has the "notdisplayed" class still attached.
		 * 
		 * Call registerNewAds to register these ads with the googletag service.
		 * Once registered, use the returned list of radKeys to individually
		 * display the google ad on the page.
		 * 
		 * HORRIBLE HACK: Since we don't know if the googletag object is fully initialized,
		 *     we must wait a little while before calling ajax-added ads the first time.
		 *     2 second timeout in init()...
		 * 
		 */
		displayNewAds: function() {
			if (RivistaGoogleDFP.initialized == true) {
				var radKeys = MCLAdsGoogleDFP.registerNewAds();
				rjQuery.each(radKeys, function(index, radKey) {
					RivistaGoogleDFP.display(radKey);
				});
			} else {
				// if not initialized, circle back and try again
				setTimeout(function() {
					MCLAdsGoogleDFP.displayNewAds();
				}, 250);
			}
		}

	};

})(rjQuery);



rjQuery(document).ready(function() {
	// so we don't accidentally register more than once
	rjQuery("body").off("updateallads.googledfp");
	rjQuery("body").on("updateallads.googledfp", function() {
		RivistaGoogleDFP.refreshAds();
	});

});

