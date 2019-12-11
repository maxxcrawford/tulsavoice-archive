
var req;
var xmldoc;
var isIE = false;
var listName;
var reqType=1; // listmode
var xmlbusy=false;
var appid=0;
function getItems(targetList,evt)
{
	  listName=targetList;
	  loadDoc(evt);
	  
}

// handles retrieved xml documents and puts them into a list box
// need to modify to allow further parsing by javascript
function handleXml()
{
	xmlbusy=false;
	switch(reqType)
	{
	 	 case 1: // list mode
	 	 {
		    clearList();
		    buildList();
		    break;
	 	 }
	 	 case 2:  // call back mode
	 	 {
	 	 		var x=getItemValue();
	 	 		return x;
		 	 	break;
	 	 }
	}	
	return true;
}

// handle onreadystatechange event of req object
function processReqChange() {
    // only if req shows "loaded"
    if (req.readyState == 4) {
        // only if "OK"
        if (req.status == 200) {
        	 return handleXml();
         } else {
            alert("There was a problem retrieving the XML data:\n" +
                req.statusText);
         }
    }
    return false;
}

function loadXMLDoc(url) 
{
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) 
    {
    	xmlbusy=true;
        req = new XMLHttpRequest();
        //req.onreadystatechange = processReqChange;
        req.open("GET", url, false);
        req.send(null);
        return processReqChange();
    // branch for IE/Windows ActiveX version
    } else if (window.ActiveXObject) {
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) 
        {
        	xmlbusy=false;
            //req.onreadystatechange = processReqChange;
	        req.open("GET", url, false);
	        req.send(null);
	        return processReqChange();
        }
    }
}


function getXmlDocument(params) {
    // equalize W3C/IE event models to get event object
          //  try {
                	// this is where our url gets pieced together
                	xmlurl="/core/xmlrpc.php?" + params + '&c=' + Math.random();
                   var x = loadXMLDoc(xmlurl);
	 	 		return x;
          //  }
          //  catch(e) {
         //      var msg = (typeof e == "string") ? e : ((e.message) ? e.message : "Unknown Error");
         //       alert("Unable to get XML data:\n" + msg);
         //       return;
         //   }
}



function loadDoc(elem) {
    // equalize W3C/IE event models to get event object
     if (elem) {
            try {
                if (elem.selectedIndex >= 0) {
                	// this is where our url gets pieced together
                	xmlurl="/core/xmlrpc.php?appid="  + appid + "&id=" + elem.options[elem.selectedIndex].value + '&c=' + Math.random();
                    loadXMLDoc(xmlurl);
                }	
            }
            catch(e) {
                var msg = (typeof e == "string") ? e : ((e.message) ? e.message : "Unknown Error");
                alert("Unable to get XML data:\n" + msg);
                return;
            }
        }
}

// retrieve text of an XML document element, including
// elements using namespaces
function getElementTextNS(prefix, local, parentElem, index) {
    var result = "";
    if (prefix && isIE) {
        // IE/Windows way of handling namespaces
        result = parentElem.getElementsByTagName(prefix + ":" + local)[index];
    } else {
        // the namespace versions of this method 
        // (getElementsByTagNameNS()) operate
        // differently in Safari and Mozilla, but both
        // return value with just local name, provided 
        // there aren't conflicts with non-namespace element
        // names
        result = parentElem.getElementsByTagName(local)[index];
    }
    if (result) {
        // get text, accounting for possible
        // whitespace (carriage return) text nodes 
        if (result.childNodes.length > 1) {
            return result.childNodes[1].nodeValue;
        } else {
            return result.firstChild.nodeValue;    		
        }
    } else {
        return "n/a";
    }
}

// empty select list content
function clearList() {
    var select = document.getElementById(listName);
    while (select.length > 0) {
        select.remove(0);
    }
}

// add item to select element the less
// elegant, but compatible way.
function appendToSelect(select, value, content) {
    var opt;
    opt = document.createElement("option");
    opt.value = value;
    opt.appendChild(document.createTextNode(content));
    select.appendChild(opt);
}

function getItemValue() {
    var select = document.getElementById(listName);
    var items = req.responseXML.getElementsByTagName("item");
    var value=null;

    if(items.length>0)
    {
        value=getElementTextNS("", "value", items[0], 0);
    }
    return value;
}

function buildList() {
    var select = document.getElementById(listName);
    var items = req.responseXML.getElementsByTagName("item");

    for (var i = 0; i < items.length; i++) {
        appendToSelect(select, 
        getElementTextNS("", "value", items[i], 0),
            getElementTextNS("", "text", items[i], 0));
    }
    //document.getElementById("details").innerHTML = "";
}

// display details retrieved from XML document
function showDetail(evt) {
    evt = (evt) ? evt : ((window.event) ? window.event : null);
    var item, content, div;
    if (evt) {
        var select = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
        if (select && select.options.length > 1) {
            // copy <content:encoded> element text for
            // the selected item
            item = req.responseXML.getElementsByTagName("item")[select.value];
            content = getElementTextNS("content", "encoded", item, 0);
            div = document.getElementById("details");
            div.innerHTML = "";
            // blast new HTML content into "details" <div>
            div.innerHTML = content;
        }
    }
}

function getList(listname,params)
{
	listName=listname;
	getXmlDocument(params);
}
