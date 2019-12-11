/**
 * rivistaValidation.js
 * Created 2014
 * 
 * Modular validators for use in the admin panel or for customer-facing
 * forms.
 * 
 * DEPENDENCY
 *     jQuery
 * 
 */


var RivistaValidation = (function() {
	var formFields = {};
	var formFieldHint = {};
	var processOrder = [
			"autocorrect",
            "illegalchars",
			"int",
			"float",
			"string",
			"email",
			"url",
			"phone",
			"zip",
			"maxvalue",
			"minvalue",
			"maxlength",
			"minlength",
            "requiredregexmatch",
            "fieldsmatch",
            "password",
			"required"
	];
	var regexEscapeChars = ".+*?[^]$(){}=!<>|:-\\";

	/**
	 * When there is an validation error on blur, display
	 * the error message in the hint field space.
	 * 
	 * @param $field jQuery object of the field to check
	 * @param msg string message to display
	 * @param reset get rid of error message and replace with original
	 */
	function displayBlurError($field, msg, reset) {
		$field = rjQuery($field);
		msg = typeof msg !== "undefined" ? msg : "";
		reset = typeof reset !== "undefined" ? reset : false;
		var $topParent = $field.parent().parent();
		var $hintField = $topParent.find(".param-hint");
		if ($hintField.length == 0) {
			$hintField = $topParent
					.append('<span class="param-hint" />')
					.find(".param-hint");	// append then find new append and return
		}
		$hintField.html(msg);
		if (reset == true) {
			$hintField.removeClass("error");
		} else {
			$hintField.addClass("error");
		}
	};

	/**
	 * Display all field errors resulting from checking multiple
	 * validators in turn - usually on Save or Update.
	 * Error messages have field name prepended to the message and
	 * are displayed in an alert.
	 * 
	 *  TODO: Use alert package to enable styling of error message
	 *  
	 *  @param alertMessages array of error messages and associated field
	 */
	function displaySaveErrors(alertMessages) {
		var alertMsg = "";
		rjQuery.each(alertMessages, function(index, alert) {
			alertMsg += getFieldLabel(alert.field)+": "+alert.msg+"\n\n";
		});
		if (alertMsg != "") {
			alert(alertMsg);
		}
	};

	/**
	 * Parse the information extracted for the validator and return
	 * that information
	 * 
	 * @param $field jQuery object of the field to check
	 * @param validatorType validator name
	 * @returns validator information
	 */
	function getValidatorInfo($field, validatorType) {
		$field = rjQuery($field);
		var fieldName = $field.attr("name");
		var validator = false;
		if (typeof formFields[fieldName] !== "undefined") {
			var validator = "validate_"+validatorType;
			if (typeof formFields[fieldName][validator] !== "undefined") {
				validator = formFields[fieldName][validator];
			}
		}
		return validator;
	};

	/**
	 * Store the original hint string to be able to replace later on
	 * error correction.
	 * 
	 * @param formfield name of the form field
	 */
	function storeHint(formfield) {
		var $topParent = rjQuery('[name="'+formfield+'"]').parent().parent();
		var $hintField = $topParent.find(".param-hint");
		if ($hintField.length > 0) {
			formFieldHint[formfield] = $hintField.html();
		} else {
			formFieldHint[formfield] = "";
		}
	};

	/**
	 * Get the string label associated with the field being checked.
	 * 
	 * @param $field jQuery object of the field to check
	 * @returns field label
	 */
	function getFieldLabel($field) {
		$field = rjQuery($field);
		var $topParent = $field.parent().parent();
		var label = $field.attr("name");
		if($topParent.find(".param-label").length > 0){
			label = $topParent.find(".param-label").text();
		}
		else if ($topParent.find(".frmLabel").length > 0){
			label = $topParent.find(".frmLabel").text();
		}
		else if($field.siblings("label").length == 1){
			label = rjQuery($field.siblings("label")[0]).html().replace("*", "");
		}
		else if ($topParent.find("label").length > 0){
			label = $topParent.find("label").text();
		}
		return label;
	};

	/**
	 * For value check, check to ensure it is an int or float
	 * 
	 * @param $field jQuery object of the field to check
	 * @returns true: no error, string: error message
	 */
	function checkForNumber($field) {
		var msg = true;
		if (getValidatorInfo($field, "validate_int") != false) {
			msg = RivistaValidation.validate_int($field, false);
		} else if (getValidatorInfo($field, "validate_float") != false) {
			msg = RivistaValidation.validate_float($field, false);
		}
		return msg;
	};

	/**
	 * General framework used by all validators to perform the validation.
	 * Each validator performs a similar set of actions; the only difference
	 * being the validation test and the error message.
	 * 
	 * Pass in the following information in params:
	 *     type of validator
	 *     whether or not to fix the field data
	 *     error message to display if necessary
	 *     function for validation test
	 *         returns an object containing:
	 *             valid: true = valid, false = invalid
	 *             fieldVal: corrected field value is "fix" 
	 * 
	 * @param $field jQuery object of the field to check
	 * @param params data used to perform validation check
	 * @returns true: no error, string: error message
	 */
	function validate($field, params) {
		$field = rjQuery($field);
		params = rjQuery.extend({
			"type": "",			// type of validator
			"fix": false,		// whether or not to fix the field
			"errormsg": "",		// error message to display on error
			"test": function(fieldVal, validationValue) {	// function to execute to test for valid/invalid
				return {"valid":true, "fieldVal":fieldVal};
			}
		}, params || {});

		var validationInfo = getValidatorInfo($field, params.type);
		
		//determines whether or not we should trim spaces
		if(typeof params.trimspaces !== "undefined" && params.trimspaces == false){
			var fieldVal = $field.val();
		}
		else{
			var fieldVal = rjQuery.trim($field.val());
		}
		if (fieldVal.length == 0) {
			return true;	// blank fields are the domain of required
		}
		var msg = true;
		var validationValue = typeof validationInfo.value !== "undefined" ? validationInfo.value : ""; 
		var check = params.test(fieldVal, validationValue);
		if (check.valid == false) {
			if (typeof validationInfo["errormsg"] !== "undefined") {
				msg = validationInfo["errormsg"];
			} else {
				msg = params.errormsg;
			}
		}
		if (params.fix) {
			$field.val(check.fieldVal);
		} else if (msg !== true) {
			if (msg.indexOf("{%s}") != -1) {
				msg = msg.replace("{%s}", validationValue);
			}
			displayBlurError($field, msg);
		}
		return msg;

	};


	return {
		/**
		 * Return all validators - mostly used for debugging;
		 * @returns formFields object
		 */
		getFormFields: function getFormFields() {
			return formFields;
		},

		/**
		 * Read hidden input fields that have validators associated with an input field
		 * and parse the validators from the stored data.  Once all validators are
		 * parsed, sort the validators using the order in "processOrder" and store
		 * by the input field.
		 * 
		 * We also store the hint field associated with the input field, in case
		 * we need to display the error message in the field, then replace it
		 * with the original when the error is corrected.
		 * 
		 */
		gatherValidators: function gatherValidators() {
			rjQuery(".validation-enabled").each(function(index, field) {
				var $field = rjQuery(field);
				var fieldName = $field.attr("name");
				var validators = {};
				var fieldData = $field.data();
				var validatorType = (typeof fieldData["validate_type"] != "undefined") ? fieldData["validate_type"] : "";
				rjQuery.each(fieldData, function(validator, validatorValue) {
					if (validator.indexOf("validate_") !== 0) {
						return true;	// skip to next .each loop iteration
					}
					// if "type", convert to specific type of validator
					if (validator.indexOf("type") != -1) {
						validator = validator.replace("type", validatorType);
					}
					if (validator.indexOf(".errormsg") == -1) {
						var key = "value"
					} else {
						key = "errormsg";
						validator = validator.replace(".errormsg", "");
					}
					if (typeof validators[validator] == "undefined") {
						validators[validator] = {};
					}
					validators[validator][key] = validatorValue;
				});
				formFields[fieldName] = validators;
				storeHint(fieldName);
			});
		},

		/**
		 * Execute the validators for a given field.
		 * 
		 * @param $field jQuery object of the field to check
		 * @returns true: no error, string: error message
		 */
		checkValidators: function checkValidators($field) {
			$field = rjQuery($field);
			displayBlurError($field, formFieldHint[$field.attr("name")], true);
			var fieldName = $field.attr("name");

			var msg = true;
			var validators = formFields[fieldName];
			rjQuery.each(processOrder, function(index, key) {
				var validator = "validate_"+key;
				if (typeof validators[validator] != "undefined") {
					msg = RivistaValidation[validator]($field);
					if (msg !== true) {
						return false;	// exit foreach loop
					}
				}
			});
			// FUTURE: display a check image for correct input
//			if (msg === true) {
//				var $topParent = $field.parent().parent();
//				var $hintField = $topParent.find(".param-hint");
//				if ($hintField.length == 0) {
//					$hintField = $topParent
//							.append('<span class="param-hint" />')
//							.find(".param-hint");	// append then find new append and return
//				}
//				$hintField.html("<img style='height:15px; width:15px;' src='/core/media/images/message_success.png' />");
//			}
			return msg;
		},

		/**
		 * Set interaction for input fields on blur.
		 * 
		 */
		setupBlur: function setupBlur() {
			rjQuery.each(formFields, function(field, validators) {
				rjQuery('[name="'+field+'"]').on("blur", function(event) {
					RivistaValidation.checkValidators(this);
				});
			});
		},

		/**
		 * On Save/Update, trigger ALL validators.
		 * If an error occurs, call to display an alert with all fields that
		 * have errors.
		 * 
		 * @returns true: no errors, false: errors occured
		 */
		doSaveValidation: function doSaveValidation() {
			var msg = true;
			var alertMessages = [];
			rjQuery.each(formFields, function(field, validators) {
				var $field = rjQuery('[name="'+field+'"]');
				msg = RivistaValidation.checkValidators($field);
				if (msg !== true) {
					alertMessages.push({"field":$field, "msg":msg});
				}
			});
			displaySaveErrors(alertMessages);
			return (msg === true);
		},

		/**
		 * Validate a field as an integer.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_int: function validate_int($field, fix) {
			var params = {
					"type": "int",
					"errormsg": "must be an integer.",
					"test": function(fieldVal, validationValue) {
						var fixedValue = fieldVal;
						fieldVal = parseInt(fieldVal);
						fixedValue = isNaN(fieldVal) ? fixedValue : fieldVal;
						return {"valid":(isNaN(fieldVal) == false), "fieldVal": fixedValue};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a float.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_float: function validate_float($field, fix) {
			var params = {
					"type": "float",
					"errormsg": "must be a number.",
					"test": function(fieldVal, validationValue) {
						var fixedValue = fieldVal;
						fieldVal = parseFloat(fieldVal);
						fixedValue = isNaN(fieldVal) ? fixedValue : fieldVal;
						return {"valid":(isNaN(fieldVal) == false), "fieldVal": fixedValue};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a string.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_string: function validate_string($field, fix) {
			var params = {
					"type": "string",
					"errormsg": "must be text.",
					"test": function(fieldVal, validationValue) {
						// currently all strings are valid
						var TEST = true;
						return {"valid":TEST, "fieldVal": fieldVal};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as an email address.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_email: function validate_email($field, fix) {
			var params = {
					"type": "email",
					"errormsg": "must be a valid email address.",
					"test": function(fieldVal, validationValue) {
						// EXTREMELY simple validation; trying to be future proof
						// check for text followed by @ followed by text
						var emailfmt = /\S+@\S+/;
						return {"valid": emailfmt.test(fieldVal), "fieldVal": fieldVal};
					},
					// No fix currently available
					"fix" : false
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a url.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_url: function validate_url($field, fix) {
			var params = {
					"type": "url",
					"errormsg": "must be a valid url.",
					"test": function(fieldVal, validationValue) {
						// TODO: Implement url test
						var TEST = true;
						return {"valid":TEST, "fieldVal": fieldVal};
					},
					// No fix currently available
					"fix" : false
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a phone number.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_phone: function validate_phone($field, fix) {
			var params = {
					"type": "phone",
					"errormsg": "must be a valid phone number.",
					"test": function(fieldVal, validationValue) {
						// TODO: Implement phone number test
						// international prefix + country code + area code + phone number (min 7, max 15 digits)
						// 1. remove all non-alphanumeric characters
						// 2. test for only numeric left, between 7 and 15 digits
						// currently, too simple to provide a fix
						var phoneAlphaDigits = fieldVal.replace(/\W/g,'');
						var digitTest = /^\d{7,15}$/;
						return {"valid": digitTest.test(phoneAlphaDigits), "fieldVal": fieldVal};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a zip/postal code.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_zip: function validate_zip($field, fix) {
			var params = {
					"type": "zip",
					"errormsg": "must be a valid zip/postal code.",
					"test": function(fieldVal, validationValue) {
						// TODO: Implement zip/postal code test
						var TEST = true;
						return {"valid":TEST, "fieldVal": fieldVal};
					},
					// No fix currently available
					"fix" : false
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a number with minimum value.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_minvalue: function validate_minvalue($field, fix) {
			$field = rjQuery($field);
			var msg = checkForNumber($field);
			if (msg !== true) {
				return msg;
			}
			var params = {
					"type": "minvalue",
					"errormsg": "must be greater than or equal to {%s}.",
					"test": function(fieldVal, validationValue) {
						var fixedValue = fieldVal >= validationValue ? fieldVal : validationValue;
						return {"valid":(fieldVal >= validationValue), "fieldVal": fixedValue};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a number with maximum value.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_maxvalue: function validate_maxvalue($field, fix) {
			$field = rjQuery($field);
			var msg = checkForNumber($field);
			if (msg !== true) {
				return msg;
			}
			var params = {
					"type": "maxvalue",
					"errormsg": "must be less than or equal to {%s}.",
					"test": function(fieldVal, validationValue) {
						var fixedValue = fieldVal <= validationValue ? fieldVal : validationValue;
						return {"valid":(fieldVal <= validationValue), "fieldVal": fixedValue};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a string with minimum length.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_minlength: function validate_minlength($field, fix) {
			var params = {
					"type": "minlength",
					"errormsg": "must be longer than or equal to {%s} characters.",
					"trimspaces": (typeof $field.data("validate_minlength.trimspaces") !== undefined ? $field.data("validate_minlength.trimspaces") : false),
					"test": function(fieldVal, validationValue) {
						validationValue = parseInt(validationValue);
                        
                        if(fieldVal.length < validationValue){
                            //this line creates an array of underscores to fill in the "fix" requirement
                            //by joining an empty array with underscores, we skip using a loop
                            //this will make a string with a min length of 6 from "str" to "str___"
						    var fixedVal = fieldVal + Array(validationValue + 1 - fieldVal.length).join("_");
                        }
                        //if the minlength is less than what the actual length is,
                        //just return an empty string, since this won't be used anyway
                        else{
                            var fixedVal = '';
                        }
						return {"valid":(fieldVal.length >= validationValue), "fieldVal": fixedVal};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

		/**
		 * Validate a field as a string with maximum length.
		 * 
		 * @param $field jQuery object of the field to check
		 * @param fix whether or not to autocorrect the field
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_maxlength: function validate_maxlength($field, fix) {
			var params = {
					"type": "maxlength",
					"errormsg": "must be shorter than or equal to {%s} characters.",
					"test": function(fieldVal, validationValue) {
						validationValue = parseInt(validationValue);
						// create array of "_" char and add to field
						var fixedVal = rjQuery.trim(fieldVal).substring(0, validationValue);
						return {"valid":(fieldVal.length <= validationValue), "fieldVal": fixedVal};
					},
					"fix" : (typeof fix !== "undefined" ? fix : false)
			}
			return validate($field, params);
		},

        /**
         * Validate a field as a string checking for illegal characters.
         * 
         * @param $field jQuery object of the field to check
         * @param fix whether or not to autocorrect the field
         * @returns result of validation - true: no error, string: error message
         */
        validate_illegalchars: function validate_illegalchars($field, fix) {
            $field = rjQuery($field);
            fix = typeof fix !== "undefined" ? fix : false;
            var validationInfo = getValidatorInfo($field, "illegalchars");
            var fieldVal = rjQuery.trim($field.val());
            var illegalChars = validationInfo["value"];
            var msg = true;
            rjQuery.each(illegalChars, function(index, char) {
                if (fieldVal.indexOf(char) != -1) {
                    if (fix) {
                        char = (regexEscapeChars.indexOf(char) == -1) ? char : "\\"+char;
                        var re = new RegExp(char, 'g');
                        fieldVal = fieldVal.replace(re, '');
                    } else {
                        if (typeof validationInfo["errormsg"] !== "undefined") {
                            msg = validationInfo["errormsg"];
                        } else {
                            msg = 'contains illegal characters.';
                        }
                        return false;    // exit foreach loop
                    }
                }
            });
            if (msg !== true) {
                displayBlurError($field, msg);
            } else if (fix) {
                $field.val(fieldVal);
            }
            return msg;
        },

		/**
		 * Validate a field as a string checking for a required RegEx match.
		 * 
		 * @param $field jQuery object of the field to check
		 * @returns result of validation - true: no error, string: error message
		 */
		validate_requiredregexmatch: function validate_requiredregexmatch($field){
            $field = rjQuery($field);
            var validationInfo = getValidatorInfo($field, "requiredregexmatch");
            var fieldVal = $field.val();
            var requiredregexmatch = new RegExp(validationInfo["value"]);
            var msg = true;
            
            if(fieldVal.length == 0){
                return true;
            }
            //test the regex match
            if(!fieldVal.match(requiredregexmatch)){
                msg = validationInfo["errormsg"];
            }
            
            if (msg !== true) {
                displayBlurError($field, msg);
            }
            return msg;
		},
        
		/**
		 * Check to make sure the field is not empty.
		 * 
		 * @param $field jQuery object of the field to check
		 * @returns result of validation - true: no error, false: errors occurred
		 */
		validate_required: function validate_required($field) {
			$field = rjQuery($field);
			var fieldVal = $field.val();
			return fieldVal.length > 0;
		},

		/**
		 * Run selected validators and auto-correct the field data.
		 * 
		 * @param $field jQuery object of the field to check
		 * @returns true always
		 */
		validate_autocorrect: function validate_autocorrect($field) {
			var autoCorrectInfo = getValidatorInfo($field, "autocorrect")
			$field = rjQuery($field);
			if (autoCorrectInfo === false) {
				return true;	// nothing to check
			}
			var validatorsOrder = rjQuery.map(autoCorrectInfo["value"].split(","), rjQuery.trim);
			var validators = formFields[$field.attr("name")];
			rjQuery.each(validatorsOrder, function(index, name) {
				var validator = "validate_"+name;
				// don't trigger a validator that doesn't exist
				if (typeof validators[validator] != "undefined") {
					RivistaValidation[validator]($field, true);	// pass true to trigger fix
				}
			});
			return true;
		},

        /**
         * Validate a field s value matches another fields value
         * 
         * @param $field jQuery object of the field to check
         * @returns result of validation - true: no error, string: error message
         */
        validate_fieldsmatch: function validate_fieldsmatch($field){
            $field = rjQuery($field);
            var validationInfo = getValidatorInfo($field, "fieldsmatch");
            var fieldVal = $field.val();
            var targetVal = rjQuery(validationInfo.value).val();
            
            if(fieldVal === targetVal){
	            displayBlurError($field, '', true);
                return true;
            }
            
            displayBlurError($field, validationInfo['errormsg']);
            return validationInfo['errormsg'];
        },

        /**
         * Validate athat the field contains a password
         * 
         * @param $field jQuery object of the field to check
         * @returns result of validation - true: no error, string: error message
         */
        validate_password: function validate_password($field){
            $field = rjQuery($field);
            var fieldVal = $field.val();
            var requiredregexmatch = new RegExp(".*((?:[a-zA-Z]+.*[0-9!@#$%\^\&\*\(\)]+.*)|(?:[0-9!@#$%\^\&\*\(\)]+.*[a-zA-Z]+)).*");
            
            //if the length is 0, return true
            if(fieldVal.length == 0){
            	return true;
			}
			//if the length is < 8, then return the error message
            else if(fieldVal.length < 8){
            	displayBlurError($field, RivistaJSString.get("strings_valid_password_length"));
            	return RivistaJSString.get("strings_valid_password_length");
			}
			//if the field doesn't match the required complexity, then return an error message
			else if(!fieldVal.match(requiredregexmatch)){
				displayBlurError($field, RivistaJSString.get("strings_valid_password_alphanum"));
            	return RivistaJSString.get("strings_valid_password_alphanum");
			}
			//if none of the above are true, then return true. 
			else{
				return true;
			}
        }


	};
})();

/**
 * On document ready:
 *     find all the input fields with validators, and parse and store the validators.
 *     setup blur interaction on fields with validators.
 */
rjQuery(document).ready(function() {
	RivistaValidation.gatherValidators();
	RivistaValidation.setupBlur();
});
