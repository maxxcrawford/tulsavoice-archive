/**
 * issuearchive.js
 * 
 * Author: Peter Scannell
 * Date: December 2012
 * 
 * Issue archives should be centered in their pane, but, since they float,
 * there can be a lot of white space on the side.  This ensures that they
 * are centered
 * 
 */

var IssueArchives = (function() {

	return {
		centerIssueArchives: function centerIssueArchives() {
			// probably only one set, but...
			var archives = rjQuery(".issue-archive .issuelist.thumbnails");
			rjQuery.each(archives, function(index, archive) {
				var archiveWidth = rjQuery(this).innerWidth();
				var issueWidth = rjQuery(this).find(".issue").outerWidth();
				var numIssues = Math.floor(archiveWidth / issueWidth);
				var padding = (archiveWidth - (numIssues * issueWidth)) / 2;
				rjQuery(this).css("padding-left", padding);
			});
		}
	
	};
})();

WindowResizeResponder.register({
	"method": IssueArchives.centerIssueArchives,
	"when": "ready"
});
