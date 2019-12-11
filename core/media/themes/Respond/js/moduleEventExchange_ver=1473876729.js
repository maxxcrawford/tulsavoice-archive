/**
 * ModuleEventExchange
 * 
 * Javascript to make it easier for different modules to have a
 * centralized location to control communication between modules.
 * 
 * This is mostly so that it is easier for developers to know
 * what events are being thrown and listened to.
 * 
 */
var ModuleEventExchange = (function() {

	return {
		eventExchange: {
				"changeslide": [
					["body", "updateallads"]
				]
		},

		/**
		 * After a listed event (in eventExchange) is detected, determine what kind of event(s)
		 * to re-throw and trigger those events.
		 * 
		 * All listed events should be triggered on the "body".  Triggered events can be
		 * targeted if necessary.  If it is not clear what element should detect the
		 * triggered event, use "body".
		 * 
		 * @param event the event being detected
		 */
		triggerEvents: function(event) {
			rjQuery.each(ModuleEventExchange.eventExchange[event.type], function(index, eventType) {
				rjQuery(eventType[0]).trigger(eventType[1]);
			});
		},

		/**
		 * Register events with eventExchange.  This is usually not necessary, as it is
		 * better to list the events explicitly to make them easier to manage.
		 * This will ensure that if the event is already registered, it will not
		 * re-register the event.
		 * 
		 * @param parameters to use to populate an event and its triggers
		 */
		register: function(parameters) {
			parameters = rjQuery.extend(true, {
				"detectedEvent": null,		// event to be detected - triggered on body
				"element": "body",			// element that will get the triggered event
				"triggeredEvent": null		// event to trigger after detected event
			}, parameters || {});
			if (parameters.detectedEvent != null && parameters.triggeredEvent != null) {
				var newTrigger = [parameters.element, parameters.triggeredEvent];
				if (typeof ModuleEventExchange.eventExchange[parameters.detectedEvent] != "undefined") {
					var alreadyRegistered = false;
					rjQuery.each(ModuleEventExchange.eventExchange[parameters.detectedEvent], function(index, trigger) {
						if (rjQuery(newTrigger).not(trigger).length == 0) {
							alreadyRegistered = true;
							return false;
						}
					});
					if (!alreadyRegistered) {
						ModuleEventExchange.eventExchange[parameters.detectedEvent].push(newTrigger);
					}
				} else {
					ModuleEventExchange.eventExchange[parameters.detectedEvent] = [newTrigger];
				}
			}
			rjQuery("body").on(parameters.detectedEvent, function(event) {
				ModuleEventExchange.triggerEvents(event);
			});
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
	rjQuery.each(ModuleEventExchange.eventExchange, function(listener, targets) {
		rjQuery("body").on(listener, function(event) {
			ModuleEventExchange.triggerEvents(event);
		});
	});
});	
