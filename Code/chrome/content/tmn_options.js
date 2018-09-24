// $Id: tmn_options.js,v 1.1 2009/05/18 01:15:53 dchowe Exp $ 

if(!PROFILEMENOT) var PROFILEMENOT = {};

const URL_TEST = /(https{0,1}):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;



window.addEventListener("load", function() { PROFILEMENOT.optionsTMN.onloadOptions(); }, false);



PROFILEMENOT.optionsTMN = function () { 
	
	   
        
     function rssErr(badUrl, last, textbox, button) {
			  var msg = "At least one of the following Urls appear to be invalid!\n\n";			
			  msg += "  "+badUrl+"\n\nPlease check your spelling and try again...";			
//			  try{
  //        alert(msg);	
    //    } catch(ex) {}		
			  textbox.value = last;  
			  button.label = PROFILEMENOT.optionsTMN.defaultsLabel();			
			  return false;		
		}

    
	
	return {
		
		
getOptionsTrackMeNot : function() {
	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot;
    if (tmn) return tmn;

    else alert("Options: No gTrackMeNot available!!!");

},

blackListChanged: function() {
    	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot;
        
        var blackListBox = document.getElementById("trackmenot-opt-kwBlackList");
        
        if ( blackListBox !="")
            tmn.dataTMN._kwBlackList = blackListBox.split(";"); 
        
        return;
},

rssTextChanged: function() 

{
    var win = PROFILEMENOT.utils._getRunningWindow();
    var tmn = win.PROFILEMENOT.gTrackMeNot;
    
    var rssTextbox = document.getElementById("trackmenot-opt-rssFeeds");
    
    if (!rssTextbox) tmn._clog("[XUL_WARN] no textbox: rssFeeds!");
    
    var rssStr = rssTextbox.value;
       
    var rssButton = document.getElementById("trackmenot-opt-rssButton");
    
    if (!rssButton) tmn._clog("[XUL_WARN] no button: rssButton!");
    
  
    // reset the textbox button   
    if (rssStr != tmn.dataTMN._rssFeedList) {
        
        //	  tmn._cout("new RSS Text: validate?");
        
        rssButton.label = PROFILEMENOT.optionsTMN.validateLabel();
        
    }    
    else   
    rssButton.label = PROFILEMENOT.optionsTMN.defaultsLabel();

},



/* validates rss feeds if they have changed, returns true 

   only if both a) they have changed and b) they are valid */

handleRssButtonClick: function() 

{
	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot;

  var current = tmn.dataTMN._rssFeedList;



  // get the textbox value

  var rssTextbox = document.getElementById("trackmenot-opt-rssFeeds");

  if (!rssTextbox) tmn._clog("[XUL_WARN] no textbox: rssFeeds!");

  var rssStr = rssTextbox.value;



  var rssButton = document.getElementById("trackmenot-opt-rssButton");

  if (!rssButton) tmn._clog("[XUL_WARN] no button: rssFeeds!");

	if (rssButton.label == PROFILEMENOT.optionsTMN.defaultsLabel())  // use defaults

  {

	  rssStr = tmn.dataTMN._rssFeedList = rssTextbox.value = tmn.dataTMN._defaultRssFeeds;

  }

	else // validate the url formats 

  {

//tmn._cout("[OPTIONS] checking rss formats!");

  	if (!rssStr) return rssErr(feeds[i], current, rssTextbox, rssButton);

    var feeds = rssStr.split(',');

    for (var i = 0;i < feeds.length; i++) {

	    if (!PROFILEMENOT.optionsTMN.isUrl(feeds[i]))

        return rssErr(feeds[i], current, rssTextbox, rssButton);

	  }

  }

//tmn._cout("[OPTIONS] making rss requests!");



  // grab queries from the feeds

  var rssQueries = null;

  try {

    rssQueries = tmn._fetchRssSynch(rssStr); 

  }

	catch (e) {

    return rssErr(e.message, current, rssTextbox, rssButton);

  }

	

  // if ok, update the feed-list, queries & textbox

  if (rssQueries && rssQueries.length>0) {

    tmn.dataTMN._rssFeedList = rssTextbox.value = rssStr; 	

		tmn.dataTMN.queries = rssQueries;

    tmn._padQueryList();

    tmn._writeSeedFile();

    tmn._cout("Query-list updated:\n"+tmn.dataTMN.queries); // say ok

  }

  else 

    return rssErr(rssStr, current, rssTextbox, rssButton);



	return true;

},








 isUrl: function(str) {

  if (str.indexOf(' ') >= 0)

    return false;

  return URL_TEST.test(str);

},



defaultsLabel: function() { return PROFILEMENOT.optionsTMN.$localize("tmn.rss.use-defaults"); },



validateLabel: function() { return PROFILEMENOT.optionsTMN.$localize("tmn.rss.validate"); },



$localize: function(name) {

  return document.getElementById("tmn-string-bundle").getString(name);

},



$localize: function(name) {

  return document.getElementById("tmn-string-bundle").getString(name);

},



$localizeFmt: function(name, args) {

  return document.getElementById("tmn-string-bundle")

   .getFormattedString(name, args);

},








onloadOptions: function() 

{
	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot;


//  alert("onload options");
  var checkbox = null;

  checkbox = document.getElementById("trackmenot-opt-enabled");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN.enabled);

  else tmn._log("[XUL_WARN] no checkbox: enabled");



  checkbox = document.getElementById("trackmenot-opt-showQueries");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN._showQueries);

  else tmn._log("[XUL_WARN] no checkbox: showQueries");







  checkbox = document.getElementById("trackmenot-opt-showStatus");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN._showStatus);

  else tmn._log("[XUL_WARN] no checkbox: showStatus");



  checkbox = document.getElementById("trackmenot-opt-logDisabled");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN._logDisabled);

  else tmn._log("[XUL_WARN] no checkbox: tmn.logDisabled");



  checkbox = document.getElementById("trackmenot-opt-logPreserved");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN._logPreserved);

  else tmn._log("[XUL_WARN] no checkbox: tmn.logPreserved");



  checkbox = document.getElementById("trackmenot-opt-burstEnabled");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.dataTMN._burstEnabled);

  else tmn._log("[XUL_WARN] no checkbox: burstEnabled");

  checkbox.addEventListener('click', PROFILEMENOT.optionsTMN.updateFrequencyMenu, true);



/*

  checkbox = document.getElementById("trackmenot-opt-cleanCookies");

  if (checkbox != null)

    checkbox.setAttribute("checked", tmn.cleanCookies);

  else tmn._log("[XUL_WARN] no checkbox: cleanCookies");

*/



  //var filepicker = document.getElementById("trackmenot-opt-seedfile");

  //if (filepicker != null) filepicker.value = tmn.seedFile;

   var blackListBox = document.getElementById("trackmenot-opt-kwBlackList");
        
   if ( blackListBox != null && blackListBox !="") {
            blackListBox.value = tmn.dataTMN._kwBlackList.join(","); 
   }
   else tmn._log("[XUL_WARN] no textBox: BlackListTextBox");

  var rssTextbox = document.getElementById("trackmenot-opt-rssFeeds");

  if (rssTextbox != null) rssTextbox.value = tmn.dataTMN._rssFeedList;

  else tmn._log("[XUL_WARN] no textBox: rssTextBox");



  var rssButton = document.getElementById("trackmenot-opt-rssButton");

  if (!rssButton) tmn._log("[XUL_WARN] no button: rssButton");

  if (rssButton.label.length<1) rssButton.label = PROFILEMENOT.optionsTMN.defaultsLabel();



  var list = document.getElementById("trackmenot-opt-engines");

  if (list != null)  {

    for (i = 0;i < list.childNodes.length; i++) {

      if (tmn.dataTMN._searchEngines.indexOf

        (list.childNodes[i].value)>-1)

          list.childNodes[i].selected=true;

    }

  }

  else tmn._log("[XUL_WARN] no engine-list");



	PROFILEMENOT.optionsTMN.setFrequencyMenu(tmn.dataTMN._timeout);

},



updateFrequencyMenu: function()

{
	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot;

  var checkbox = document.getElementById("trackmenot-opt-burstEnabled");

  if (checkbox != null)  
 {
    PROFILEMENOT.optionsTMN.setFrequencyMenu(checkbox.checked ? 360000 : tmn.dataTMN._timeout);

  } else  

    tmn._log("[XUL_WARN] no checkbox: burstEnabled");

},



setFrequencyMenu: function(timeout)

{
//     alert("Moi, le setFrquencyMenu est appelee");

  var menu = document.getElementById("trackmenot-opt-timeout");

  if (menu != null) {

    var menup = menu.childNodes[0];

    for (i = 0;i < menup.childNodes.length; i++) {

      if (menup.childNodes[i].value == timeout) {

        menu.selectedIndex=i;

        break;

      }  

    }

  }

  else tmn._log("[XUL_WARN] no menu-list: timeout");

},



saveOptions : function() {


	var win = PROFILEMENOT.utils._getRunningWindow();
	var tmn = win.PROFILEMENOT.gTrackMeNot; 



  checkbox = document.getElementById("trackmenot-opt-enabled");

  tmn.dataTMN.enabled = false;//checkbox.checked

  if (checkbox != null && checkbox.checked) {
//     alert(" step 1 check!");

    tmn.dataTMN.enabled = true;
  } else {
    var frame = tmn._win.document.getElementById("tmn-frame");
    if(frame )
      frame.parentNode.removeChild(frame);  
  }


  checkbox = document.getElementById("trackmenot-opt-showQueries");

  if (checkbox != null) 

    tmn.dataTMN._showQueries = checkbox.checked

  else tmn._clog("[XUL_WARN] no checkbox: showQueries");



  checkbox = document.getElementById("trackmenot-opt-showStatus");

  if (checkbox != null) 

    tmn.dataTMN._showStatus = checkbox.checked

  else tmn._clog("[XUL_WARN] no checkbox: showStatus");



  checkbox = document.getElementById("trackmenot-opt-logDisabled");

  if (checkbox != null) {

    tmn.dataTMN._logDisabled = checkbox.checked;

  }  

  else tmn._clog("[XUL_WARN] no checkbox: tmn.logDisabled");



  checkbox = document.getElementById("trackmenot-opt-logPreserved");

  if (checkbox != null) {

    tmn.dataTMN._logPreserved = checkbox.checked;

  }  

  else tmn._clog("[XUL_WARN] no checkbox: tmn.logPreserved");



  checkbox = document.getElementById("trackmenot-opt-burstEnabled");

  if (checkbox != null) {

    tmn.dataTMN._burstEnabled = checkbox.checked;

  }  

  else tmn._clog("[XUL_WARN] no checkbox: burstEnabled");



/*

  checkbox = document.getElementById("trackmenot-opt-cleanCookies");

  if (checkbox != null) {

    tmn.cleanCookies = checkbox.checked;

  }  

  else tmn._clog("[XUL_WARN] no checkbox: cleanCookies");

*/



  // TODO: Move logic to button.oncommand 

  if (tmn.dataTMN._logPreserved && tmn.dataTMN.logDisabled)

    tmn.dataTMN._logPreserved = false;


   var blackListBox = document.getElementById("trackmenot-opt-kwBlackList");
        
   if ( blackListBox != null && blackListBox !="") {
            tmn.dataTMN._kwBlackList = blackListBox.value.split(","); 
            tmn._log("[XUL] new keywords black-list = "+tmn.dataTMN._kwBlackList );
   }



  var rssTextbox = document.getElementById("trackmenot-opt-rssFeeds");

  if (rssTextbox != null) tmn.dataTMN._rssFeedList = rssTextbox.value;

  else tmn._log("[XUL_WARN] no textBox: rssTextBox");



  //var filepicker = document.getElementById("trackmenot-opt-seedfile");

  //if (filepicker != null) tmn.dataTMN.seedFile = filepicker.value;



  var engines = '';

  var list = document.getElementById("trackmenot-opt-engines");

  if (list != null)  {

    for (i = 0;i < list.childNodes.length; i++) {

      if (list.childNodes[i].selected)

        engines += list.childNodes[i].value+",";

    }

  } else tmn._clog("[XUL_WARN] no engine-list");



  if (engines.length>0)

    engines=engines.substring(0,engines.length-1);

  else {

    engines = "msn"; // TODO: error-dialog here?

    tmn.dataTMN.enabled = false;

  }

  tmn.dataTMN._searchEngines = engines;


  
  var enginesNumber = engines.split(",").length;
  var menu = document.getElementById("trackmenot-opt-timeout");
  if (menu != null)  
   {
	if ( menu.selectedItem.value *  enginesNumber < 20000 && 
			!tmn.dataTMN.burstEnabled) {
	  tmn.dataTMN._timeout = Math.floor( 20000 / enginesNumber );
	//  alert (" The frequency has been set to " + (Math.floor(600000/tmn.dataTMN._timeout)/10) 
	//  		  + " queries per minute to avoid spam detection" ); 
    } else 
	  tmn.dataTMN._timeout = menu.selectedItem.value;
  }
  else tmn._clog("[XUL_WARN] no menu: timeout");



  tmn._saveOptions();

},



showSeeds : function () { PROFILEMENOT.optionsTMN.getOptionsTrackMeNot()._showSeeds(); },



showLog : function () { PROFILEMENOT.optionsTMN.getOptionsTrackMeNot()._showLog(); },

showFrame : function () { PROFILEMENOT.optionsTMN.getOptionsTrackMeNot()._switchFrameVisibility(); },


clearLog : function() {

  PROFILEMENOT.optionsTMN.getOptionsTrackMeNot()._clearLog();

  alert("TrackMeNot log cleared.");

},



setAllEngines : function(state) {

  var list = document.getElementById("trackmenot-opt-engines");

  // change to list.selectAll(); // ?

  if (list != null)  {

    for (i = 0;i < list.childNodes.length; i++) {

      list.childNodes[i].selected=state;

    }

  }

  else tmn._clog("[XUL_ERROR] No list-element for engines!");

},




};

}();


