/* a set of generic functions for use in Rivista */

// Add string trim functionality if not browser native
if (!String.prototype.trim) {
	String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g,'');
	}
}

/* creates a queue to load scripts on the onload event */
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      oldonload();
      func();
    }
  }
}


/* the get elements by class name function */
/* getElementsByClassName from: http://www.robertnyman.com/2005/11/07/the-ultimate-getelementsbyclassname */

function getElementsByClassName(oElm, strTagName, oClassNames){
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    var arrRegExpClassNames = new Array();
    if(typeof oClassNames == "object"){
        for(var i=0; i<oClassNames.length; i++){
            arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames[i].replace(/\-/g, "\\-") + "(\\s|$)"));
        }
    }
    else{
        arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames.replace(/\-/g, "\\-") + "(\\s|$)"));
    }
    var oElement;
    var bMatchesAll;
    for(var j=0; j<arrElements.length; j++){
        oElement = arrElements[j];
        bMatchesAll = true;
        for(var k=0; k<arrRegExpClassNames.length; k++){
            if(!arrRegExpClassNames[k].test(oElement.className)){
                bMatchesAll = false;
                break;                      
            }
        }
        if(bMatchesAll){
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements)
}

// Cookie Class - http://examples.oreilly.com/jscript2/15.1.txt
// The constructor function.  Creates a cookie object for the specified
// document,  with a specified name. 
// attributes.  
// Arguments:
//   document: the Document object that the cookie is stored for.  Required.
//   name: a string that specifies a name for the cookie.  Required.
//   hours: an optional number that specifies the number of hours from now
//          that the cookie should expire.
//   path: an optional string that specifies the cookie path attribute.
//   domain: an optional string that specifies the cookie domain attribute.
//   secure: an optional boolean value that, if true, requests a secure cookie.
//
function Cookie(document, name, hours, path, domain, secure)
{
    // All the predefined properties of this object begin with '$'
    // to distinguish them from other properties which are the values to
    // be stored in the cookie.
    this.$document = document;
    this.$name = name;
    if (hours)
        this.$expiration = new Date((new Date()).getTime() + hours*3600000);
    else this.$expiration = null;
    if (path) this.$path = path; else this.$path = null;
    if (domain) this.$domain = domain; else this.$domain = null;
    if (secure) this.$secure = true; else this.$secure = false;
}

// This function is the store() method of the Cookie object
function _Cookie_store()
{
    // First, loop through the properties of the Cookie object and
    // put together the value of the cookie.  Since cookies use the
    // equals sign and semicolons as separators, we'll use colons
    // and ampersands for the individual state variables we store 
    // within a single cookie value.  Note that we escape the value
    // of each state variable, in case it contains punctuation or other
    // illegal characters.
    var cookieval = "";
    for(var prop in this) {
        // ignore properties with names that begin with '$' and also methods
        if ((prop.charAt(0) == '$') || ((typeof this[prop]) == 'function')) 
            continue;
        if (cookieval != "") cookieval += '&';
        cookieval += prop + ':' + escape(this[prop]);
    }

    // Now that we have the value of the cookie, put together the 
    // complete cookie string, which includes the name, and the various
    // attributes specified when the Cookie object was created.
    var cookie = this.$name + '=' + cookieval;
    if (this.$expiration)
        cookie += '; expires=' + this.$expiration.toGMTString();
    if (this.$path) cookie += '; path=' + this.$path;
    if (this.$domain) cookie += '; domain=' + this.$domain;
    if (this.$secure) cookie += '; secure';

    // Now store the cookie by setting the magic Document.cookie property
    this.$document.cookie = cookie;
}

// This function is the load() method of the Cookie object
function _Cookie_load()
{
    // First, get a list of all cookies that pertain to this document.
    // We do this by reading the magic Document.cookie property
    var allcookies = this.$document.cookie;
    if (allcookies == "") return false;

    // Now extract just the named cookie from that list.
    var start = allcookies.indexOf(this.$name + '=');
    if (start == -1) return false;   // cookie not defined for this page.
    start += this.$name.length + 1;  // skip name and equals sign.
    var end = allcookies.indexOf(';', start);
    if (end == -1) end = allcookies.length;
    var cookieval = allcookies.substring(start, end);

    // Now that we've extracted the value of the named cookie, we've
    // got to break that value down into individual state variable 
    // names and values.  The name/value pairs are separated from each
    // other with ampersands, and the individual names and values are
    // separated from each other with colons.  We use the split method
    // to parse everything.
    var a = cookieval.split('&');  // break it into array of name/value pairs
    for(var i=0; i < a.length; i++)  // break each pair into an array
        a[i] = a[i].split(':');

    // Now that we've parsed the cookie value, set all the names and values
    // of the state variables in this Cookie object.  Note that we unescape()
    // the property value, because we called escape() when we stored it.
    for(var i = 0; i < a.length; i++) {
        this[a[i][0]] = unescape(a[i][1]);
    }

    // We're done, so return the success code
    return true;
}

// This function is the remove() method of the Cookie object.
function _Cookie_remove()
{
    var cookie;
    cookie = this.$name + '=';
    if (this.$path) cookie += '; path=' + this.$path;
    if (this.$domain) cookie += '; domain=' + this.$domain;
    cookie += '; expires=Fri, 02-Jan-1970 00:00:00 GMT';

    this.$document.cookie = cookie;
}

// Create a dummy Cookie object, so we can use the prototype object to make
// the functions above into methods.
new Cookie();
Cookie.prototype.store = _Cookie_store;
Cookie.prototype.load = _Cookie_load;
Cookie.prototype.remove = _Cookie_remove;


//Set of utility functions in namespace RivistaUtils
var RivistaUtils = (function() {
	return {
		getUrlParams: function getUrlParams() {
			var params = {};
			var pairs = [];
			var pair = [];
			var pairs = window.location.search.substring(1).split('&');
			for(var i = 0, len = pairs.length; i < len; i++) {
				pair = pairs[i].split("=");
				params[pair[0]] = pair[1];
			}
			return params;
		},
		
		getUrlParam: function getUrlParam(name) {
			if (typeof name == "undefined" || name == null) {
				return null;
			}
			var params = RivistaUtils.getUrlParams();
			if (params.hasOwnProperty(name)) {
				return params[name];
			} else {
				return null;
			}
		},

		getCookie: function getCookie(cookieName) {
			var nameEQ = cookieName + "=";
			var cookies = document.cookie.split(";");
			var cookieVal = null;
			rjQuery.each(cookies, function(index, cookie) {
				cookie = rjQuery.trim(cookie);
				if (cookie.indexOf(nameEQ) == 0) {
					cookieVal = cookie.substring(nameEQ.length, cookie.length);
					return false;
				}
			});
			if (cookieVal != null) {
				cookieVal = decodeURIComponent(cookieVal);
			}
			return cookieVal;
		},
		
		setCookie: function setCookie(cookieName, value, hours) {
			var expires = "";
			if (typeof days != "undefined") {
				var date = new Date();
				date.setTime(date.getTime()+(days*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			document.cookie = escape(cookieName)+"="+escape(value)+expires+"; path=/";
		},

		/**
		 * Check to see if a parameter is defined.
		 * 
		 * If no parent is passed in, then the check is a simple, basic check to see
		 * if the parameter has been defined.
		 * 
		 * If a parent is passed in, then the check is more complex, looking to see if
		 * the parent is a javascript object and if it has the object parameter defined.
		 * When a parent is defined, the check can be extended to see if the parameter
		 * is inherited from a parent object.
		 * 
		 * @param parameter value to check for defined or existence
		 * @param parent optional parent object to check.
		 *     Note, we only check plain javascript objects as parent
		 * @param checkInherited optional boolean to check for inherited property
		 */
		paramExists: function paramExists(parameter, parent, checkInherited) {
			parent = typeof parent != "undefined" ? parent : false;
			checkInherited = typeof checkInherited != "undefined" ? checkInherited : false;
			var exists = false;
			if (parent !== false) {
				if (rjQuery.isPlainObject(parent) && !rjQuery.isEmptyObject(parent)) {
					if (checkInherited) {
						exists = typeof parent[parameter] != "undefined";
					} else {
						exists = parent.hasOwnProperty(parameter);
					}
				}
			} else {	// simple check for defined
				exists = typeof parameter != "undefined";
			}
			return exists;
		},

		/**
		 * Check whether the passed in object is defined or not.
		 * Optionally check to see if the object matches a specific type.
		 * Optionally, return some default value if it is not defined
		 * and alternately doesn't match the specific type.
		 * 
		 * @param object the javascript object to check
		 * @param defaultValue optional default to apply if object doesn't check out
		 * @param type optional type to check against object
		 * 
		 * @returns
		 *     object - if it is defined and (optionally) matches type
		 *     default value - if not defined and value passed in
		 *     null - if not defined and no value passed in
		 */
		checkObject: function checkObject(object, defaultValue, type) {
			var returnVal = null;
			var exists = rjQuery.type(object) != "undefined" ? true : false;
			if (exists && rjQuery.type(type) == "string") {
				exists = rjQuery.type(object) == type ? true : false;
			}
			if (exists) {
				returnVal = object;
			} else if (rjQuery.type(defaultValue) != "undefined") {
				returnVal = defaultValue;
			}
			return returnVal;
		},

		/**
		 * Generate pseudo=random UUID, using math.random, with the
		 * output being all hex digits.
		 * Constrain the minimum size to 1 digit.
		 * 
		 * @param digits number of digits for UUID
		 * @returns UUID value
		 */
		generateUUID: function generateUUID(digits) {
			digits = parseInt(RivistaUtils.checkObject(digits, 1), 10);
			digits = digits > 0 ? digits : 1;
			return Math.floor((1 + Math.random()) * Math.pow(16, digits)).toString(16).substring(1);
		},

		/**
		 * Generate a pseudo-random GUID, using math.random.
		 * 
		 * @returns GUID
		 */
		generateGUID: function generateGUID() {
			var GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
			return GUID;
		},

		/**
		 * Function copied from phpjs.org
		 * 
		//  discuss at: http://phpjs.org/functions/strip_tags/
		// original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Luke Godfrey
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//    input by: Pul
		//    input by: Alex
		//    input by: Marc Palau
		//    input by: Brett Zamir (http://brett-zamir.me)
		//    input by: Bobby Drake
		//    input by: Evertjan Garretsen
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: Onno Marsman
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: Eric Nagel
		// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: Tomasz Wesolowski
		//  revised by: Rafael Kukawski (http://blog.kukawski.pl/)
		//   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
		//   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
		//   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
		//   returns 2: '<p>Kevin van Zonneveld</p>'
		//   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
		//   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
		//   example 4: strip_tags('1 < 5 5 > 1');
		//   returns 4: '1 < 5 5 > 1'
		//   example 5: strip_tags('1 <br/> 1');
		//   returns 5: '1  1'
		//   example 6: strip_tags('1 <br/> 1', '<br>');
		//   returns 6: '1 <br/> 1'
		//   example 7: strip_tags('1 <br/> 1', '<br><br/>');
		//   returns 7: '1 <br/> 1'
		 * 
		 * @param input string to remove tags from
		 * @param allowed pass in tag types that will not be removed
		 * 
		 */
		strip_tags: function strip_tags(input, allowed) {
			allowed = (((allowed || '') + '')
					.toLowerCase()
					.match(/<[a-z][a-z0-9]*>/g) || [])
					.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
			var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			return input.replace(commentsAndPhpTags, '')
					.replace(tags, function($0, $1) {
						return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
					});
		},

		/**
		 * NOTE: COPIED FROM global.php AND CONVERTED TO JAVASCRIPT
		 * 
		 * Converts a name to a url friendly version that is acceptible to search engines.
		 * We use this for naming articles and pages for url conversion.
		 * 
		 * @param path the text value of the path to clean
		 */
		cleanForPath: function cleanForPath(path) {
			path = path.trim();							// remove spaces around string
			path = RivistaUtils.strip_tags(path);		// call to remove html tags
			path = path.replace(/&amp;/g,'-');			// replace &amp; with -
			path = path.replace(/&/g,'-');				// replace & with -
			path = path.replace(/\//g,'-');				// replace / with -
			path = path.replace(/ /g,'-');				// replace space with -
			path = path.replace(/\s+/g, '-');			// replace white space with -
			path = path.replace(/--+/g, '-');			// replace multiple - with single -
			path = path.replace(/[^\sa-zA-Z0-9-]/g,'');	// remove non-ascii characters
			path = path.replace(/'|"/g, '');			// remove single and double quotes
			path = path.trim();							// finally remove spaces around string
			path = path.replace(/^-|-$/g, '');			// finally remove - around string
			path = encodeURI(path);						// one final call to remove anything left...

			return path;
		}


	};
})();


/**
 * Strings available to Javascript functions, created from a Smarty template
 * string file, similar to lang.en-us.tpl.
 * 
 * String template files:
 *     lang.en-us.javascript.master.tpl
 *     lang.en-us.javascript.tpl
 * 
 * Strings are read in from the file and stored as key value pairs, so that
 * the string is accessible through its key.
 * 
 */
var RivistaJSString = (function() {
	var jsString = {};

	/**
	 * Search through a string for the placeholder tag %s and replace
	 * them with their replacement strings.
	 * 
	 * @param string value with placeholders
	 * @param replacements single string or array of replacment strings
	 */
	function replacePlaceholders(string, replacements) {
		replacements = typeof replacements != "undefined" ? replacements : [];
		if (!rjQuery.isArray(replacements)) {
			replacements = [replacements];
		}
		while (string.indexOf("%s") != -1) {
			var replacement = replacements.shift();
			replacement = (typeof replacement != "undefined" && replacement != null) ? (replacement+"") : "";
			string = string.replace("%s", replacement);
		}
		return string;
	};

	return {
		/**
		 * Return string based on key.  If placeholder tags are included
		 * process them and return the string with replacments.
		 * 
		 * @param stringKey key for lookup
		 * @param replacements single string or array of replacment strings
		 */
		get: function get(stringKey, replacements) {
			if (typeof jsString[stringKey] == "undefined") {
				return false;
			}
			var string = jsString[stringKey];
			if (string.indexOf("%s") == -1) {
				return jsString[stringKey];
			} else {
				return replacePlaceholders(string, replacements);
			}
		},

		/**
		 * Add a set of strings to the jsString object.  Strings are defined
		 * as an object consisting of multiple key/value pairs.  The key is
		 * the lookup key for the strings.
		 * 
		 * @param strings object of multiple key/value pairs for string key and string
		 */
		put: function put(strings) {
			if (typeof strings != "undefined" && rjQuery.isPlainObject(strings)) {
				rjQuery.each(strings, function(key, value) {
					jsString[key] = value;
				});
			}
		},

		/**
		 * Return the jsString object - mostly for debugging.
		 */
		getAllStrings: function getAllStrings() {
			return jsString;
		}

	};


})();


/**
 * Make sure outerHTML works for jQuery objects
 */
rjQuery.fn.outerHTML = function(){
	// Use native version if present, all others will have a fall-back for cloning
	return (!this.length) ? this : (this[0].outerHTML || (
			function(el){
				var div = document.createElement('div');
				div.appendChild(el.cloneNode(true));
				var contents = div.innerHTML;
				div = null;
				return contents;
			})(this[0]));
}

/**
 * Find the edge size in width for a box element.  By default, this
 * includes:
 *     padding
 *     border
 *     margin
 * 
 * Browsers can do weird things to margin when an included element is
 * different than its parent.  To offset this, store any width set
 * via an inline style setting, then set the width of the included
 * element to the width of its parent, perform our calculations,
 * then reset the width to the stored style (could be blank).
 * 
 * NOTE: This function assumes that, if set, border width and/or
 *     margin width is specified in pixels.
 *     If not, then update for thin/medium/thick/inherit.
 * 
 * @param which the edge to return value.  Default: horizontal
 * @param nomargin default value: false
 *     true - don't use margin in edge calculation
 *     false - use margin in edge calculation
 */
rjQuery.fn.edge = function(which, nomargin) {
	which = typeof which != "undefined" ? which : "horizontal";
	nomargin = typeof nomargin != "undefined" ? nomargin : false;
	if (rjQuery.inArray(which, ["horizontal", "vertical", "left", "right", "top", "bottom"]) == -1) {
		return null;
	}
	var $element = rjQuery(this);
	// store inline width, then set width to parent
	var widthStyle = $element[0].style.width;
	$element.css("width", $element.parent().width()+"px");

	var edge = 0;
	if (which == "left" || which == "horizontal") {
		edge += parseInt($element.css("padding-left"), 10) || 0;
		edge += parseInt($element.css("borderLeftWidth"), 10) || 0;
		edge += nomargin == false ? (parseInt($element.css("marginLeft"), 10) || 0) : 0;
	}
	if (which == "right" || which == "horizontal") {
		edge += parseInt($element.css("padding-right"), 10) || 0;
		edge += parseInt($element.css("borderRightWidth"), 10) || 0;
		edge += nomargin == false ? (parseInt($element.css("marginRight"), 10) || 0) : 0;
	}
	if (which == "top" || which == "vertical") {
		edge += parseInt($element.css("padding-top"), 10) || 0;
		edge += parseInt($element.css("borderTopWidth"), 10) || 0;
		edge += nomargin == false ? (parseInt($element.css("marginTop"), 10) || 0) : 0;
	}
	if (which == "bottom" || which == "vertical") {
		edge += parseInt($element.css("padding-bottom"), 10) || 0;
		edge += parseInt($element.css("borderBottomWidth"), 10) || 0;
		edge += nomargin == false ? (parseInt($element.css("marginBottom"), 10) || 0) : 0;
	}
	// reset width
	$element.css("width", widthStyle);

	return edge;
}


// Display the fancy jQueryUI tooltips on pageload (HTML Content within the tooltip will be parsed)
rjQuery(document).ready(function() {
	if(rjQuery.isFunction(rjQuery.fn.tooltip)) {
		rjQuery(".help-icon[title], .rjqtooltip").tooltip({
			content: function () {
				return rjQuery(this).attr('title');
			},
			html: true
		});
	}
});