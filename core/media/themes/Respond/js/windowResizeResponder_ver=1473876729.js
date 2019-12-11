/**
 * WindowResizeResponder
 * 
 * Javascript to put all resize responses in one place
 * to make it easier to make changes to the response.
 * 
 */
var CURRENT_VIEWPORT_DATA = {};
var WindowResizeResponder = (function() {

	/**
	 * Check to see if the callback has already been registered.
	 * We should only register once.
	 * 
	 * @param parameters Parameters passed from caller
	 */
	function isRegistered(parameters) {
		var isRegistered = false;
		rjQuery.each(WindowResizeResponder.callbacks, function(index, callback) {
			if (JSON.stringify(callback) == JSON.stringify(parameters) &&
					callback.method.toString() == parameters.method.toString()) {
				isRegistered = true;
				return false;
			}
		});
		return isRegistered;
	};

	/**
	 * Execute callbacks based on whether they are a single element call or
	 * have to get a list of calling elements from the caller.
	 * The caller must provide a method to get the array of elements to
	 * callback on.
	 * 
	 * Note: clearParams is called to remove anything that might cause trouble
	 * later.
	 * 
	 * @param parameters Parameters passed from caller
	 * @param avoidArray array of callbacks NOT to execute
	 */
	function executeCallback(callback, avoidArray) {
		// execute the callback, passing parameters as necessary
		if(!avoidArray || rjQuery.inArray(callback.method, avoidArray) === -1) {
			if (callback.getElements != null) {
				rjQuery.each(callback.getElements(), function(index, element) {
					callback.params.element = rjQuery(element);
					callback.method(callback.params);
					clearParams(callback); 
				});
			} else {
				callback.method(callback.params);
				clearParams(callback); 
			}
		}
	};

	/**
	 * Remove params elements that might cause trouble.
	 *     element - holds DOM element, that causes JSON.stringify to break
	 *         on calls to register, if this is set.  This is usually set on
	 *         execution of getElements callback.
	 */
	function clearParams(callback) {
		delete callback.params.element;
	};

	return {

		callbacks: [],

		/**
		 * Add a function to the resize array, including
		 * when we expect its first reponse to be ("ready" or "load")
		 * and any optional parameters to pass to the function
		 * 
		 * @param parameters
		 *     method - the function to call
		 *     when - when to do the first call of the function
		 *         "ready" - call on document ready
		 *         "load" - call on window load
		 *     startDelay - delay initial call through timeout time
		 *     getElements - get array of elements to callback to
		 *     startupLoop - true/false, initial callback should loop until done
		 *     startupCallback - method to call after startup loop
		 *     startupCallbackWhen - when to call startupCalllback
		 *         "early" - after initial loop
		 *         "middle" - after first check loop
		 *         "late" - after final check loop
		 *     callerClass - additional parameter (class name) for callback methods that can be registered more than once
		 *     params - optional parameter(s) to pass to the function
		 *         NOTE: params must be a single item, either one
		 *             parameter or structured as an object {}
		 *             {} is preferred
		 * 
		 */
		register: function(parameters) {
			parameters = rjQuery.extend({
				"method": null,						// required; the function to call on resize
				"when": "ready",					// initial call on document.ready or window.load
				"startDelay": 0,					// delay initial call by nnn milliseconds
				"getElements": null,				// optional; if a callback is to be executed against a given set of elements, call to get elements
				"startupLoop": false,				// put the callback in a loop at startup until return value is constant (no further change)
				"startupCallback": null,			// optional; callback function to execute after startup loop call
				"startupCallbackWhen": "middle",	// if a startupCallback is provided, when to call it (early, middle, late)
				"callerClass": "",					// optional; method's class; if the method could be called to register more than once
				"params": {}						// optional; parameters to pass to the callback function
			}, parameters || {});

			if (!isRegistered(parameters)) {
				parameters.when = parameters.when.toLowerCase() == "load" ? "load" : "ready";    // if not "load" then "ready"
				parameters.startupCallbackWhen = parameters.startupCallbackWhen.toLowerCase();
				if (parameters.startupCallbackWhen != "early" && parameters.startupCallbackWhen != "middle" && parameters.startupCallbackWhen != "late") {
					parameters.startupCallbackWhen = "middle"
				}
				parameters.startDelay = parseInt(parameters.startDelay, 10);
				parameters.startDelay = parameters.startDelay > 0 ? parameters.startDelay : 0;
				parameters.callerClass = parameters.callerClass.toString();
				WindowResizeResponder.callbacks.push(parameters);
			}
		},

		/**
		 * Remove function call from callbacks array.
		 * Count down to keep array start the same.
		 */
		deregister: function(func) {
			for (var len = (WindowResizeResponder.callbacks.length - 1), index = len; index >= 0; --index) {
				if (func == WindowResizeResponder.callbacks[index].method) {
					WindowResizeResponder.callbacks.splice(index, 1);
				}
			}
		},

		/**
		 * Called on resize or orientationchange
		 * 
		 * @param avoidArray - An array of functions to avoid executing
		 */
		executeCallbacks: function(avoidArray) {
			rjQuery.each(WindowResizeResponder.callbacks, function(index, callback) {
				executeCallback(callback, avoidArray);
			});
		},

		/**
		 * Called only on initial startup event.
		 * Since this event is called by the function that knows
		 * if it is a ready or load event, the function doesn't
		 * have to know how it is called.
		 * 
		 * @param callback the callback function
		 */
		executeInitialCallback: function(callback) {
			// execute the callback, passing parameters as necessary
			window.setTimeout(function() {
				executeCallback(callback);
				if (callback.startupLoop == true) {
					if (callback.getElements != null) {
						rjQuery.each(callback.getElements(), function(index, element) {
							var addedParams = {};
							addedParams.element = rjQuery(element);
							window.setTimeout(function() {
								WindowResizeResponder.executeStartupLoop(callback, null, addedParams);
							}, (100 + callback.startDelay));
						});
					} else {
						window.setTimeout(function() {
							WindowResizeResponder.executeStartupLoop(callback, null);
						}, (100 + callback.startDelay));
					}
				}
			}, callback.startDelay);
		},

		/**
		 * For those callbacks that register to go through an initial
		 * loop before finally settling down, callback to them until
		 * the return value does not change.
		 * 
		 * The methods that call the startup loop should return a
		 * value indicating the status of completion of whatever it
		 * is they need the loop to handle.
		 * 
		 * @param callback the callback function
		 * @param previousValue value from previous call to compare
		 * @param addedParams since callback is local global, use to pass params through timeout
		 */
		executeStartupLoop: function(callback, previousValue, addedParams) {
			callback.params = rjQuery.extend(callback.params, addedParams);
			var newValue = callback.method(callback.params);
			if (previousValue != newValue) {
				window.setTimeout(function() {
					WindowResizeResponder.executeStartupLoop(callback, newValue, addedParams);
				}, 250);
			} else {
				if (callback.startupCallback != null && callback.startupCallbackWhen == "early") {
					callback.startupCallback(callback.params);
					clearParams(callback);
				}
				window.setTimeout(function() {
					WindowResizeResponder.checkStartupLoop(callback, previousValue, addedParams);
				}, 250);
			}
		},

		/**
		 * After things settle down from executeStartupLoop,
		 * wait a little longer and check again.
		 * 
		 * @param callback the callback function
		 * @param previousValue value from previous call to compare
		 * @param addedParams since callback is local global, use to pass params through timeout
		 */
		checkStartupLoop: function(callback, previousValue, addedParams) {
			callback.params = rjQuery.extend(callback.params, addedParams);
			var newValue = callback.method(callback.params);
			if (previousValue != newValue) {
				window.setTimeout(function() {
					WindowResizeResponder.executeStartupLoop(callback, newValue, addedParams);
				}, 250);
			} else {
				if (callback.startupCallback != null && callback.startupCallbackWhen == "middle") {
					callback.startupCallback(callback.params);
					clearParams(callback);
				}
				window.setTimeout(function() {
					WindowResizeResponder.finalStartupLoop(callback, previousValue, addedParams);
				}, 2000);
			}
		},

		/**
		 * After things settle down from executeStartupLoop,
		 * try (hopefully) one final time to make doubly sure.
		 * 
		 * @param callback the callback function
		 * @param previousValue value from previous call to compare
		 * @param addedParams since callback is local global, use to pass params through timeout
		 */
		finalStartupLoop: function(callback, previousValue, addedParams) {
			callback.params = rjQuery.extend(callback.params, addedParams);
			var newValue = callback.method(callback.params);
			if (previousValue != newValue) {
				window.setTimeout(function() {
					WindowResizeResponder.executeStartupLoop(callback, newValue, addedParams);
				}, 250);
			} else if (callback.startupCallback != null && callback.startupCallbackWhen == "late") {
				callback.startupCallback(callback.params);
				clearParams(callback);
			}
			clearParams(callback);
		}

	};

})();


/**
 * Setup resize/orientationchange listen on document ready.
 * Check for old windowWidth and windowHeight to work around
 * IE8 bug where resize event is thrown whenever an element
 * is resized (as well as on window resize).
 * 
 * Put resize/orientationchange call in a timeout (20ms) to handle
 * IE problem with too many resize events on window resize.
 * 
 * Call any callbacks that have registered to be called on
 * document ready
 */
rjQuery(document).ready(function() {
    //setup a handler to update the viewport data variable
    WindowResizeResponder.register({
        "method": RefreshViewportData,
        "when": "ready"
    });
    
    RefreshViewportData();
    
    
	var windowWidth = 0;
	var windowHeight = 0;
	var resizeTimer = null;
	rjQuery(window).on('orientationchange resize', function(event) {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(function() {
			if (windowWidth != rjQuery(window).width() || windowHeight != rjQuery(window).height()) {
				WindowResizeResponder.executeCallbacks();
				windowWidth = rjQuery(window).width();
				windowHeight = rjQuery(window).height();
			}
		}, 20);
	});

	rjQuery.each(WindowResizeResponder.callbacks, function(index, callback) {
		if (callback.when == "ready") {
			WindowResizeResponder.executeInitialCallback(callback);
		}
	});
    
    
});	

/**
 * Call any callbacks that have registered to be called on
 * window load
 */
rjQuery(window).load(function() {
	rjQuery.each(WindowResizeResponder.callbacks, function(index, callback) {
		if (callback.when == "load") {
			WindowResizeResponder.executeInitialCallback(callback);
		}
	});
});

function RefreshViewportData(){
    //function to refresh global CURRENT_VIEWPORT_DATA var
    
    //set the page width
    var document_width = rjQuery(document).width();
    var window_width = rjQuery(window).width();
    var landing_width = rjQuery("#landing-container").width();
    
    CURRENT_VIEWPORT_DATA['document_width'] = document_width;
    CURRENT_VIEWPORT_DATA['window_width'] = window_width;
    CURRENT_VIEWPORT_DATA['landing_width'] = landing_width;
    
    /*
    if(width >= 1200){
        //Desktop
        CURRENT_VIEWPORT_DATA['name'] = "desktop"
    }
    else if(width >= 768){
        //Tablet
        CURRENT_VIEWPORT_DATA['name'] = "tablet"
    }
    else{
        //Phone
        CURRENT_VIEWPORT_DATA['name'] = "phone"
    }*/
    
    if(document_width >= 963){
        //Desktop
        CURRENT_VIEWPORT_DATA['name'] = "desktop";
        CURRENT_VIEWPORT_DATA['num_columns'] = 3;
    }
    else if(document_width >= 751){
        //Tablet
        CURRENT_VIEWPORT_DATA['name'] = "tablet";
        CURRENT_VIEWPORT_DATA['num_columns'] = 2;
    }
    else{
        //Phone
        CURRENT_VIEWPORT_DATA['name'] = "phone";
        CURRENT_VIEWPORT_DATA['num_columns'] = 1;
    }
}