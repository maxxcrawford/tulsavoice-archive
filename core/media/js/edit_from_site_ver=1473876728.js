rjQuery(document).ready(function(){
	AdminEditLinks.init();
});


var AdminEditLinks = (function(){
	var transitionSpeed = 300;
	var utilitiesVisible = false;

	function buildHTML(){
		if(pagetype == "evergeen" || pagetype == "article"){
			var edit_string_name = "string_admin_edit_pagetype_article";
			var mapKey = pagetype;
		}
		else{
			// default values for editor title and editor type
			edit_string_name = "string_admin_edit_pagetype_content";
			mapKey = "content";
		}
		if(rjQuery.type(editorIdMap) === "object" && editorIdMap.hasOwnProperty(mapKey)){
			var edit_mid = editorIdMap[mapKey].mid;
			var edit_view = editorIdMap[mapKey].view;
		}
		else{
			// hard-code values in case we can't find anything
			// this should be set in rivista.php, but we check again
			edit_mid = 1360;
			edit_view = "edit_page";
		}
		var pageEditorLink = '';
		pageEditorLink += '<div class="top-button-bar">';


		if(pagetype != 'cde_record'){
			pageEditorLink += '<a id="edit_page_from_site" class="top_button"';
			pageEditorLink += ' target="' + rjQuery('body').attr('id') + '"';
			pageEditorLink += ' href="/admin/pages/Publishing/index.php?mid=' + edit_mid + '&view=' + edit_view;
			pageEditorLink += '&itm=' + rjQuery('body').attr('id').replace('page_htmlid_', '').replace('page_', '') + '"';
			pageEditorLink += ' title="edit page">';
			pageEditorLink += '<span class="top-button-label">';
			pageEditorLink += RivistaJSString.get(edit_string_name)
			pageEditorLink += '</span>';
			pageEditorLink += '</a>';
		}

		//This Page
		pageEditorLink += '<span id="clear-cache-label" class="top_button">clear page cache:</span><a';
		pageEditorLink += ' id="clear_this_page_cache" class="top_button"';
		pageEditorLink += ' href="?clearcache=currentpage"';
		pageEditorLink += ' title="clear page cache for this page">';
		pageEditorLink += '<span class="top-button-label">this&#160;page</span>';
		pageEditorLink += '</a>';
		
		//Entire Site
		pageEditorLink += '<a';
		pageEditorLink += ' id="clear_all_page_cache" class="top_button"';
		pageEditorLink += ' href="?clearcache=page"';
		pageEditorLink += ' title="clear page cache for entire site">';
		pageEditorLink += '<span class="top-button-label">entire&#160;site</span>';
		pageEditorLink += '</a>';
		
		
		
		
		username = RivistaUtils.getCookie("screenname");
		if(username == "godengosuper"){
			//Image Cache
			pageEditorLink += '<a';
			pageEditorLink += ' id="clear_all_image_cache" class="top_button"';
			pageEditorLink += ' href="?clearcache=images"';
			pageEditorLink += ' title="clear image and page cache for entire site">';
			pageEditorLink += '<span class="top-button-label">clear&#160;image&#160;cache</span>';
			pageEditorLink += '</a>';
		}
		
		
		pageEditorLink += '</div>';

		return pageEditorLink;
	};

	function revealShortcuts(){
		rjQuery('#page_editing_utilities_trigger').addClass('on');
		rjQuery('a.edit_from_site').animate({'width': '100px'}, transitionSpeed);
		rjQuery('div.top-button-bar').animate({'width': '100%'}, transitionSpeed);
		rjQuery('#edit_page_from_site').animate({'width': '100px'}, transitionSpeed);		
		rjQuery('#clear-cache-label').animate({'width': '130px'}, transitionSpeed);
		rjQuery('#clear_this_page_cache').animate({'width': '86px'}, transitionSpeed);
		rjQuery('#clear_all_page_cache').animate({'width': '86px'}, transitionSpeed);
		rjQuery('#clear_all_image_cache').animate({'width': '146px'}, transitionSpeed);
		rjQuery('.top_button').show();
	};

	function hideShortcuts(){
		rjQuery('#page_editing_utilities_trigger').removeClass('on');
		rjQuery('a.edit_from_site, .top_button, div.top-button-bar').animate({'width': '0px'}, transitionSpeed);
		rjQuery('.top_button').hide();
	};


	function toggleUtilities(){
		if(utilitiesVisible == true){
			utilitiesVisible = false;
			hideShortcuts();
		}
		else{
			utilitiesVisible = true;
			revealShortcuts();
		}
	};

	function showTags(moduleid, contentid){
		if(typeof RivistaAjax == "undefined"){
			rjQuery.getScript('/core/media/js/Rivista_ajax.js', function(){
				RivistaAjax.getModuleTags(moduleid, contentid, function(response){
					alert("tagids: " + response.responseText);
				});
			});
		}
		else{
			RivistaAjax.getModuleTags(moduleid, contentid, function(response){
				alert("tagids: " + response.responseText);
			});
		}
	};
	
	
	return{
		init: function(){
			//if this is an admin user then display the bar, otherwise do not
			var admincookie = RivistaUtils.getCookie("admincookie");
			if(admincookie === null || admincookie == "false"){
				return;
			}
			
			
			rjQuery('body').prepend('<a href="#" id="page_editing_utilities_trigger"></a>');

			rjQuery('body').prepend(buildHTML());

			rjQuery('a.edit_from_site').each(function(index, anchor){
				var mediaID = this.getAttribute('media_id');
				var contentID = this.getAttribute('content_id');
				
				if(rjQuery.type(editorIdMap) === "object" && editorIdMap.hasOwnProperty(mediaID)){
					this.href = '/admin/pages/Publishing/index.php?mid=' + editorIdMap[mediaID].mid + '&view=' + editorIdMap[mediaID].view + '&itm=' + contentID;
					this.target = 'edit_' + contentID;
					if (rjQuery(this).hasClass('tags_from_site')){
						rjQuery(this).mouseenter(function(e){
							rjQuery(this).next().addClass('edit_from_site_hover_affected_element');
						});
						rjQuery(this).mouseleave(function(e){
							rjQuery(this).next().removeClass('edit_from_site_hover_affected_element');
						});
					}
					else{
						rjQuery(this).mouseenter(function(e){
							rjQuery(this).nextAll().eq(1).addClass('edit_from_site_hover_affected_element');
						});
						rjQuery(this).mouseleave(function(e){
							rjQuery(this).nextAll().eq(1).removeClass('edit_from_site_hover_affected_element');
						});
					}
				}
				else{
					rjQuery(this).remove();
				}
			});

			rjQuery('#page_editing_utilities_trigger').click(function(e){
				e.preventDefault();
				toggleUtilities();
			});

			rjQuery('a.tags_from_site').click(function(e){
				e.preventDefault();
				showTags(e.target.getAttribute('media_id'), e.target.getAttribute('content_id'));
			});
		},
	}
})();