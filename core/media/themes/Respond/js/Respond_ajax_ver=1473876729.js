/**
 * Respond_ajax.js
 * 
 * Useful classes to make frapi calls.  Currently includes:
 *     AjaxMessages
 *         get: returns an array of messages
 *         parse: message parser, if you want to do it yourself
 * 
 * DEPENDENCY
 *     jQuery
 * 
 */


/**
 * When submitting a page form, we may want to return some status messages to the
 * calling page.  Unfortunately, if the page is cached, any message attached to
 * the page source will also be cached.
 * A method is provided to store an array of messages in a session variable:
 *     $_SESSION['ajaxmessages']
 * 
 * where each stored message is an object with the format:
 *     {<unique key>, message}
 * 
 */
var AjaxMessages = (function() {
	var baseURL = "/core/api/frapi/public/index.php/";
	var cachebuster = "?sid=" + new Date().getTime();

	function reportFailure(callback) {
		Console.log('Ajax call failed for AjaxMessages.get');
		Console.log(arguments);
		if (callback) {
			callback();
		}
	};

	return {
		/**
		 * Parse messages stored and returned through ajax calls.
		 * Messages have a unique key (usually php time()) and a
		 * message.
		 * What is passed in should be an array of message objects.
		 * A single message object can be passed in, and it is converted
		 * into an array of message objects before processing.
		 * 
		 * Messages are set in the session, and *should* be cleared after
		 * being read, but don't seem to be.  So... we keep track of
		 * messages that have been processed by storing processed
		 * message keys in the "ajaxMessages" cookie.
		 * 
		 * This function can keep track of a maximum of 10 messages at
		 * a time.  In practice, only a single message will probably be
		 * set each time.
		 * 
		 * @param newMessages array of messed objects or single message objectt
		 *     format message object: {uniqueKey : message}
		 * 
		 */
		parse: function parse(newMessages) {
			if (typeof newMessages == "undefined" ||
					newMessages == "" ||
					!(rjQuery.isArray(newMessages) || rjQuery.isPlainObject(newMessages))) {
				return [];
			}
			if (rjQuery.isPlainObject(newMessages)) {
				newMessages = [newMessages];
			}

			// read in keys from ajax messages already seen
			var messageKeys = RivistaUtils.getCookie("ajaxMessages");
			if (messageKeys == null) {
				messageKeys = [];
			} else {
				messageKeys = messageKeys.split("|");
			}

			// loop through ajax messages, determining whether or not
			// the messages have already been processed
			var messages = [];
			var newKeys = [];
			rjQuery.each(newMessages, function(index, message) {
				var cookieId = message["msgid"]+"";		// force to string
				if (rjQuery.inArray(cookieId, messageKeys) == -1) {	// new message
					if (message["stringid"] != "" && RivistaJSString.get(message["stringid"])) {
						messages.push(RivistaJSString.get(message["stringid"]));
					} else {
						messages.push(message["message"]);
					}
					newKeys.push(cookieId);
				} else {
//					Console.log("already seen");
				}
			});

			// return new messages and store new keys in cookie
			if (messages.length > 0) {
				rjQuery.merge(messageKeys, newKeys);
				while (messageKeys.length > 50) {
					messageKeys.shift();
				}
				RivistaUtils.setCookie("ajaxMessages", messageKeys.join("|"), 0);
			}
			return messages;
		},

		get: function get(callback, params) {
			params = rjQuery.extend({
				frapicall: "Pages/CheckAjaxMessages.json",
				pageid: 0,
				failureCallback: null
			},params);

			callback = typeof callback != "undefined" && rjQuery.isFunction(callback) ? callback : null;
			if (callback == null || params.pageid <= 0) {
				return;
			}
			var failureCallback = (params.failureCallback != null && rjQuery.isFunction(params.failureCallback))
					? params.failureCallback
					: null;

			var dataParams = {};
			dataParams['pageid'] = params.pageid;

			rjQuery.ajax({
				url: baseURL+params.frapicall+cachebuster,
				type: "POST",
				dataType: "json",
				async: true,
				data: dataParams,
				error: function() {
					reportFailure(failureCallback);
				},
				success: function(data) {
					if (data.status.toLowerCase() == "success") {
						var messages = AjaxMessages.parse(data.data);
						callback(messages);
					} else {
						reportFailure(failureCallback);
					}
				}
			});
		}

	};

})();
