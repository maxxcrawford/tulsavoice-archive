/**
 * This class provides functionality to dynamically retrieve and display state/province
 * names and -codes as HTML <option> tags, based on the given country code.
 *
 * @author Stefan T.
 * @copyright Godengo Inc., 2008, 2012
 * 
 * modified: October 2012
 * 
 * DEPENDENCIES:
 *     jQuery
 **/

/* Base class from which to create instance */
var StateOptionsSwitcher = function(countryId, stateId, stateContainer, config) {
	this.country = rjQuery("#"+countryId);
	this.state = rjQuery("#"+stateId);
	this.stateContainer = rjQuery("#"+stateContainer);
	this.spinner = rjQuery("#"+config.spinner) || null; //spinner image
	this.backendurl = config.backendurl || '/core/ajaxserver.php';
	this.isrequired = config.isrequired || false;
	this.blankoption = config.blankoption ||false;
	this.label = config.label || '';
	var me = this;
	if(this.country.length > 0) {
		rjQuery(this.country).on("change", function(event) {
			StateOptionsSwitcherHandler.onchange(me);
		});
	}
}

/**
 * Handle changes in country code.  Make call to database and repopulate
 * state dropdown.
 */
var StateOptionsSwitcherHandler = function() {
	function showSpinner(spinner) {
		rjQuery(spinner).show();
	};

	function hideSpinner(spinner) {
		rjQuery(spinner).hide();
	};

	return {
		onchange: function(switcher) {
			showSpinner(switcher.spinner);
			rjQuery.ajax({
				context: switcher,
				url: switcher.backendurl,
				data: {
					'country': (rjQuery(switcher.country).val() || 'US'),
					'req': 'getStates',
					'field': rjQuery(switcher.state).attr("id"),
					'isrequired': switcher.isrequired,
					'blankoption': switcher.blankoption,
					'label': switcher.label
				},
				success: function(html) {
					rjQuery(switcher.stateContainer).html(html);
				},
				complete: function() {
					hideSpinner(switcher.spinner)
				}
			});
		}
	};
}();
