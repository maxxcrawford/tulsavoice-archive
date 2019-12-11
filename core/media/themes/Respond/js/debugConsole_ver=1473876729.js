/**
 * Provide our own debugging console to write to:
 * a) the Javascript console if it exists - enabled by a
 *    browser's Javascript debugger.
 * b) our own div on the page - when this is turned
 *    on by including "texterityDebugConsole=true" in the url.
 * If neither case is true, the message is thrown away.
 */
var Console = (function(){
	var position = {};

	/**
	 * Check to see if we want to use the Texterity Debug Console.
	 * If yes, then check to see if it already exists in the
	 * document body.  If not, then create it.
	 * Note: The debug console will not appear on the page until
	 * the first debug statement enables it.
	 * 
	 * @returns true - "texterityDebugConsole=true" in the url
	 *     false - "texterityDebugConsole=true" NOT in the url
	 */
	function debugConsole() {
		var enableConsole = RivistaUtils.getUrlParam("texterityDebugConsole") == "true";
		if (enableConsole && rjQuery("#texterityDebugConsole").size() == 0) {
			var style=
				"display: block;" +
				"position: fixed;" +
				"right: 10px;" +
				"bottom: 10px;" +
				"height: 200px;" +
				"width: 300px;" +
				"background-color: #FFFFFF;" +
				"border: 1px solid #999999;" +
				"font-size: 11px;" +
				"padding: 2px;" +
				"overflow: auto;"
			rjQuery(document.body).append('<div id="texterityDebugConsole" style="'+style+'"></div>');

			// enable simple drag of the console
			rjQuery("#texterityDebugConsole").on("mousedown", function(e) {
				position.left = e.pageX;
				position.top = e.pageY;
				rjQuery("#texterityDebugConsole").on("mousemove", function(event) {
					var left = rjQuery(this).offset().left - (position.left - event.pageX);
					var top = rjQuery(this).offset().top - (position.top - event.pageY);
					rjQuery(this).offset({ top: top, left: left})
					position.left = event.pageX;
					position.top = event.pageY;
				});
			});
			rjQuery("#texterityDebugConsole").off("mouseup").on("mouseup", function(event) {
				rjQuery("#texterityDebugConsole").off("mousemove");
				position = {};
			});
		}
		rjQuery("#texterityDebugConsole").show();
		return enableConsole;
	};

	function consoleZ(consoleDiv) {
		var elements = rjQuery("*");
		var zindex = 0;
		rjQuery.each(elements, function(index, element) {
			var indexCurrent = parseInt(rjQuery(element).css("z-index"), 10);
			zindex = (indexCurrent > zindex) ? indexCurrent : zindex;
		});
		if (zindex == consoleDiv.css("z-index")) {
			return zindex;
		} else {
			return zindex++;
		}
	};

	function outputToConsole(logType, message) {
		var consoleDiv = rjQuery("#texterityDebugConsole");
		consoleDiv
			.append("<div>"+logType+": "+message+"</div>")
			.scrollTop(consoleDiv.prop("scrollHeight"))
			.css({"z-index":consoleZ(consoleDiv)});
	};

	return {
		log: function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
			if (debugConsole()) {
				outputToConsole("LOG", message);
			}
		},

		warn: function(message){
			if (window.console && window.console.warn) {
				window.console.warn(message);
			} else {
				Console.log(message);
			}
			if (debugConsole()) {
				outputToConsole("WARN", message);
			}
		},

		error: function(message){
			if(window.console && window.console.error) {
				window.console.error(message);
			} else {
				Console.log(message);
			}
			if (debugConsole()) {
				outputToConsole("ERROR", message);
			}
		},

		debug: function(message){
			if(window.console && window.console.debug) {
				window.console.debug(message);
			} else {
				Console.log(message);
			}
			if (debugConsole()) {
				outputToConsole("DEBUG", message);
			}
		},

		trace: function(message){
			if(window.console && window.console.trace) {
				window.console.trace(message);
			} else {
				Console.log(message);
			}
			if (debugConsole()) {
				outputToConsole("TRACE", message);
			}
		}
	};

})();

var ResponsiveDebug = (function() {
	
	return {
		enableResponsiveDetection: function() {
			var enableResponsiveDetection =
				RivistaUtils.getUrlParam("responsiveDetection") == "true" ||
				RivistaUtils.getCookie("responsiveDetection") != null;
			if (enableResponsiveDetection && rjQuery("#responsive-detection-block").size() == 0) {
				rjQuery(document.body).append('<div id="responsive-detection-block" />');
			}
		}
	};
	
})();

rjQuery(document).ready(function() {
	ResponsiveDebug.enableResponsiveDetection();
});

