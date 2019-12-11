
/**
 * Optional Callbacks
 * 
 * These can be setup and defined for those methods that need to
 * be called on a class's public function.  This allows the class
 * to create a public function that is still wrapped in the class
 * and not have to make it window-global. 
 */
var RivistaFormCallbacks = {};
// @param callbackName name of the callback
// @param callback callback function
function setRivistaFormCallback(callbackName, callback) {
	RivistaFormCallbacks[callbackName] = callback;
}


/**
 * Checks the given email form field against the database
 * if the email address already exists, return false
 * 
 * @param fld field to check for duplicate email address
 * @param resultsField field to populate with message if email exists
 */
function check_email($emailField, resultsField) {
	$emailField = rjQuery($emailField);
	var $messageFld = rjQuery("#"+resultsField);
	var emailAddress = rjQuery.trim($emailField.val());

	// if the email field is empty, don't bother to check and clear message
	if (emailAddress == '') {
		$emailField.empty();
		$messageFld.empty();
		return true;
	}

	// check email; if OK, then clear message
	listName='checkemail';
	reqType = 2;	// set the xml req mode
	var params = 'req=checkemail&email='+emailAddress;
	var ok = getXmlDocument(params);
	if (ok == 0 || ok == emailAddress) {
		$emailField.html(emailAddress);
		$messageFld.empty();
		return true;
	}

	// else duplicate email address
	if ($messageFld.length > 0) {
		$messageFld.html("The email address you specified already exists.");
	} else {
		alert('The email address you specified already exists.');
	}
	$emailField.empty();
	$emailField.focus();
	return false;
}

function enableButtons()
{
return;
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].type == "button") {
			aInputs[i].disabled=false;
		}
	}
   return;


}
function disableButtons()
{
return;
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].type == "button") {
			aInputs[i].disabled=true;
		}
	}
   return;


}

/**
* Default function triggered by the form's submit button.
* Usually would be overriden by the component.
* 
* @param formname the name of the form to submit
* @param pressbutton the name of the button calling submit
* @param listmode whether it is called from a list
* @param useSSL force the form to submit via SSL
* 
*/
function submitbutton(formname,pressbutton,listmode,useSSL) {
	if (pressbutton.indexOf('delete') >= 0) {
		if (!confirm('Are you sure you want to delete the item(s)?  This is an unrecoverable operation.')) {
			return false;
		}
	}
	if (pressbutton.indexOf('save') >= 0 || pressbutton.indexOf('apply') >= 0) {
		disableButtons();
	}
	var doFormPost = (typeof RivistaFormCallbacks["doFormPost"] != "undefined") ? RivistaFormCallbacks["doFormPost"] : null;
	if (doFormPost == null && window.doFormPost) {
		doFormPost = window.doFormPost;
	}
	if (doFormPost != null) {
		if (!doFormPost(formname, pressbutton)) {
			return false; 
		}
	}
	
	//if RivistaValidation is not undefined, then call it's doSaveValidation function
	//this ensures that the Rivista Validator fires with the other JS validators we use
	//it also ensures that the validator stops the form post if there is an issue
	if(typeof RivistaValidation != "undefined"){
		if(RivistaValidation.doSaveValidation() !== true){
			return false;
		}
	}
	submitform(formname, pressbutton, listmode, useSSL);
}

function getSelectedRadio( srcName ) {
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].name.substr(0, 3) == "sel") {
			if (aInputs[i].checked) {
				return aInputs[i].value;
			}
		}
	}
	return null;
}

function disableAll( srcName ) {
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].name.indexOf(srcName) == 0) {
			aInputs[i].disabled = true;
		}
	}
	return null;
}


function enableAll( srcName ) {
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].name.indexOf(srcName) == 0) {
			aInputs[i].disabled = false;
		}
	}
	return null;
}


function checkAll( srcName ) {
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].name.indexOf(srcName) == 0) {
			aInputs[i].checked=true;
		}
	}
	return null;
}


function uncheckAll( srcName ) {
	var aInputs = document.getElementsByTagName("INPUT");
	for ( var i = 0; i < aInputs.length; i++ ) {
		if (aInputs[i].name.indexOf(srcName) == 0) {
			aInputs[i].checked = false;
		}
	}
	return null;
}

/**
 * Setup the action for the submit form to post the contents
 * using SSL, even if the page being viewed is not using SSL.
 * 
 * @param objForm the form element
 * @param formname name of form
 * @param pressbutton button pressed
 */
function setupSSLFormAction(objForm, formname, pressbutton) {
	var actionParam = pressbutton+'_'+formname;

	var sslHref = window.location.href;
	var locationProtocol = window.location.protocol
	if (locationProtocol != "https:") {
		sslHref = "https:" + sslHref.substring(locationProtocol.length);
	}

	objForm.action = sslHref;
	rjQuery("<input />")
		.attr("type", "hidden")
		.attr("name", "action")
		.attr("value", actionParam)
		.appendTo(objForm);
	rjQuery("<input />")
		.attr("type", "hidden")
		.attr("name", "postUseSSL")
		.attr("value", "true")
		.appendTo(objForm);

	return objForm;
}

/**
* Submit the a form after checking some parameters first.
* Called by submitButton in this file.
* 
* @param formname the name of the form to submit
* @param pressbutton the name of the button calling submit
* @param listmode whether it is called from a list
* @param useSSL force the form to submit via SSL
* 
*/
function submitform(formname, pressbutton, listmode, useSSL) {
	useSSL = typeof useSSL != "undefined" ? (useSSL == "1" || useSSL == "true") : false;
	var objForm = document.getElementById (formname);

	if (useSSL) {
		objForm = setupSSLFormAction(objForm, formname, pressbutton);
	} else {
		objForm.action.value=pressbutton+'_'+formname;
	}

	if(listmode=='1' || listmode=='true') {
		val=getSelectedRadio('sel');
		if (val != null) {
			try {
				objForm.itm.value=val;
				objForm.onsubmit();
			} catch(e) {
				// intentionally left blank
			}
			objForm.submit();
		} else {
			alert("Please select an item from the list for " + pressbutton);
		}
	} else {
		objForm.submit();
	}
}

/**
* Function to get a cookie by name
* 
* @param name
* 
* @returns {Object}
*/
function getCookie(name){
	var raw_cookies = document.cookie.split("; ");
	var baked = {};
	rjQuery.each(raw_cookies, function(i){
		var text = raw_cookies[i].split("=");
		baked[text[0]] = text[1];
	});
	
	if(typeof(baked[name]) !== "undefined"){
		return baked[name];
	}
	else{
		return;
	}
}

/**
* Function to get all cookies
* 
* @returns {Object}
*/
function getCookies(){
	var raw_cookies = document.cookie.split("; ");
	var baked = {};
	rjQuery.each(raw_cookies, function(i){
		var text = raw_cookies[i].split("=");
		baked[text[0]] = text[1];
	});
	
	return baked;
}