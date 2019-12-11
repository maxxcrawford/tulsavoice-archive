/* For doing fancy things with calendar search results */
/* Requires dateparse.js for parseDateString() */

var CalendarEventSearcher = {

	cropEventCategories: function cropEventCategories() {
		var $categoryGroups = rjQuery('.event-categories');

		$categoryGroups.each( function () {
			$this = rjQuery(this);
			var containerWidth = $this.width() - $this.parent().find('.calendar-list-image').outerWidth(true);
			var $categories = $this.find('.event-category').hide();
			var totalWidth = 0;
			$categories.each( function () {
				$this = rjQuery(this);
				if(totalWidth + $this.outerWidth(true) < containerWidth) { // Can we fit the next category here?
					$this.show();
					totalWidth += $this.outerWidth(true);
				} else { // Nope. We can't. Don't show any more categories.
					totalWidth = containerWidth; 
				}
			});
		});
	},

	updateDateRange: function updateDateRange() {
		$searchFiltersForm = rjQuery(this).parents('.calendar-search-filters-form');
		$startDateField = $searchFiltersForm.find('input[name="startdate"]');
		$endDateField = $searchFiltersForm.find('input[name="enddate"]');
		$this = rjQuery(this);
		startDate = new Date();
		endDate = new Date();
		switch($this.val()){
			case "Today":
				startDate = parseDateString("today");
				endDate = parseDateString("today");
				break;
			case "Tomorrow":
				startDate = parseDateString("tomorrow");
				endDate = parseDateString("tomorrow");
				break;
			case "This Weekend":
				if(startDate.getDay() > 0 && startDate.getDay() < 6) { // It's a weekday. Get next weekend.
					startDate = parseDateString("next Saturday");
					endDate = parseDateString("next Sunday");
				} else if (startDate.getDay() == 6) { // It's Saturday! WOO!
					startDate = parseDateString("today");
					endDate = parseDateString("next Sunday");
				} else { // It's Sunday.
					startDate = parseDateString("today");
					endDate = parseDateString("today");
				}
				break;
			case "Next 7 Days":
				startDate = parseDateString("today");
				endDate = parseDateString("today");
				endDate.setDate(endDate.getDate() + 7);
				break;
			case "Next 30 Days":
				startDate = parseDateString("today");
				endDate = parseDateString("today");
				endDate.setDate(endDate.getDate() + 30);
				break;	
			case "Specific Date Range":
				break;			
			case "All":
			default:
				startDate = parseDateString("today");
				endDate = parseDateString("today");
				endDate.setFullYear(endDate.getFullYear() + 10);
				break;	
		}

		$startDateField.val(startDate.getFullYear() + "-" + ("0" + (parseInt(startDate.getMonth()) + 1 )).slice(-2) + "-" + ("0" + startDate.getDate()).slice(-2));
		$endDateField.val(endDate.getFullYear() + "-" + ("0" + (parseInt(endDate.getMonth()) + 1 )).slice(-2) + "-" +  ("0" + endDate.getDate()).slice(-2));

	},

	customDateRange: function customDateRange() {
		rjQuery(this).parents('.calendar-search-filters-form').find('select[name="date_range"]').val("Specific Date Range");
	}
};

WindowResizeResponder.register({
	"method": CalendarEventSearcher.cropEventCategories,
	"when": "ready"
});

rjQuery(document).ready( function() {
	rjQuery('select[name="date_range"]').on('change', CalendarEventSearcher.updateDateRange);
	rjQuery('input[name="startdate"]').on('change', CalendarEventSearcher.customDateRange);
	rjQuery('input[name="enddate"]').on('change', CalendarEventSearcher.customDateRange);
});
