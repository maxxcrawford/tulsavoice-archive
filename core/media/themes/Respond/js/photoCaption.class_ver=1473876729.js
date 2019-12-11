/**
 * rivistaPhoto.class.js
 * 
 * automatically creates markup from a photo
 * 
 * requires jQuery
*/
rjQuery(document).ready(function($) {
	var $photos = rjQuery(".photo-caption");
	rjQuery.each($photos, function(index, photo) {
		var $newPhoto = rjQuery(photo).clone().removeClass();
		var $newCaption = rjQuery("<p>"+rjQuery(photo).attr("alt")+"</p>");
		var $newDiv = rjQuery("<div></div>")
			.addClass(rjQuery(photo).attr("class"))
			.width(rjQuery(photo).width())
			.append($newPhoto)
			.append($newCaption);
		rjQuery(photo).after($newDiv).remove();
	});
});

