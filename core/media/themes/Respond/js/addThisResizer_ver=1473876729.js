//if the screen is a media size on resize, remove the 32x32 class, otherwise add it
    
WindowResizeResponder.register({
    "method": addThisResizer,
    "when":"ready",
    "startDelay": 1000,
    "startupLoop": true
});


function addThisResizer(){
    try{
        var $share_tools = rjQuery(".share-tools");
        var $by_line = rjQuery(".by-line");
        var $date_published = rjQuery(".datepublished");
        var $counter = rjQuery(".addthis_counter");
        var $title = rjQuery(".share-tools").parent().children("h1");
        
        var width = rjQuery(document).width();
        
        
        
        if(typeof pagetools_page != 'undefined' && pagetools_page != "" && $share_tools.length != 0){ 
            if(pagetools_page == "article.tpl"){
                //we are on the article page
                //desired operation is as follows:
                //float to the right next to the byline.
                //if appearing under the byline, become block and move under the published date
                if(width <= ($share_tools.width() + 20) || width <= 320){
                    $counter.remove();
                }

                
                $share_tools.css("float", "right");

                //if date published is enabled
                if($date_published.length == 1){
                    $share_tools.css("position", "auto");
                    $share_tools.css("top", "auto");

                    $date_published.css("position", "auto");
                    $date_published.css("top", "auto");
                }
                    
                    
                //if the share tools appears under the byline, stop floating it
                if($by_line.length != 0 && $share_tools.position().top > $by_line.position().top || width <= 320){
                    $share_tools.css("float", "none");
                    
                    if($date_published.length == 1){
                        $share_tools.css("position", "relative");
                        $share_tools.css("top", "20px");
                        
                        $date_published.css("position", "relative");
                        $date_published.css("top", "-52px");
                    }
                }
            }
            else{
                
                //if width is not accurate, then items are still loading. return false
                if($share_tools.width() < $share_tools.children(".addthis_toolbox").children().length * 32){
                    return false;
                }
                
                //we are not on the article page.
                $share_tools.css("float", "right");
                
                if($share_tools.offset() && $title.offset() && $share_tools.offset().top > $title.offset().top){
                    $share_tools.css("float", "none");
                }
            }
        }
    }catch(e){
        console.log(e);
    }
    
    return true;
}