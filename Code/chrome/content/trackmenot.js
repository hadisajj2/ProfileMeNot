// $Id: trackmenot.js,v 1.1 2009/05/18 01:15:53 dchowe Exp $

/*
    TODO:  
    NEW FEATURES: (v0.7)
    3) re-implement user-supplied query lists, both with and w'out 
       evolution  (POSTPONE FOR NOW)

    TESTS FOR RSS-FEEDS (check error console after each):
            1)  Clean-load (delete seed file before starting ff)
            2)  Regular-load (should load one RSS feed and add to list)
            3)  Validate-load (change rss feeds in options menu & push 'validate' 
            4)  Reset-load (push 'Use-Defaults' in options menu) 
            5)  Locale-load (change feeds in trackemenot.properties & do #4 above)
            6)  Static-load (turn off network and do #1-#4 above)
*/
if (!PROFILEMENOT) var PROFILEMENOT = {};


// ------------------------- CODE --------------------------------

PROFILEMENOT.gTrackMeNot = function () {
  //    alert("gTrackMeNot!");
      // properties
      var ci = null;
      var cc = null;
      var comps = null;
    	var running = false;
      var gtmn = null; /*Initial gtmn*/
      var checkWhereWeAre = 0;
      var searchC = 0;
      var countOnIncomingResponse = 0;
      var observeCounter = 0;
      var onOutGoingCounter = 0;
      var onIncomingCounter = 0;
      var onIncomingCounterCallFromObserver = 0;
      var scheduleNextSearch = 0;
      var tabHasBeenShown = 0;
  //  var _repProc2 = null;
      

      // ----- Initial Seed List From Various 'Top/Recent Searches' --------
      var DEFAULT_SEED_LIST = new Array("facebook","youtube","myspace","craigslist","ebay","yahoo","walmart","netflix","amazon","home depot","best buy","Kentucky Derby","NCIS","Offshore Drilling","Halle Berry","iPad Cases","Dorothy Provine","Emeril","Conan O'Brien","Blackberry","Free Comic Book Day"," American Idol","Palm","Montreal Canadiens","George Clooney","Crib Recall","Auto Financing","Katie Holmes","Madea's Big Happy Family","Old Navy Coupon","Sandra Bullock","Dancing With the Stars","M.I.A.","Matt Damon","Santa Clara County","Joey Lawrence","Southwest Airlines","Malcolm X","Milwaukee Bucks","Goldman Sachs","Hugh Hefner","Tito Ortiz","David McLaughlin","Box Jellyfish","Amtrak","Molly Ringwald","Einstein Horse","Oil Spill"," Bret Michaels","Mississippi Tornado","Stephen Hawking","Kelley Blue Book","Hertz","Mariah Carey","Taiwan Earthquake","Justin Bieber","Public Bike Rental","BlackBerry Pearl","NFL Draft","Jillian Michaels","Face Transplant","Dell","Jack in the Box","Rebbie Jackson","Xbox","Pampers","William Shatner","Earth Day","American Idol","Heather Locklear","McAfee Anti-Virus","PETA","Rihanna","South Park","Tiger Woods","Kate Gosselin","Unemployment","Dukan Diet","Oil Rig Explosion","Crystal Bowersox","New 100 Dollar Bill","Beastie Boys","Melanie Griffith","Borders","Tara Reid","7-Eleven","Dorothy Height","Volcanic Ash","Space Shuttle Discovery","Gang Starr","Star Trek","Michael Douglas","NASCAR","Isla Fisher","Beef Recall","Rolling Stone Magazine","ACM Awards","NASA Space Shuttle","Boston Marathon","Iraq","Jennifer Aniston"); 
      var minQueriesInQueryList = Math.min(100, DEFAULT_SEED_LIST.length);
      var DEFAULT_SEED_FILE = "tmn_seeds.txt";
      var DEFAULT_URL_LIST = "pmn_urls.txt";


    
      function _cleanClickHistory()  {
  //          alert("step 1 " + checkWhereWeAre++) ;
        if (gtmn.dataTMN._dbug) gtmn._cout("CLEAN_search_history");   
        while ( gtmn.dataTMN._clickHistory.length > gtmn.dataTMN._maxHistoryLength )
             gtmn.dataTMN._clickHistory.shift();  
        var tmp = new Array();
        for ( var i in gtmn.dataTMN._clickHistory ) {
          if ( gtmn.dataTMN._clickHistory[i])
            tmp.push(gtmn.dataTMN._clickHistory[i]);
        }
        gtmn.dataTMN._clickHistory = tmp;
      }
  
  
      function _getEngineForUrl(url) {
  //          alert("step 2 " + checkWhereWeAre++);
        var eng = null, result = null;
        for (var en in gtmn.dataTMN._regexMap){
	      //gtmn._cout(url)
          var regex = gtmn.dataTMN._regexMap[en];
         // gtmn._cout("  regex: "+regex+"  ->\n                   "+url);
          result = url.match(regex);
          if (result)  {
            var eng = en;
            //gtmn._cout(regex + " MATCHED! on "+eng );
            break; 
          }
        }   
        return eng;
      }
      /* 
       * checks url against regex patterns in regexMap
       */	  
      function _checkForSearchUrl(url) {
 //     alert("step 3 " + checkWhereWeAre++);
        var result = null;
        for (var en in gtmn.dataTMN._regexMap){
	      //gtmn._cout(url)
          var regex = gtmn.dataTMN._regexMap[en];
         // gtmn._cout("  regex: "+regex+"  ->\n                   "+url);
          result = url.match(regex);
          if (result)  {
            var eng = en;
            //gtmn._cout(regex + " MATCHED! on "+eng );
            break; 
          }
        }
        if (!result)return null;
        
  	    if (result.length !=4 ){
    		  if (result.length ==6 && eng == "google"  ) {
    			  result.splice(2,2);
    			  result.push(eng);
    			  return result;
    		  }
    	      this._clog("REGEX_ERROR: "+url);
    	      for (var i in result)
    	        gtmn._cout(" **** "+i+")"+result[i])
	      }

        // add the matched engine 
        result.push(eng);
    
        return result;
      }
    
      function _arrayIndex(arr, elem) {
//      alert("step 4 " + checkWhereWeAre++);

        for (var i in arr) {
          //cout("    checking '"+arr[i]+"'");
          if (arr[i] == null)continue;
          if (elem == arr[i] || (arr[i][0] && elem == arr[i][0])) 
            return i;
        }
        return -1;
      }
      
      function openADMFile(local_name) {
//      alert("step 5 " + checkWhereWeAre++);
        var dist_file = PROFILEMENOT.utils.getProfileDir().clone();
	      dist_file.append("ADMONITOR");
	      if( !dist_file.exists() || !dist_file.isDirectory() ) 
	   	     return null;
	   	  dist_file.append(local_name);
	   	  return dist_file; 
     } 
     
      function getFileString(local_name) {
        try {
          var file = openADMFile(local_name);
          var data = "";  
          var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                  .createInstance(Components.interfaces.nsIFileInputStream);
          var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                  .createInstance(Components.interfaces.nsIScriptableInputStream);
          fstream.init(file, -1, 0, 0);
          sstream.init(fstream);        
          var str = sstream.read(4096);
          while (str.length > 0) {
            data += str;
            str = sstream.read(4096);
          }        
          sstream.close();
          fstream.close();
        } catch (ex) {
          data = null;
        }
        return data; 
    } 
	
	
	  function _loadStat() {
        var statString = getFileString('stat');
        try {
          gtmn.dataTMN._termStat = JSON.parse(statString);
        } catch (ex) {gtmn._cout(ex)}
      }
      
      function _loadDist() {
        var distString = getFileString('hourly_dist');
        try {
          gtmn.dataTMN._timeDist = JSON.parse(distString);
        } catch (ex) {gtmn._cout(ex)}
      }
                       
      function _inTmnSearchHistory(oHttp) {
	  	try {
			var frame = window.document.getElementById("tmn-frame");
			if (!frame) 
				return false;
			var frameDocument = frame.contentDocument
			var urlDocument = _getDocIdForHttpChannel(oHttp)
			//if (gtmn.dataTMN._dbug) gtmn._cout( 'frame location' + frame.contentDocument.location.href + 'History : ' + urlDocument.location.href)
			return (urlDocument.location.href == frame.contentDocument.location.href)
		} catch (ex) { 
			gtmn._cout('TMN error : '+ ex);
			return true;
		}
      }
      
      function _intmn_clickHistory(url, cleanup) {
        var idx = _arrayIndex(gtmn.dataTMN._clickHistory, url);  
        if (idx < 0) return false;
    
        // only cleanup on responses/not requests
        if (!cleanup) return true;
    
        if (idx == 0) // remove the found query
          gtmn.dataTMN._clickHistory.shift();
       else 
         gtmn.dataTMN._clickHistory[idx] = null; 
           

    
        // clean up the list periodically
        if (gtmn.dataTMN._clickHistory.length > gtmn.dataTMN._maxHistoryLength)
          _cleanClickHistory();
    
        return true;
      }

       function _blockOutgoingReferer(oHttp) {// nsIHttpChannel
        oHttp.setRequestHeader("Referer", null, false); 
        oHttp.referrer = null;
       }
       
       function getWinFromChannel(aRequest) {
       
            var loadContext;
            try {
              loadContext =  aRequest.QueryInterface(Components.interfaces.nsIChannel)
                        .notificationCallbacks
                        .getInterface(Components.interfaces.nsILoadContext);
            } catch (ex) {
              try {
                loadContext =
                  aRequest.loadGroup.notificationCallbacks
                          .getInterface(Components.interfaces.nsILoadContext);
              } catch (ex) {
                loadContext = null;
              }
            }
           if ( loadContext){
            return loadContext.associatedWindow; 
          } else {
            return null;
          }
      }
            

       
        function _isSafeHost( host_) {
            if ( host_ == 'rds.yahoo.com') return true;
            for each ( var regex in gtmn.dataTMN.hostMap) {
                  if ( host_.match(regex) )
                    return true;
            }
            return false;
        }

       function _onOutgoingRequest(oHttp)// nsIHttpChannel
       {        
          var url = oHttp.URI.asciiSpec;
          var host = oHttp.URI.host;
     //     alert("host is : " + host);
        // BLOCK THE REFERER IF SPECIFIED
        if (gtmn.dataTMN._hideReferer){ 
          oHttp.setRequestHeader("Referer", null, false); 
          oHttp.referrer = null;
        } 
    
      
        var win_ = getWinFromChannel(oHttp);
        if ( win_ != null) {
          var doc = win_.document;
          var tmn_doc = document.getElementById("tmn-frame").contentDocument;
          // OR IF ITS A TMN-GENERATED CLICK-THROUGH       
          if ( /*doc==tmn_doc ||*/ _intmn_clickHistory(oHttp.URI.asciiSpec, false) ) {
            if ( !_isSafeHost(host)  ) {
              gtmn._cout("Blocked ougoing connection to: "+ host)
              var req =  oHttp.QueryInterface(ci.nsIRequest)
    		      req.cancel(Components.results.NS_BINDING_ABORTED);
    		      gtmn.dataTMN._referer =  url;
    		    } 
    		  
            return; 
            // removed - DCH (we may still want to handle the cookie below)
          }
        }
        
      
     
    
        if (gtmn.dataTMN._dbug){ 
          gtmn._cout("OUTGOING: "+url);
          try {
            cookie = oHttp.getRequestHeader("Cookie");
            cout("  COOKIE: "+cookie);
            return;  
          } catch (e){}
        }
    
        // ONLY CHECK THE COOKIE IF REQUEST WAS A SEARCH
        if (!_checkForSearchUrl(url)){
          if (gtmn.dataTMN._dbug)cout("SKIPPING COOKIE (NOT A SEARCH): "+url);
          return;
        }
        

    
        // OK, ITS A REAL USER-SEARCH LETS BLOCK IT
        if (gtmn.dataTMN._dbug)cout("USER-SEARCH!!!!!!!!: "+url);
        _blockOutgoingCookie(oHttp); 
      }
    
      function _blockOutgoingCookie(oHttp)  { // nsIHttpChannel
        if (gtmn.dataTMN._dbug) {
          var cookie = null;
          try {
            cookie = oHttp.getRequestHeader("Cookie");
            gtmn._cout("OUTGOING-COOKIE: "+cookie);
          } 
          catch (e){
            _clog("[WARN] No Cookie for: "+oHttp.URI.asciiSpec+"\n"+e.message);
            return;
          } 
        }
        _logCookieAction(oHttp.URI.asciiSpec,"request");
        oHttp.setRequestHeader("Cookie", null, false); 
      }
    
      function _logCookieAction(url, type) { // nsIHttpChannel
        var maxUrlLogLen = 40;
        if (url.length > maxUrlLogLen)
          url = url.substring(0,maxUrlLogLen-3)+"...";
       gtmn._log("[COOKIE] action=blocked | type="+type+" | url="+url);
      }
          
    function _updateQueryList(terms)   {  
	    if (!terms || terms.length < 1) return;
	
	    var newQuery = terms[Math.floor(Math.random()*terms.length)];
	    var subIdx = Math.floor(Math.random()*gtmn.dataTMN._queries.length);
	  
	    var old = gtmn.dataTMN._queries[subIdx];
	    if (_addQuery(newQuery, gtmn.dataTMN._queries, subIdx, true)) {
	          /*cout("[INFO] Replaced queries["+subIdx+"]='"
	          + old + "' -> '" + tmn.queries[subIdx] + "'");*/
	         // every so often write to disk if we've made a change
	      var elapsed = new Date().getTime() - gtmn.dataTMN._lastSeedFileWriteTime;
	      if (elapsed  > 300000.0) { // at most 1 per 5 min
	        //cout("[INFO] Writing Seed file("+tmn.queries.length
	         // + "): " + new Date()+ "\n" + tmn.queries);
	        gtmn._writeSeedFile("updateQueryList");
	      }
	    }
    }
    
    
    function _getCurrentMapDist() {
       if (!gtmn.dataTMN._timeDist) return null;
       var date = new Date();
       var today = new Date(date.getTime() );
       var day = today.getDay();
       var hour = today.getHours();
       if ( day == 0 || day ==6 ) return gtmn.dataTMN._timeDist.weekend[hour];
       else   return gtmn.dataTMN._timeDist.week[hour];  
    }
    
    function _computeDelay() {
      
       if (!gtmn.dataTMN._timeDist) return gtmn.dataTMN._timeout;
       
       var mapday =_getCurrentMapDist();
       var total = 0;     
       for each (var freq in mapday)
          total += freq;
      
       gtmn._cout("Last week freq: "+ total + " queries per hour");
  //     alert("delay is : " + 3600000/(total*2));
       return 3600000/(total*2);
    
    }
    
    
       
        // Start of TAB changes
   function _reschedule(html, httpChannel) {
     //    alert("Reschedule " + checkWhereWeAre++);
         var _window = null;
         var delay =  _computeDelay();
         

         if (!gtmn.dataTMN.enabled) {
            gtmn._updateStatusText();
            return false;
          }
          if (_isBursting())  // schedule for burst
          {
        

            var delay = Math.min(delay,gtmn.dataTMN._burstTimeout);
            _scheduleNextSearch(delay);
            gtmn.dataTMN._burstCount--;
           
            //if (tmn.burstCount <= 0)// Burst done
              //cout("BURST_MODE_COMPLETE!");
          }
          else  // Not bursting, schedule per usual
          { 
            // parse html & update query-list (only when not in burst)
            try {
         //          alert("step 1");
                    html = html.documentElement.innerHTML;
              //      alert(html);
          //    if(Math.random() > 0.9){
          //        alert("step 2");
            //      PROFILEMENOT.TMNSearch.extractLinks(html);
           //       alert("step 3");
         //     }
              
            } catch (ex) {
        //          alert("step 4");
                    gtmn._cerr("unable to get html content ")
            }
            if (html  && gtmn.dataTMN._evolveQueryList && (Math.random() < gtmn.dataTMN._substitutionProb)) 
            {
                  html = html.replace(/(&nbsp;)/gi," ");
                  var newQueries = _extractQueries(html, gtmn.dataTMN._query);
                  _updateQueryList(newQueries); 
            }
            _scheduleNextSearch(delay);
          }
   }
   
  
    function _getDocIdForHttpChannel(httpChannel)     { // source of the function : http://forums.mozillazine.org/viewtopic.php?p=2774976           
         var interfaceRequestor = null
         var doc = null;
         
         if(! httpChannel.notificationCallbacks) {
              if(httpChannel.loadGroup && httpChannel.loadGroup.notificationCallbacks)
                interfaceRequestor= httpChannel.loadGroup.notificationCallbacks.QueryInterface(ci.nsIInterfaceRequestor);
        }         
        if ( httpChannel.notificationCallbacks )
           interfaceRequestor = httpChannel.notificationCallbacks.QueryInterface(ci.nsIInterfaceRequestor);
 
        if ( interfaceRequestor ) {
            try {
              doc = interfaceRequestor.getInterface(ci.nsIDOMWindow).document;
               return(doc);
             } catch (ex) {
                 return null
             }
        }
        else {
         return(doc);
       }
     }
	 
	 
	 function _clearHistoryList( ) {
	 	if (gtmn.dataTMN._searchHistory.length==0) return;
	 	if (gtmn.dataTMN._dbug) gtmn._cout("TMN: Cleaning searched url  history list");
		var historyService = cc["@mozilla.org/browser/nav-history-service;1"]
                               .getService(ci.nsIBrowserHistory);	    
		try {
			historyService.removePages(gtmn.dataTMN._searchHistory, gtmn.dataTMN._searchHistory.length,false);
		} catch (ex) {gtmn._cout(ex)}
	 }

	 function _putURLinRemoveHistoryList( url ) {
	 	if (gtmn.dataTMN._dbug) gtmn._cout("TMN: Adding a searched url to the history list: " + url);	    
		try {//We first clear the previous searches from the hisotry thus being sure that there is one  url in the domhistory.
			// Should be fixed for history length to be randomized
			_clearHistoryList(gtmn.dataTMN._searchHistory);
			var uri = makeURI(url);
			gtmn.dataTMN._searchHistory.push(uri);
		} catch (ex) {gtmn._cout(ex)}
	 }

      
       function _onIncomingResponse(oHttp)// nsIHttpChannel
      {
 //           alert("step 6 " + checkWhereWeAre++);

      //   alert("onIncomingResponse" + countOnIncomingResponse++);
 //     alert(oHttp.getRequestHeader);
         //   alert("We are here");
    //        alert(oHttp.request);
          countOnIncomingResponse++;
        var url = oHttp.URI.asciiSpec;
        var host = oHttp.URI.host;    
       
          
       
        // if(Math.random() > 0.7){alert(host);}
       // if (gtmn.dataTMN._dbug) gtmn._cout('Incoming reponse: '+url);
       /*sorry.google.com appears when Google asks for human verification -HS*/
        if ( host.match("sorry.google.[a-z]*") ) {
            var uriArray = oHttp.URI.asciiSpec.split("continue=");
            var spamedQuery = decodeURIComponent(uriArray[1]);
            if ( _inTmnSearchHistory(oHttp) ) {
                enabled = false
                PROFILEMENOT.utils.showSpamDialog();
                alert("Google being wise! sorry.Google");
            }
         }
         
         
       
         if ( _intmn_clickHistory(oHttp.URI.asciiSpec, false) ) {
            try {gtmn.dataTMN._referer = oHttp.getResponseHeader('Location');} 
            catch (ex) {gtmn._cout(ex)}
            var req =  oHttp.QueryInterface(ci.nsIRequest) 
            req.cancel(comps.results.NS_BINDING_ABORTED);
            return;
        }
                 
        // -- WAS THIS FROM A SEARCH ENGINE?
        var result = _checkForSearchUrl(url);
        if (!result) return;
      

        // -- EXTRACT DATA FROM THE URL
        var pre   = result[1];
        var query = result[2];
        var post  = result[3];
        var eng   = result[4];
        var asearch  = pre+'|'+post;
    
        // -- A TMN OR USER SEARCH, LETS BLOCK THE COOKIE 
        if (gtmn.dataTMN._cleanCookies) _blockIncomingCookie(oHttp);/*Whats happening here and why? HS*/
        
    
    var isInSearchHistory = _inTmnSearchHistory(oHttp);    
    
    if (isInSearchHistory) {
      var frame = window.document.getElementById("tmn-frame");
      gtmn._cout('The URL ' + url + ' is in the search history list'); 
	    _putURLinRemoveHistoryList(url);
      if ( frame.getAttribute("firstpage")=='false' ) {
        gtmn._cout('_onIncomingResponse: Next Search already scheduled, we leave the function') ;
        return;
      }  //This is not the first page, we should not reschedule
        gtmn._cout('Status: '+oHttp.responseStatus) ;
        if (  oHttp.responseStatus == 200  || oHttp.responseStatus == 204 || oHttp.responseStatus == 302 ) {  
          var html;
           try {  
         //   html =  window.document.getElementById("tmn-frame").contentDocument;
          html =  window.document.getElementById("tmn-frame").contentWindow.document;
         //   var content123= window.document.getElementById("tmn-frame").contentDocument.document.body.innerHTML;
        //    alert();
        //    alert("Step 0");
           } catch (ex) {
            html = "";
           }
     //      alert("Reschedule call location within onIncoming")
          _reschedule(html, oHttp) ;
        } else {
          // long pause (at least 3 min)
          var pauseAfterError = Math.max(2*gtmn.dataTMN._timeout, 60000);
            
          // clear bursts
          gtmn.dataTMN._burstCount=0;
            
          // log and tell the user
          _clog("[INFO] Trying again in "+(pauseAfterError/1000)+ "s");
          _setStatus("Err");
            
          // reschedule after long pause
          if (gtmn.dataTMN.enabled )
            _scheduleNextSearch(pauseAfterError);
      }
      return
    }
    // End of tab changes
  
        
      if (_intmn_clickHistory(url, true)) return;
  
      // -- TODO: SCHEDULE NEXT SEARCH HERE INSTEAD OF handleResponse() ?
    
                // SKIP style-sheets, scripts, images, etc
           var ext = url.match(/(\.[^\/]{2,4})$/);
          if (ext){
            if (!ext[1].match(/\.htm[l]*$/)){
              //cout("SKIPPING FILE: "+uri);
              return;
            }
          }

        // -- OK, WE HAVE A USER-ISSUED QUERY!
        if (gtmn.dataTMN._dbug)gtmn._cout("NOT_TMN! USER_SEARCH!: "+url);
    
        // -- NEW SEARCH URL: ADD TO USER_MAP
        if(eng!="google" || !gtmn.dataTMN.engineUpdated[eng] ) {//!url.match("^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z^\/]{2,3}\/(search){1}\?.*?[&\?]{1}q=)([^&]*)(.*)$") || url.indexOf("sclient=psy-ab")>0 || url.indexOf("fp=" )>0 || url.indexOf("#")>0 )    
          if (asearch != gtmn.dataTMN.currentUrlMap[eng]){
           gtmn._log("[URLMAP] update=true | engine="+eng+" | url="+asearch);
            gtmn.dataTMN.currentUrlMap[eng] = asearch;
            gtmn._getPrefs().setCharPref(eng+'Url',asearch);
            gtmn.dataTMN.engineUpdated[eng] = true
          } 
          }
      
       /*try { // -- GRAB THE HEADERS
          var visitor = PROFILEMENOT.headerTMN.HeaderInfoVisitor(oHttp);
          oHttp.visitRequestHeaders(visitor);
          var headers = visitor.headers;
          //_dumpReq("got headers",headers);
    
          // -- ADD SOME FLAGS FOR TMN
          headers['VERSION'] = visitor.getVersion(oHttp.URI);
          headers['TYPE'] = 'auto'; // flag for TMN
          headers['URL'] = url;
    
          // -- SAVE THE HEADERS FOR TMN TO USE
          gtmn.headerMap[eng] = visitor.requestToString(headers);
       } catch (ex) {
          _clog("Can not create HeaderInfoVisitor");
       }*/ 
    
        // -- UPDATE BURST-VARIABLES IF ENABLED
      //  gtmn.dataTMN._burstEngine = eng;
          gtmn.dataTMN._burstEngine = 'bing';
        
        
        if (gtmn.dataTMN.enabled && gtmn.dataTMN._burstEnabled && gtmn.dataTMN._burstCount==0) 
        {
          var off = gtmn._roll(0,gtmn.dataTMN._maxQueriesInBurst)-gtmn.dataTMN._maxQueriesInBurst/2;
          gtmn.dataTMN._burstCount = gtmn.dataTMN._maxQueriesInBurst + off; 
          if (gtmn.dataTMN._dbug)gtmn._cout("BURST_MODE_READY burstCount="+gtmn.dataTMN._burstCount);
        }
      }
      
      
      	

    
      function _contains(arr, str)
      {
        for (var i = 0;i < arr.length; i++)
          if (_equalsIC(arr[i], str))
            return true;
        return false;
      }
      
      function _equalsIC(str1, str2)
      {
        if (!str1 && !str2) return true;
        if (!str1 || !str2) return false;
        return str1.toLowerCase()==str2.toLowerCase();
      }
    
    
    
      function _isBursting(){return gtmn.dataTMN._burstEnabled && gtmn.dataTMN._burstCount>0;}
    
      function _blockIncomingCookie(oHttp){
        _logCookieAction(oHttp.URI.asciiSpec,"response");
        oHttp.setResponseHeader("Set-Cookie", null, false);
      }
    
     
    
    
      function _createProfFile(name)
        {
          try {
            // get profile directory
            var file = cc["@mozilla.org/file/directory_service;1"]
              .getService(ci.nsIProperties).get("ProfD", ci.nsIFile);
          }
          catch(ex){
            gtmn._cerr("creating profDir: "+file.path,ex);
          }
    
          try {
            file.append("TrackMeNot");
            if (!file.exists()|| !file.isDirectory())  
              file.create(ci.nsIFile.DIRECTORY_TYPE, 0777);
            file.append(name);
          } 
          catch(ex){
            gtmn._cerr("while creating file: "+file.path,ex);
          }
          return file;
         }
    
      
        
        function _getSeedFile(){
          var seed = gtmn.dataTMN._seedFile;
          if (!seed || seed == 'default')
            seed = DEFAULT_SEED_FILE;
          return seed; 
        }
    
        function _resetFreqData()
        {
          if (gtmn.dataTMN._elapsed)
           gtmn._log("[ACTION] resetFreqData(time="+gtmn.dataTMN._elapsed+"ms,lastTarget="
              +(60000.0/gtmn.dataTMN._lastTimeout)+",avg="+gtmn.dataTMN._avgFreqPerMin.toFixed(2)
              +",newTarget="+(60000.0/gtmn.dataTMN._timeout)+")");
    
          gtmn.dataTMN._sessionCount = 0;
          gtmn.dataTMN._avgFreqPerMin = 0;
          gtmn.dataTMN._startTimestamp = new Date().getTime();
        }
        
        function _isBlackList( term ) {
            var words = term.split(/\W/g);
           // alert(words + "BL: " +gtmn.dataTMN._kwBlackList ) 
            for ( var i=0; i< words.length; i++) {
                if ( gtmn.dataTMN._kwBlackList.indexOf(words[i].toLowerCase()) >= 0)
                    return true;
            }
            return false;
        }
    
        function _addQuery(term, queryList, idx, checkSkipEx)
        {
           //var noniso = new RegExp("[^a-zA-Z0-9_.\ \\u00C0-\\u00FF+]+","g");
           
           //term = term.replace(noniso,'') 
           term = gtmn._trim(term);
           
           if ( _isBlackList(term) )
              return false;
           
           if (!term || (term.length<3) || _contains(queryList, term) ) 
             return false;
    
           if (term.indexOf("\"\"")>-1 || term.indexOf("--")>-1)
             return false;
    
           // test for negation of a single term (eg '-prison') 
           if (term.indexOf("-")==0 && term.indexOf(" ")<0)
             return false;
    
           if (checkSkipEx && !_queryOk(term)) 
             return false;
    
           if (idx >= 0) 
             queryList[idx] = term;
           else 
             queryList.push(term);
    
    //gtmn._cout("adding("+gtmn._queries.length+"): "+term);
    
           return true;
        }
    
       
        function _readSeedFile( file )
        { 
          var fis, is, contents = '';
          try {
        
            fis = cc["@mozilla.org/network/file-input-stream;1"] 
              .createInstance(ci.nsIFileInputStream); 

            if ( file!= null ) gtmn.dataTMN._seedNsFile = file;
            else gtmn.dataTMN._seedNsFile = _createProfFile(_getSeedFile());
    
            fis.init(gtmn.dataTMN._seedNsFile, 0x04 | 0x08, 0644, 0); 
    
            var rc = ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
             is = cc["@mozilla.org/intl/converter-input-stream;1"]
               .createInstance(ci.nsIConverterInputStream);
    
            is.init(fis, "UTF-8", 1024, rc);
    
            var str = {};
            while (is.readString(4096, str)!= 0)
              contents += str.value;
          }
          catch (e){
            var seedPath = gtmn.dataTMN._seedNsFile ? gtmn.dataTMN._seedNsFile.path : 'null';
            gtmn._cerr("[ERROR] reading seedPath:"+seedPath+"\n"+e+" / "+e.message);
            if (is) {is.close();}
            if (fis){fis.close();}
            return null;
          }
    
          if (is) {is.close();}
          if (fis){fis.close();}
          if (!contents)  {
            var seedPath = gtmn.dataTMN._seedNsFile ? gtmn.dataTMN._seedNsFile.path : 'null';
            _clog("[WARN] No content for file:  "+seedPath);
          }
    
          return contents;
        }
    
       function _createDefaultUrlFile()
        { 
          var startCreate = new Date().getTime();
          gtmn.dataTMN._urls = new Array();
         gtmn._log("[STREAM] action=create | file=pmn_urls.txt");
          if (gtmn.dataTMN._useUrlFeeds) {
            try {
              gtmn.dataTMN._urls = _fetchRssQueries(gtmn.dataTMN._rssFeedList);
            }
            catch(e) {
              if (e.name == "UrlError")
                _clog("[WARN] Unable to load url: "+e.message);
              else
                gtmn._cerr("creating url file:",e);
            }
          }
    
          gtmn._padQueryList();

        }    
    
        function _createDefaultSeedFile()
        { 
          var startCreate = new Date().getTime();
          gtmn.dataTMN._queries = new Array();
         gtmn._log("[STREAM] action=create | file=tmn_seeds.txt");
          if (gtmn.dataTMN._useRssFeeds) {
            try {
              gtmn.dataTMN._queries = _fetchRssQueries(gtmn.dataTMN._rssFeedList);
            }
            catch(e) {
              if (e.name == "RssError")
                _clog("[WARN] Unable to load Rss: "+e.message);
              else
                gtmn._cerr("creating seed file:",e);
            }
          }
      //cout("[INFO] RSS: loaded "+gtmn._queries.length+" items\n"+gtmn._queries);
    
          gtmn._padQueryList();
    
      //cout("[INFO] Created new seed-list ("+gtmn._queries.length+" items) in "
       // +((new Date().getTime()-startCreate)/1000) + "s:\n" + gtmn._queries);
    
        }
    
       function _loadRSSFromJSON() {
          var feedObj = PROFILEMENOT.editor._getRSSObj();
          if (!feedObj) {
             _cout("[WARN] no JSON Feed found " );
            return "";
          }
          var feeds = PROFILEMENOT.editor._getObjByType(feedObj,"RSS",[]).map(function(x){return x.id}).join('|');
          return "|"+ feeds;
       }
    
           function _loadURLFromJSON() {
          var feedObj = PROFILEMENOT.editor._getRSSObj(); 
          if (!feedObj) {
             _cout("[WARN] no JSON Feed found " );
            return "";
          }
          var feeds = PROFILEMENOT.editor._getObjByType(feedObj,"RSS",[]).map(function(x){return x.id}).join('|');
          return "|"+ feeds;
       }
    
       function _fetchRssQueries(rssStr) {
           var additions = new Array();
           rssStr += _loadRSSFromJSON();
           var feeds = rssStr.split('|');
           
           for (var i = 0;i < feeds.length; i++) {
             var adds = _doRssFetch(feeds[i] , additions, -1);
             if (adds && adds < 1)
               _clog("[WARN] "+feeds[i]+" found " +adds +" items");
           }
           return additions; 
        }
    
         function _fetchUrlQueries(rssStr) {
           var additions = new Array();
           urlStr += _loadURLFromJSON();
           var feeds = urlStr.split('|');
           
           for (var i = 0;i < feeds.length; i++) {
             var adds = _doRssFetch(feeds[i] , additions, -1);
             if (adds && adds < 1)
               _clog("[WARN] "+feeds[i]+" found " +adds +" items");
           }
           return additions; 
        }  
        /*
         * checks for the existing seedfile & reads it into gtmn._queries;
         * if it doesn't exist, it creates a new one from scratch,
         *   throwing an error on any bad rss feeds (if enabled).
         * if it does exist, it adds several queries from one of 
         * the randomly selected rss feeds
         */
        function _parseSeedFile()
        {
          try {
            var seedStr = _readSeedFile();
            if (seedStr) {
              gtmn.dataTMN._queries = new Array();
    
              // check & add the queries from the seed file
              var tmp = seedStr.split(',');
              for (var i = 0;i < tmp.length; i++) 
                _addQuery(tmp[i], gtmn.dataTMN._queries, -1, false);
    
              // make substitutions from 1 random rss-feed
              if (gtmn.dataTMN._useRssFeeds) {
                var feeds = gtmn.dataTMN._rssFeedList.split("|");
                var idx = gtmn._roll(0,feeds.length-1);
       
              var adds = _doRssFetch(gtmn._trim(feeds[idx]),
                  gtmn.dataTMN._queries, gtmn.dataTMN._queries.length/5); // < 20% 

              }
            } else {  
              _createDefaultSeedFile();
            }
    
          }
          catch (e) {
            gtmn._cerr("parsing seedFile: "
              + gtmn.dataTMN._seedNsFile.path+"\n"+e+":"+e.message);
              _createDefaultSeedFile();
          }
        }
        
        

  
      // returns # of keywords added
      function _filterKeyWords(rssTitles, addToList, feedUrl, maxToAdd)  {
        var addStr = ""; //tmp-debugging	    
        var adds = 0;         
        var indexInQueries = -1;
        var maxWordsPerQuery = 5;
        if (maxToAdd < 0) maxToAdd = 1000;
        var forbiddenChar = new RegExp("[ @#<>\"\\\/,;'’{}:?%|\^~`=]+", "g");
        var splitRegExp = new RegExp('[\\[\\]\\(\\)\\"\']+', "g");

        
        var wordArray = rssTitles.split(forbiddenChar);
        for (var i=0; i < wordArray.length; i++)  {
          if ( !wordArray[i].match('-----') ) { 
            word = wordArray[i].split(splitRegExp)[0];
            word = gtmn._trim(word.toLowerCase()).replace(/\s/g,'').replace(/[(<>"'’&]/g,'');
            if (word && word.length>2 && !_contains(addToList, word) ) 	              {
              var wordCount = 0;
              W: while (i < (wordArray.length)  && wordArray[i+1] && !(wordArray[i+1].match('-----')
                || wordArray[i+1].match(splitRegExp)))  {
                var nextWord = wordArray[i+1];   // added new check here -dch
                if ( nextWord != nextWord.toLowerCase())  {
                  nextWord=gtmn._trim(nextWord.toLowerCase().replace(/\s/g,'').replace(/[(<>"'’&]/g,''));
                  if (nextWord.length>1)  {
                    word += ' '+nextWord;
                    if (++wordCount == maxWordsPerQuery) {
                      i++;
                      break W;
                    }
                  }
                }
                i++;
              } 
  
              if ( gtmn.dataTMN._rssQueriesCount < minQueriesInQueryList ) {
                   indexInQueries = gtmn.dataTMN._rssQueriesCount++;
              } else {
                  indexInQueries = -1;
              }
              word = word.replace(/-----/g,'')
              if (_addQuery(word,addToList,indexInQueries, false)) {
                addStr += word+", "; //tmp
                if (++adds == maxToAdd) 
                  return adds;
              }
            }
          }
        }
  
        gtmn._cout("[RSS] "+feedUrl +" added "+adds+" items: "+addStr);
  
        return adds;
      }
      
     
      // returns # of keywords added
      function _addRssTitles(httpRequest, addToList, feedUrl, max)
      {
        var rssTitles = ""; 
        var xmlData = httpRequest.responseXML;
                      gtmn._cout('ADD RSS title : '+ xmlData);
        if (!xmlData) return 0;  // only for asynchs? -dch
  
        gtmn.dataTMN._feedTitles = xmlData.getElementsByTagName("title");
        if (!gtmn.dataTMN._feedTitles|| gtmn.dataTMN._feedTitles.length<2)  {
          gtmn._cerr("no items("+gtmn.dataTMN._feedTitles+") for rss-feed: "+feedUrl);
          return 0;
        }
    
        for (var i=1; i<gtmn.dataTMN._feedTitles.length; i++){    
          if ( gtmn.dataTMN._feedTitles[i].firstChild ) {
            //gtmn._cout('ADD RSS title : '+ rssTitles);
            rssTitles += gtmn.dataTMN._feedTitles[i].firstChild.nodeValue;
            rssTitles += " ----- "; 
         }
        }     
        return _filterKeyWords(rssTitles, addToList, feedUrl, max);
      }
    
      // moved from tmn_search -dch (need to make regexs constas
      function _extractQueries(html, oldQuery)    {
        var forbiddenChar = new RegExp("^[ @#<>\"\\\/,;'’{}:?%|\^~`=]", "g");
        var splitRegExp = new RegExp('^[\\[\\]\\(\\)\\"\']', "g");
      
        if (!html) { 
          gtmn._cout("NO HTML!"); 
          return;
        }
  
        var phrases = new Array();
          
        // Parse the HTML into phrases
        var l = html.split(/((<\?tr>)|(<br>)|(<\/?p>))/i);
        for (var i = 0;i < l.length; i++) {
           if( !l[i] || l[i] == "undefined") continue;
           l[i] = l[i].replace(/(<([^>]+)>)/ig," ");	       
           //if (/([a-z]+ [a-z]+)/i.test(l[i])) {
             //var reg = /([a-z]{4,} [a-z]{4,} [a-z]{4,} ([a-z]{4,} ?) {0,3})/i;
             var matches = l[i].split(" ");//reg.exec(l[i]);
             if (!matches || matches.length<2) continue;
             var newQuery = gtmn._trim(matches[1]);
            // if ( phrases.length >0 ) newQuery.unshift(" ");
             _addQuery(newQuery, phrases, -1, true);  // changed -dch
          // }
        }
        return phrases;
      }
  
    
      /*
       * Fetches an rss feed and returns the # of keywords added
       */
      function _doRssFetch(feedUrl, toAddTo, max)  {
        var httpRequest = null;
        try {
          httpRequest = new XMLHttpRequest();
          httpRequest.open("GET", feedUrl, true);
          if (httpRequest.channel instanceof ci.nsISupportsPriority) {
            httpRequest.channel.priority = ci
              .nsISupportsPriority.PRIORITY_LOWEST;
          }
  
          httpRequest.overrideMimeType('text/xml');
          httpRequest.send(null);
  
          var requestId = setTimeout(function() {httpRequest.abort();}, 5000);	    
          httpRequest.onreadystatechange=function(aEvt) {
            if (httpRequest.readyState!=4)  return; 
            clearTimeout(requestId);     
            if (httpRequest.status == 302 || httpRequest.status == 301)  {
  
              gtmn._clog("[WARN] httpRequest.status = "+httpRequest.status);
                          
              //var amp = new RegExp("&amp;","g")
              var click_url = httpRequest.getResponseHeader("Location");
              httpRequest.onload = null;  
              httpRequest.open( "GET", click_url,  false); 
  
              if (httpRequest.channel instanceof ci.nsISupportsPriority) {
                httpRequest.channel.priority = ci
                  .nsISupportsPriority.PRIORITY_LOWEST;
              }
			httpRequest.overrideMimeType('text/xml');
              httpRequest.send(null);  
            }
            var adds = _addRssTitles(httpRequest, toAddTo, feedUrl, max);
  
  //gTrackMeNot._clog("[FETCH] mode=rss | url="+feedUrl+" | "+adds+" items");
  
            return adds;  
          }
        }
        catch (ex) {
          _clog("[WARN]  _doRssFetch("+feedUrl+")\n"
            +"  "+ex.message+" | Using defaults..."); 
          return 0; // no adds here...
        }
      }
    
      function _charOk(ch)
      {
        var bad = new Array(9,10,13,32);
        for (var i = 0;i < bad.length; i++)
          if (ch==bad[i]) return false;
        return true;
      }

             
      function _readPrefs()    {
        var prefs = gtmn._getPrefs();
      
        // Int prefs --------------------------------------
        gtmn.dataTMN._timeout = prefs.getIntPref("timeout");  
      
        // Bool prefs -------------------------------------
        gtmn.dataTMN.enabled      = prefs.getBoolPref("enabled");
   //     alert("enabled is : " + gtmn.dataTMN.enabled);
        gtmn.dataTMN._logDisabled  = prefs.getBoolPref("logDisabled");  
        gtmn.dataTMN._logPreserved = prefs.getBoolPref("logPreserved");  
        gtmn.dataTMN._showQueries  = prefs.getBoolPref("showQueries");  
        gtmn.dataTMN._showStatus   = prefs.getBoolPref("showStatus");  
        gtmn.dataTMN._burstEnabled = prefs.getBoolPref("burstEnabled");  
  
        gtmn.dataTMN._cleanCookies = gtmn.dataTMN._disableCookieCleaning ?
           false : prefs.getBoolPref("cleanCookies");  
  
        // New prefs --------------------------------------
        gtmn.dataTMN._useRssFeeds     = prefs.getBoolPref("useRssFeeds");
        gtmn.dataTMN._doClickThroughs = prefs.getBoolPref("doClickThroughs");
        gtmn.dataTMN._doClickNext = prefs.getBoolPref("doClickNext");
        gtmn.dataTMN._useIncrementals = prefs.getBoolPref("useIncrementals");
  
      
        // String prefs -----------------------------------
        //gtmn.dataTMN._seedFile = prefs.getCharPref("seedFile");  
        gtmn.dataTMN._searchEngines = prefs.getCharPref("searchEngines");  
        
        var kwBlackList = prefs.getCharPref("keywordsBlackList");
        var melchizedekList = prefs.getCharPref("melchizedek");
        var newsList = prefs.getCharPref("forNewUrls");
        var gamesList = prefs.getCharPref("forGamesUrls");
        var othersList = prefs.getCharPref("forOthersUrls");
       
        if(melchizedekList && melchizedekList.length > 0)
          gtmn.dataTMN._urlTargetedNoiseList = melchizedekList.split(",");
       
        if(newsList && newsList.length > 0)
          gtmn.dataTMN._urlTargetedNoiseListForNews = newsList.split(",");
           
      
        if(othersList && othersList.length > 0)
          gtmn.dataTMN._urlTargetedNoiseListOther = othersList.split(",");
 
            
         if(gamesList && gamesList.length > 0)
          gtmn.dataTMN._urlTargetedNoiseListForGames = gamesList.split(",");
 
 
 
        
        if ( kwBlackList && kwBlackList.length > 0)
           gtmn.dataTMN._kwBlackList = kwBlackList.split(",");   
        
        var rssFeeds = prefs.getCharPref("rssFeedList");
        if (rssFeeds && rssFeeds.length>0)  
          gtmn.dataTMN._rssFeedList = rssFeeds;
        else
          gtmn.dataTMN._rssFeedList = gtmn.dataTMN._defaultRssFeeds;
        
        // UrlMap prefs  -----------------------------------
        var googleUrl = prefs.getCharPref("googleUrl");
        if (googleUrl ) {
            if (googleUrl.match("^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z^\/]{2,3}\/search)")
                && googleUrl.indexOf("sclient=psy-ab")<0 && googleUrl.indexOf("fp=" )<0 && googleUrl.indexOf("#")<0 ) {
                 gtmn.dataTMN.currentUrlMap['google'] = googleUrl;
            } else {
                prefs.setCharPref("googleUrl","https://www.google.com/search?hl=en&q=|")
            }
        }
        var aolUrl = prefs.getCharPref("aolUrl");
        if (aolUrl) 
          gtmn.dataTMN.currentUrlMap['aol'] = aolUrl;
        var bingUrl = prefs.getCharPref("bingUrl");
        if (bingUrl)
          gtmn.dataTMN.currentUrlMap['bing'] = bingUrl;
        var yahooUrl = prefs.getCharPref("yahooUrl");
        if (yahooUrl)
          gtmn.dataTMN.currentUrlMap['yahoo'] = yahooUrl;
        var baiduUrl = prefs.getCharPref("baiduUrl");
        if (baiduUrl)
          gtmn.dataTMN.currentUrlMap['baidu'] = baiduUrl;
        var askUrl = prefs.getCharPref("askUrl");
        if (askUrl)
          gtmn.dataTMN.currentUrlMap['ask'] = askUrl;
      } 
    
    
      function _setStatus(msg)
      {
        var windows = gtmn._getWindows();
        var statusMsg = gtmn.dataTMN._showStatus ? "PMN: "+msg : "";
  
        if (gtmn.dataTMN._dbug)
          statusMsg = gtmn.dataTMN._showStatus ? "PMN("+gtmn.dataTMN._burstCount+")"+msg : "";
    
        for (var i = 0;i < windows.length; i++)
        {
          var statusLabel= windows[i].document.getElementById("profilemenot-label");
          if (statusLabel != null) statusLabel.value =  statusMsg;
        }
      }
      

      
      function _charOk(ch)
      {
        var bad = new Array(9,10,13,32); // remove
        for (var i = 0;i < bad.length; i++)
          if (ch==bad[i]) return false;
        return true;
      }
      
      function _countChar(str, ch)
      {
        if (ch.length != 1) 
          throw new Error("Expecting a single char, but found: "+ch);
        var count = 0;
        for (var i = 0;i < str.length; i++) {
          if (ch == str[i]) 
            count++;
        }
        return count;
      }
        
     
    
      function _defaultSeedFile() {
        return (gtmn.dataTMN._seedFile == null || gtmn.dataTMN._seedFile=='default');
      }
    
      function _clog(msg){gtmn._cout(msg);gtmn._log(msg);}
    
      function _dumpReq(_tag, _req)
      {
        var str = _tag + ":\n------------------------------------\n";
        for (var i in _req)
          str += ("'"+i+"': '"+ _req[i] + "'\n");
        gtmn._cout(str+"------------------------------------\n");
      }     
    
      function _chooseEngine( engines)  {
        var eng =[];
        var mapdist = _getCurrentMapDist();
        if (!mapdist) return engines[Math.floor(Math.random()*engines.length)];
        
        for each( en in engines) {
            var occ = mapdist[en];
            for (var i=0; i<occ; i++) eng.push(en) 
        }
        gtmn._cout("Search engine map dist "+ eng)
 //       alert(eng[Math.floor(Math.random()*eng.length)]);
        return eng[Math.floor(Math.random()*eng.length)]
      
      }
        
      function _scheduleNextSearch(delay)        {
            
 //       alert("SceduleNextSearch: " + scheduleNextSearch++ + "  onIncomingResponseCounter" + countOnIncomingResponse + "   from Observe" + onIncomingCounterCallFromObserver );
        if (!gtmn.dataTMN.enabled) return; 
        if (gtmn.dataTMN._dbug) gtmn._cout("_scheduleNextSearch("+delay+")"); 
        // update the frequency info ------------------
        var requestedDelay = delay;
        gtmn.dataTMN._elapsed = new Date().getTime()-gtmn.dataTMN._startTimestamp;
        var elapsedMin = (gtmn.dataTMN._elapsed / 60000.0);
        var targetFreqPerMin = (60000.0 / gtmn.dataTMN._timeout);
        gtmn.dataTMN._avgFreqPerMin = gtmn.dataTMN._sessionCount/elapsedMin;
    
        // randomize the delay appropriately ---------
        if (delay > 0)
        {
          if (!_isBursting())
          {
            // randomize to approach target frequency
            var offset = delay*(Math.random()/2);
            if ( !gtmn.dataTMN._timeDist && gtmn.dataTMN._avgFreqPerMin < targetFreqPerMin)
              delay = parseInt(delay) - offset;
            else 
              delay = parseInt(delay) + offset;
          } 
          else  // just simple randomize during a burst
          {
            delay += delay*(Math.random()-.5);
          }
        }
    
         // some debug output --------------------------
        if (gtmn.dataTMN._dbug)gtmn._cout("qpm="+gtmn.dataTMN._avgFreqPerMin.toFixed(3)+
          " target="+targetFreqPerMin.toFixed(2)+" delay="+delay.toFixed(2)+
          " request="+requestedDelay+" burst="+_isBursting());
    
        // pick a correct engine ----------------------
        var engine = null;
        if (_isBursting()){
     //     engine = gtmn.dataTMN._burstEngine;
            engine = 'bing';
          if (gtmn.dataTMN._dbug)gtmn._cout("[BURST] ENGINE="+engine+" BCOUNT="+
            gtmn.dataTMN._burstCount+" SESSION="+gtmn.dataTMN._sessionCount);
        }
        else {
        //  var engines = gtmn.dataTMN._searchEngines.split(',');
         // engine = _chooseEngine(engines);
      //    alert("Chosen Search Engine is : " + engine);
            engine = "bing";
        }
	  
	  if ( PROFILEMENOT!='undefined' && !PROFILEMENOT ) alert('Error')

        // now call tmn_search to make the query
        if ( PROFILEMENOT && !PROFILEMENOT.TMNSearch.isScheduleSearch() )  {
            
          try {
     
             if(tabHasBeenShown == 0 || gBrowser.getBrowserForTab(gtmn.dataTMN._newTabBrowser) == null){
      
               tabHasBeenShown++;
               
               gtmn.dataTMN._newTabBrowser = gBrowser.addTab("http://people.scs.carleton.ca/~ssajjadp/");
     
             }
             
            setTimeout(PROFILEMENOT.TMNSearch.doSearch, delay, engine, cc, ci, gtmn._repProc2);//}
      
          }
          
          catch(e){
            
            gtmn._cerr("on setTimeout():"+e+"\n"+e.message);
            
          }
          
        }
        
      }
    

    
      function _queryOk(a)
      {
        if (!gtmn.dataTMN._skipex || gtmn.dataTMN._skipex.length<1) {
                  try {
              for (var i = 0;i < gtmn.dataTMN._SKIPEX.length; i++)
                 gtmn.dataTMN._skipex[i] = new RegExp(gtmn.dataTMN._SKIPEX[i]);
                }
            catch(e){
              gtmn._cerr("on creating skipex: "+e+"\n"+e.message, _queryOk);
            }
        }
  
        var ok = true;
        for ( i = 0;i < gtmn.dataTMN._skipex.length; i++) {
          if (gtmn.dataTMN._skipex[i].test(a))
            ok = false;
        }
  
        return ok;
      }
    

      function addTMNContentHandler() {
    		var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    		var i = 0;
    		var prefBranch = null;
    		while (true) {
    			prefBranch = prefService.getBranch("browser.contentHandlers.types." + i + ".");
    		try {
    			prefBranch.getCharPref("type");
    			if( prefBranch.getCharPref("title") == "TrackMeNot")
    					return
    			i++;
    			} catch (e) {	
    			if (prefBranch) {
    				prefBranch.setCharPref("title", "TrackMeNot");
    				prefBranch.setCharPref("type", "application/vnd.mozilla.maybe.feed");
    				prefBranch.setCharPref("uri", "chrome://trackmenot/content/tmn_feed.html?tmn_feed=%s");
    			}
    		prefService.savePrefFile(null);}
    		}	
     }

      
    return {
	   _win : window,	
	   _searcher : null,
     _repProc : null,
     _repProc2 : null,
     dataTMN : null,
        
        
        
        
         /*This function adds a url to the persistent list- Added by HS*/
         _addToPersistentUrlListForOthers :function(linkUrl){
      
             gtmn.dataTMN._urlTargetedNoiseListOther.push(linkUrl);
       //       alert("addring to others : " + linkUrl);
              
            },
        
        /*This function adds a url to the persistent list- Added by HS*/
         _addToPersistentUrlListForNews :function(linkUrl){
      
             gtmn.dataTMN._urlTargetedNoiseListForNews.push(linkUrl);
       //      alert("addring to news : " + linkUrl);
             
            },
        
        /*This function adds a url to the persistent list- Added by HS*/
         _addToPersistentUrlListForGames :function(linkUrl){
      
             gtmn.dataTMN._urlTargetedNoiseListForGames.push(linkUrl);
         //     alert("addring to games : " + linkUrl);
             
            },
        
        /*This function adds a url to the persistent list- Added by HS*/
         _addToPersistentUrlList :function(linkUrl){
      
             gtmn.dataTMN._urlTargetedNoiseList.push(linkUrl);
       //      gtmn.dataTMN._urlTargetedNoiseListCounter.push(0);
             
            },
            
            
       /*This function checks to see if a link is in the persistent..- Added by HS*/
      _persistentLinkExists :function(linkUrl){
      
                  for(var i = 0; i < gtmn.dataTMN._urlTargetedNoiseList.length; i++){
                       
                       if(gtmn.dataTMN._urlTargetedNoiseList[i] == linkUrl){
                //             alert("link already exists : " + linkUrl);
                             return true;
                       
                       }
                       
                  }
                  
                 return false;
            
      },     
            
  
      // public functions ------------------------------------
      _stripTags : function(htmlStr) {
 //           alert("Step 1: Strip Tags: " + checkWhereWeAre++);
        return htmlStr.replace(/(<([^>]+)>)/ig,"");
      },
    
      _clearLog : function()
      {
   //          alert("Step 2: Clear Log: " + checkWhereWeAre++);
       gtmn._log("[ACTION] clearLog(elapsed="+gtmn.dataTMN._elapsed+")");
        if (gtmn.dataTMN._logWindow != null)
          gtmn.dataTMN._logWindow.close();
        else  
         gtmn._log("[WARN] null logWindow!");
      
        try {
          if (gtmn.dataTMN._logStream){
            gtmn.dataTMN._logStream.close();
            gtmn.dataTMN._logStream.init(gtmn.dataTMN._logFile, 0x02 | 0x08 | 0x20, 0644, 0); 
          }
        }
        catch(ex){
          gtmn._cout("[ERROR] clearing log:"+e+"\n"+e.message);
        }
        try {
         gtmn._log("");
        }
        catch(ex){
          gtmn._cout("[ERROR] re-opening log: "+e+"\n"+e.message);
        }
      },
  
    _getQueryWindow: function()
       {
//        alert("Step 3: getQueryWindow: " + checkWhereWeAre++);
        var assServ, assWin = null;
        var assClass = cc["@mozilla.org/appshell/appShellService;1"];
        if (assClass)assServ = assClass.getService(ci.nsIAppShellService);
        if (!assServ)
           gtmn._cerr("Unable to get @mozilla.org/appshell/appShellService;1");
        if (assServ)assWin = assServ.hiddenDOMWindow;
        return assWin;
      },
       
      
      _updateStatusText: function(newval) {
  //      alert("Step 4: updateStatusText: " + checkWhereWeAre++);
        var statusText = "";
        if (gtmn.dataTMN._showQueries) {
          statusText = "Off";
          if (gtmn.dataTMN.enabled) {
            var last = newval;
                      if (!last)  // if no arg, use value from prefs
              last = gtmn._getPrefs().getCharPref("lastQuery");
            if (typeof last == 'undefined' || !last || last=='undefined') {
              gtmn._cerr("lastQuery="+last);
              return;
            }
            //alert(last)
            statusText = last ? ("'"+last+"'"): "On";
          }
        }
        if (statusText != 'undefined') 
          _setStatus(statusText);
      },
      
    _clickThrough : function() { /*ITS NOT CLEAT WHAT THIS DOES, IT CERTAINLY DOESN"T CLICK ON A LINK HS*/
   //     alert("Click Through Value is " + gtmn.dataTMN._doClickThroughs && (Math.random() < gtmn.dataTMN._clickThroughProb));
        return (gtmn.dataTMN._doClickThroughs && (Math.random() < gtmn.dataTMN._clickThroughProb) )
   //    return true;
    },
    
    _clickNext : function() { //THIS FUNCTION IS NEVER CALLED HS
      var frame = gtmn._win.document.getElementById("tmn-frame");
   //   alert(frame.getAttribute("firstpage")=='true' && gtmn.dataTMN._doClickNext && (Math.random() < gtmn.dataTMN._clickNextProb));
      return ( frame.getAttribute("firstpage")=='true' && gtmn.dataTMN._doClickNext && (Math.random() < gtmn.dataTMN._clickNextProb) );
    },
             
    _deleteFalseHeaders : function(headers){
      delete headers['URL'];
      delete headers['TYPE'];
      delete headers['VERSION'];
    },
    
         /*
       * if the query list is less than min-size, add items from DEFAULT list
       */
      _padQueryList :function()
      {
        if (!gtmn.dataTMN._queries) {
          _clog("[WARN] Resetting empty query list!");
          gtmn.dataTMN._queries = DEFAULT_SEED_LIST;
          return;
        }
  
        var collisions = 0;
        var idx = Math.floor(Math.random() * DEFAULT_SEED_LIST.length);
        while(gtmn.dataTMN._queries.length < minQueriesInQueryList) 
        {
          if (++idx >= DEFAULT_SEED_LIST.length) idx = 0;
          var tmp = DEFAULT_SEED_LIST[idx];
  
          if (!_addQuery(tmp, gtmn.dataTMN._queries, -1, true)) {
  //gtmn._cout("[COLLISION]: "+tmp);
            if (++collisions >= 100) { // double-check
  //gtmn._cerr("=======================================================\nHit max-collision limit for query: "+tmp);
              break; // just to be sure
            }
          }
  //else gtmn._cout("[PADDING]: idx="+idx+": "+tmp);
        }
      },
      
      
      _parseSeedUserFile : function( files ) {
        
          if (! gtmn) gtmn =  PROFILEMENOT.utils.getTrackMeNot();
          gtmn.dataTMN._queries = new Array();     
          for each ( var file in files ) {
            var seedStr = _readSeedFile( file );
            // check & add the queries from the seed file
            var tmp = seedStr.split(',');
            for (var i = 0;i < tmp.length; i++) 
              _addQuery(tmp[i], gtmn.dataTMN._queries, -1, false);
          } 
      },
      
        _writeSeedFile : function()
      {
        var seedNsStream;
        try
        {
          if (!gtmn.dataTMN._seedNsFile)
            gtmn.dataTMN._seedNsFile = _createProfFile(_getSeedFile());
  
          seedNsStream=cc["@mozilla.org/network/file-output-stream;1"]
            .createInstance(ci.nsIFileOutputStream);
  
          seedNsStream.init(gtmn.dataTMN._seedNsFile, 0x02 | 0x08 | 0x20, 0644, 0); 
        }
        catch(ex){
          gtmn._cerr("Ex: "+ex.message+"\noccurred writing seed-file:\n"+ex);
        }
  
        try 
        {
          if (!gtmn.dataTMN._queries)
            gtmn._cerr("gtmn.dataTMN._queries="+gtmn.dataTMN._queries);
  
          var seeds = "";
          var wordsSoFar = 0;
          var maxWords = 15;
          for (var i = 0;i < gtmn.dataTMN._queries.length; i++)
          { 
            if (!gtmn.dataTMN._queries[i])
              gtmn.dataTMN._queries[i] = DEFAULT_SEED_LIST[i];
            var seed =  gtmn._trim(gtmn.dataTMN._queries[i]);
            var idx = seed.indexOf('\n'); // double-check
            if (idx > -1) seed.replace(/\n/g,'');
            var words = _countChar(seed,' ') + 1;
            if ((wordsSoFar + words) <= maxWords) {
              wordsSoFar += words;
              seeds += seed + ',';
            }
            else {
              seeds += '\n' + seed + ',';
              wordsSoFar = words;
            }
          }
          seedNsStream.write(seeds, seeds.length);
          seedNsStream.flush();
          seedNsStream.close();  // add a timestamp
          gtmn.dataTMN._lastSeedFileWriteTime = new Date().getTime();
        }
        catch(ex)
        {
          gtmn._cerr("writing seed-file: "+gtmn.dataTMN._seedNsFile.path,ex);
          if (seedNsStream){seedNsStream.close();}
        }
      },
    
      _switchFrameVisibility : function ()     {
          var show = !gtmn.dataTMN._showFrame;
          gtmn.dataTMN._showFrame=show;
          var tmn_frame = window.document.getElementById("tmn-frame");
          gtmn._cout(" New frame visibility " + show )
          if ( tmn_frame ) {
            tmn_frame.setAttribute("collapsed",!show)
          }
      },
      
      _showFrame : function ()         {
          return gtmn.dataTMN._showFrame;
      },
      
      
      _showLog : function ()
      {
        try {
          gtmn.dataTMN._logWindow = gtmn._getQueryWindow().open
            (cc['@mozilla.org/network/io-service;1']
            .getService(ci.nsIIOService)
            .newFileURI(gtmn.dataTMN._logFile).spec, "TrackMeNot - Log");
        } catch(ex){ 
          _clog("[WARN] "+ex.message); 
        }
      },

        // returns a random integer between min and max inclusive (min >= x <= max) 
      _roll : function(min,max){return Math.floor(Math.random()*(max+1))+min;},
      
      _getElementsByAttrValue: function(dom,nodeType,attrName,nodeValue) {
		       var outlines = dom.getElementsByTagName(nodeType);
		       for (var i = 0; i<outlines.length;i++) {
			         if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) == nodeValue ) 
				          return outlines[i]
		      }
		    return null
	     },
  
      _getStackTrace : function(func)
      {
        if (!func) return "";
  
              try {
        var args = "(", trace = func.name;
        for (var arg in func.arguments) {
          if (args && args.length && args.length>1)
            args += ",";
          args += func.arguments.toString();
        }
        trace += args+");\n";
              }
              catch (e) {
                throw new Error("Unable to create stack trace!");
        }
       
        return trace+_getStackTrace(func.caller);
      },
      
       _showSeeds : function()
      {
        gtmn._writeSeedFile("showSeeds");
        try {
          gtmn.dataTMN._logWindow = gtmn._getQueryWindow().open
             (cc['@mozilla.org/network/io-service;1']
            .getService(ci.nsIIOService)
            .newFileURI(gtmn.dataTMN._seedNsFile).spec, "TrackMeNot - Queries");
        }
        catch(ex){ 
          _clog("[WARN] "+ex.message); 
        }
      },
  
      _getPrefs: function()
      {
        if (!gtmn.dataTMN._preferences){
          var prefSvc = cc["@mozilla.org/preferences-service;1"]
            .getService(ci.nsIPrefService);
          gtmn.dataTMN._preferences = prefSvc.getBranch("extensions.trackmenot.");
        }
        return gtmn.dataTMN._preferences;
      },
  
      
      _trim : function(s){
      return s.replace(/\n/g,'');
        if (!s || s.length<1)return s;
        while (true){
          if (_charOk(s.charCodeAt(0)))break;
          s = s.substring(1,s.length);
        }
        while (true){
          if (_charOk(s.charCodeAt(s.length-1)))break;
          s = s.substring(0,s.length-1);
        }
        return s;
      },
    
      _getWindows: function()  {
	 try {
          var windows =  new Array(); 
          var wm = cc["@mozilla.org/appshell/window-mediator;1"]
           .getService(ci.nsIWindowMediator)
          var en = wm.getEnumerator('navigator:browser'); 
          while (en.hasMoreElements()){ 
            var win = en.getNext(); 
            if (win)windows.push(win);
          }
          return windows;
        } 
        catch(e){gtmn._cerr("getWindows(): ",e);}
	 /*	
        var ww = cc["@mozilla.org/embedcomp/window-watcher;1"] 
          .getService(ci.nsIWindowWatcher); 
  
        var windows =  new Array(); 
        var en = ww.getWindowEnumerator(); 
        while (en.hasMoreElements()){ 
          var win = en.getNext(); 
          if (win)windows.push(win);
        }
  
        return windows;*/
      },
      
      _rescheduleOnError : function() {
//            alert("rescheduleOnError " + checkWhereWeAre++);
          // long pause (at least 3 min)
  //        alert("Reschedle Search")
          var pauseAfterError = Math.max(2*gtmn.dataTMN._timeout, 60000*3);
      
          // clear bursts
          gtmn.dataTMN._burstCount=0;
      
          // log and tell the user
          _clog("[INFO] Trying again in "+(pauseAfterError/1000)+ "s");
          _setStatus("Err");
      
          // reschedule after long pause
          if (gtmn.dataTMN.enabled )
            _scheduleNextSearch(pauseAfterError);
              
              return false;
       },
  
      
      _updateFavicon: function(url)    {
          var faviconService = cc["@mozilla.org/browser/favicon-service;1"]
                             .getService(ci.nsIFaviconService);
          var uri = makeURI(url);
          var iconURI =makeURI("http://"+uri.host+"/favicon.ico") ;
          /*try {
            iconURI = faviconService.getFaviconForPage(uri);
          } catch( ex ) {
            faviconService.setAndLoadFaviconForPage(uri, makeURI("chrome://mozapps/skin/places/tmn"+uri.host.replace(/\./g,'') + ".png"),true);
            iconURI = makeURI("chrome://mozapps/skin/places/tmn"+uri.host.replace(/\./g,'')+ ".png");
          } */
          //gtmn._cout(iconURI.spec)
          var windows = gtmn._getWindows();
          for (var i = 0;i < windows.length; i++)          {
            var statusIcon= windows[i].document.getElementById("profilemenot-icon");
            if (statusIcon != null) statusIcon.setAttribute('src',iconURI.spec);
          }

      }, 
      
      _toggleOnOff: function()
      {
  //    alert("toggleOnOff " + checkWhereWeAre++);

   //         alert("toggleOnOff");
		var win = PROFILEMENOT.utils._getRunningWindow();
var tmn = win.PROFILEMENOT.gTrackMeNot;
        gtmn.dataTMN.enabled = !gtmn.dataTMN.enabled; /*Change the status of the enabled boolean. This
                                                       *is in the menu on the bottom right of the browser
                                                       *if gtmn.dataTMN.enabled is activated, */
        var prefs = gtmn._getPrefs();                 /*Most likely some panel*/
        var wasEnabled = prefs.getBoolPref("enabled");   /*Checks to see if TMN was enabled or not*/
        prefs.setBoolPref("enabled", gtmn.dataTMN.enabled);  /*sets the boolean preferences for future reference, it seems to be redundant,
                                                              *but we shall find out!*/
       gtmn._log("[ACTION] setEnabled("+gtmn.dataTMN.enabled+")");
        gtmn._updateState();
        if (!wasEnabled && gtmn.dataTMN.enabled)            /*If the data was not enabled, ,and now is, it will automatically schedule a search*/
          _scheduleNextSearch(0);
        gtmn.dataTMN._burstCount = 0;
        _resetFreqData();
        if( !gtmn.dataTMN.enabled && window.document ) {
           var frame = window.document.getElementById("tmn-frame");
           if (frame) frame.parentNode.removeChild(frame);  
        }
        return gtmn.dataTMN.enabled;
      },
      
      _log : function(msg)
      {
        if (gtmn.dataTMN._logDisabled)return;
    
        try  
        {
          if (!gtmn.dataTMN._logStream)
          {
            if (!gtmn.dataTMN._logFile)
              gtmn.dataTMN._logFile = _createProfFile("tmn_log.txt");
             
            gtmn.dataTMN._logStream = cc["@mozilla.org/network/file-output-stream;1"]
              .createInstance(ci.nsIFileOutputStream );
    
            // create or append to logfile
            gtmn.dataTMN._logStream.init(gtmn.dataTMN._logFile, 0x02 | 0x08 | 0x10, 0644, 0); 
    
            const head="[STREAM] action=refresh | file=tmn_log.txt | "
              + new Date().toGMTString()+"\n";
            gtmn.dataTMN._logStream.write(head, head.length);
            gtmn.dataTMN._logStream.flush();
          }
    
          if (msg != null){
            msg += " | "+new Date().toGMTString()+" |\n";
            if (gtmn.dataTMN._logStream){
              gtmn.dataTMN._logStream.write(msg, msg.length);
              gtmn.dataTMN._logStream.flush();
            }
            else _clog("[WARN] Null LogStream for msg: '"+msg+"'");
          }
        } 
        catch(ex){
          _clog("[ERROR] "+ ex +" / "+ ex.message +
            "\nlogging msg: '"+msg+"' to file: "+gtmn.dataTMN._logFile);
        }
      } ,
  
      _cerr: function(msg, e, func){
        var txt = "[ERROR] "+msg;
        if (e){
          txt += "\n" + e;
          if (e.message)txt+=" | "+e.message;
        }
        else txt += " / No Exception";
     //   if (func) {
      //    var stack = gtmn._getStackTrace(func);
      //    while (stack.indexOf("();\n")==0)
      //      stack = stack.substring(4,stack.length); 
       //   if (stack.length>0) txt += "\nSTACK: "+stack; eduardo pacheco 
      //
        gtmn._cout(txt);
      },
  
      _cout: function(msg){
        var consoleService = cc["@mozilla.org/consoleservice;1"]
          .getService(ci.nsIConsoleService);
        consoleService.logStringMessage(msg);
      },
      /*Once the options panel is opened, this saves whatever preferences were set HS*/
       _saveOptions : function(){
//     alert("saveOptions " + checkWhereWeAre++);

//      alert("save options");
        var prefs = gtmn._getPrefs();
        var wasEnabled = prefs.getBoolPref("enabled");
 //     alert("was enabled is : " + wasEnabled);
        // Bool prefs ------------------------------------
        prefs.setBoolPref("enabled",gtmn.dataTMN.enabled);  
        prefs.setBoolPref("useRssFeeds",gtmn.dataTMN._useRssFeeds);  
        prefs.setBoolPref("doClickThroughs",gtmn.dataTMN._doClickThroughs); 
        prefs.setBoolPref("doClickNext",gtmn.dataTMN._doClickNext);  
        prefs.setBoolPref("useIncrementals",gtmn.dataTMN._useIncrementals);  
        prefs.setBoolPref("burstEnabled",gtmn.dataTMN._burstEnabled);  
  
        // no more cookie cleaning (>0.6x) [dch]
        prefs.setBoolPref("cleanCookies",false);  
        if (!gtmn.dataTMN._disableCookieCleaning)
          prefs.setBoolPref("cleanCookies",gtmn.dataTMN._cleanCookies);  
  
        prefs.setBoolPref("logDisabled",gtmn.dataTMN._logDisabled);  
        prefs.setBoolPref("logPreserved",gtmn.dataTMN._logPreserved);  
        prefs.setBoolPref("showStatus",gtmn.dataTMN._showStatus);  
        prefs.setBoolPref("showQueries",gtmn.dataTMN._showQueries);  
        //prefs.setBoolPref("showIcon",gtmn.dataTMN._showIcon);  
    
        // Int prefs ----------------------------------
        gtmn.dataTMN._lastTimeout = prefs.getIntPref("timeout");
        prefs.setIntPref("timeout",gtmn.dataTMN._timeout);  
    
        // Char prefs ------------------------------------
        prefs.setCharPref("searchEngines", gtmn.dataTMN._searchEngines);  
  
        // remove ----------- ??
        if (false && gtmn.dataTMN._seedFile=='default' && !_defaultSeedFile())
         gtmn._log("[ACTION] query-terms set to default list");
  
        // Complex pref ----------------------------------
        //prefs.setCharPref("seedFile", gtmn.dataTMN._seedFile);  
        prefs.setCharPref("keywordsBlackList", gtmn.dataTMN._kwBlackList.join(","));  
        prefs.setCharPref("rssFeedList", gtmn.dataTMN._rssFeedList);

        prefs.setCharPref("melchizedek", gtmn.dataTMN._urlTargetedNoiseList.join(","));
        prefs.setCharPref("forNewUrls", gtmn.dataTMN._urlTargetedNoiseListForNews.join(","));
        prefs.setCharPref("forGamesUrls", gtmn.dataTMN._urlTargetedNoiseListForGames.join(","));
        prefs.setCharPref("forOthersUrls", gtmn.dataTMN._urlTargetedNoiseListOther.join(","));
        
        
        // Reset burst count
        gtmn.dataTMN._burstCount = 0;
  
        // Reset freq data if updated 
        if (gtmn.dataTMN._lastTimeout != gtmn.dataTMN._timeout)
          _resetFreqData();
 
        gtmn._updateState();
  
        // Search only if its newly enabled
        if (!wasEnabled && gtmn.dataTMN.enabled)
          _scheduleNextSearch(0);
  
        gtmn._updateStatusText();
        gtmn._log("[ACTION] saveOptions(enabled="+gtmn.dataTMN.enabled+
          ",freq="+gtmn.dataTMN._timeout+",burst="+ gtmn.dataTMN._burstEnabled +
          /*",cookies="+gtmn.dataTMN._cleanCookies+*/")");
      },
      
            // Code moved from _onIncomingResponse(), dch-9/10/08
     _updateOnSend : function ( engine, isIncr, sentQuery)    {
        // -- CLEAN & DISPLAY THE QUERY
        var cleanQuery = '';
        if ( sentQuery )  cleanQuery = sentQuery.replace(/\+/g,' ');
        else cleanQuery = gtmn.dataTMN._query.replace(/\+/g,' ');
        cleanQuery = cleanQuery.replace(/%22/g,'');
        gtmn._updateStatusText(cleanQuery);
  
        // -- LOG THAT THE QUERY WAS SENT
        var logStr = "[QUERY] engine=" +engine;
        var qpmStr =  " | qpm=", modeStr = " | mode=";
      
        if (_isBursting()) { 
          qpmStr += "Na";
          modeStr += "burst"; 
          if (isIncr) modeStr += "(i)";
        }
        else {
          modeStr += "timed";
          if (isIncr) modeStr += "(i)";
          qpmStr += gtmn.dataTMN._avgFreqPerMin.toFixed(3);
        } 
        logStr += modeStr+" | query='" + cleanQuery +"'"+qpmStr;
        gtmn._log(logStr);
  
        if (gtmn.dataTMN._dbug)gtmn._cout(logStr);
  
        // -- INCREMENT PREF & SESSION TMN_COUNT
        var prefs = gtmn._getPrefs();
        var tc = prefs.getIntPref("totalCount");
        prefs.setIntPref("totalCount",parseInt(tc)+1);
  
        // -- UPDATE FREQUENCY DATA IF NOT BURSTING
        if (!_isBursting()) gtmn.dataTMN._sessionCount++;
  
        // TODO: SCHEDULE NEXT SEARCH HERE INSTEAD OF handleResponse()?
        return;
    } ,
      
      _updateState : function() {  
  //gtmn._cout("gTrackMeNot._updateState(): "+window+" tmn="+window.gTrackMeNot); 
        var isOn = gtmn._getPrefs().getBoolPref("enabled");  
        var icon = gtmn.dataTMN._imageDir + (isOn ? "on_icon.png":"off_icon.png");
        
        var windows = gtmn._getWindows();
  
        if (window) windows.push(window); // hack
  
        for (var i = 0;i < windows.length; i++)
        {
          var win = windows[i];
  
          if (win && win.document) {
  
            var enabledMenuItem=win.document.getElementById("profilemenot-enabled");
            if (enabledMenuItem)
              enabledMenuItem.setAttribute("image", icon); 
            
  
            var enabledStatusItem = win.document.getElementById("pmn-status-enabled");
            if (enabledStatusItem) 
              enabledStatusItem.setAttribute("image", icon); 
            
          }
        }
        gtmn._updateStatusText();
      },
      
      /*oHttp is an nsIHttpChannel, the aTopic is the string it has to observe
      so in this case it is either http-on-modify-request or http-on-examine-responce
      the QueryInterface function changes nsISupports to nsIHttpChannel. Converting
      objects from one kind to the other is very ugly and lacks syntactic sugar.  HS*/
      
      /*How observer works: You create an observer method. The observer method will be called on objects you like
      to observe. "http-on'modify-request" for example takes place right before an HTTP request.
      Hence, in the function below, when http-on-modify-request called, the following observer function is called
      however, this particular observer is registered with other events. The observer is not passed directly into
      an observerService.addObserver(..), since itself is part of a function, it is passed via an its mother function
      when the mother fucntion/object is past in, we are telling it that we want to call its observe method, which the
      addObserver method automagically picks up! HS*/
      
      /*The aSubject here is an nsIHttpChannel*/
      
    observe :function(oHttp, aTopic, aData)  {
 //     alert("observe " + observeCounter++);
 //       alert(oHttp);
        
        if (!gtmn.dataTMN.enabled){gtmn.dataTMN._burstCount=0;return;} /*If TMN is not enabled, then just return.*/
    /*nsHttpChannel :
    This interface allows for the modification of HTTP request
    parameters and the inspection of the resulting
    HTTP response status and headers when they become available.
    inherits from nsIOService HS
    */
        oHttp.QueryInterface(ci.nsIHttpChannel);
        
        var uri = oHttp.URI.asciiSpec;


        if (aTopic == 'http-on-modify-request'){

            _onOutgoingRequest(oHttp);      
        }
        else if (aTopic == 'http-on-examine-response'){
      //       alert("onIncomingRequest being called from the observe method" + onIncomingCounterCallFromObserver++) ;
           onIncomingCounterCallFromObserver++;
            _onIncomingResponse(oHttp);
        //    alert(oHttp.response);
        }
    },
      
  _unload : function(){
 //      alert("load " + checkWhereWeAre++);

      if (typeof PROFILEMENOT=='undefined' || !PROFILEMENOT || typeof PROFILEMENOT.utils.getTrackMeNot=='undefined' ) {
          gtmn._cout("[ERROR] TrackMeNot: error on window.unload!");
                return;
      }
	    _clearHistoryList()
      PROFILEMENOT.utils.removeFromListener(this); /*This is where the observer is deregistered*/
      var lastGood = -1;
      var wins = gtmn._getWindows();
      for (var i = 0;i < wins.length; i++) {
        if (wins[i] && wins[i].PROFILEMENOT) {
          gtmn._cout("  "+i+") "+wins[i]);
          lastGood = i;
        }
      }
	    running = false;
      if (lastGood > -1 && wins[lastGood]  ) {
        wins[lastGood].PROFILEMENOT.gTrackMeNot._reload(gtmn.dataTMN);
        alert("on unload");
      } 
  
      gtmn._writeSeedFile();  
      if (!gtmn.dataTMN._logPreserved) 
        gtmn._clearLog();
  },
  
	_isRunning: function () {
			return running;			
	},
		
		_setAddonBar : function() {
	    	var windows = this._getWindows();
	
	      if (window) windows.push(window); 	
	      for (var i = 0;i < windows.length; i++) {
        	var addonBar = windows[i].document.getElementById("addon-bar");
          if (addonBar) {
              if (gtmn.dataTMN._showStatus && !windows[i].document.getElementById("pmn-statusbarpanel")) {
                var addonBarCloseButton = windows[i].document.getElementById("addonbar-closebutton")
                addonBar.insertItem("pmn-statusbarpanel", addonBarCloseButton.nextSibling);
                setToolbarVisibility(addonBar, true);
              }             
            }
         }           
    },
  
   _load: function() {
//   alert("Load");
 //    alert("_load" + checkWhereWeAre++);     
       	comps = Components;          
        cc = Components.classes;
        ci = Components.interfaces;
			  if (running || PROFILEMENOT.utils.hasInstance()) {
			  	return;
			  }
			  running = true;
			  gtmn = PROFILEMENOT.gTrackMeNot; /*Is gtmn being assigned PROFILEMENOT.gTrackMeNot or is it being instantiaed? */
			  gtmn.dataTMN = PROFILEMENOT.tmnDATA._getData();
        gtmn.dataTMN._burstCount = 0;
    //    gtmn._repProc2 = PROFILEMENOT.TMNExtract;
       try{
       
  //      alert("after new tab browser initiation");
        gtmn._repProc2 = new PROFILEMENOT.TMNClick1.tmn_repProcessor();
       }
        catch (ex) {
          alert(ex.message);
        }
       // if(gtmn._repProc2 != null){
         //   alert("Hallelooya!");
       // }
       // else{
        //    alert("boo hoo");
       // }
        gtmn.dataTMN._sessionCount = 0;
        gtmn.dataTMN._avgFreqPerMin = 0;
        gtmn.dataTMN._clickHistory = new Array();
        
        gtmn._searcher = PROFILEMENOT.TMNSearch;
        gtmn._repProc = PROFILEMENOT.TMNClick;
	      gtmn._win = window;
        _readPrefs();
        gtmn._setAddonBar();
        gtmn._updateState();
        _parseSeedFile();
        _resetFreqData();
        addTMNContentHandler();
        gtmn.dataTMN._lastTimeout = gtmn._timeout;
        /*IMPORTANT, THIS IS WHERE THE OBSERVER IS REGISTERED! the function that has the observe function in it
        itself, it is using utils which is apparently a JS file that has utility functions in it*/
        PROFILEMENOT.utils.addToListener(this);  /*what is 'this'?*/
        
        try {
          _loadDist();
          _loadStat();
        } catch (ex) {
          gtmn._cout('Ad Monitor not installed, ex:'+ex)
        }                               
        window.addEventListener("unload", function(){gtmn._unload();}, false);
        if (gtmn.dataTMN.enabled){
        
          _scheduleNextSearch(0);}
   
          
    },
	
	_2nd_load: function(){
		gtmn = PROFILEMENOT.utils.getTrackMeNot();
		gtmn._updateState();
		
	},
      
  _reload: function(data)   {
 //     alert("reload");
   //   alert("reload " + checkWhereWeAre++);
			  if(running) return;
			  running = true;
			  
        comps = Components;
        gtmn = PROFILEMENOT.gTrackMeNot;
        gtmn.dataTMN = data;
        cc = Components.classes;
        ci = Components.interfaces;
        gtmn._searcher = PROFILEMENOT.TMNSearch;
        gtmn._repProc = PROFILEMENOT.TMNClick;
 //       alert("step 0 in _reload");
     //   gtmn._repProc2 = new PROFILEMENOT.TMNExtract.tmn_repProcessorNew();
 //       gtmn._repProc2 = PROFILEMENOT.TMNExtract;
 //       alert("step -1 in _reload");
	      gtmn._win = window;
        gtmn._updateState();
        addTMNContentHandler();
        PROFILEMENOT.utils.addToListener(this); /*What is 'this'?*/
     
       
        window.addEventListener("unload", function(){gtmn._unload();}, false);
        if (gtmn.dataTMN.enabled)
          _scheduleNextSearch(0);
     }	    
    }; /*End of the return function*/
// ------------ Finished creating TrackMeNot instance --------------
} () ; /*What are the paranthesis for?*/

/*This is where the first call to scheduleNextSearch is done as the window loads HS*/ 
   if (!PROFILEMENOT.utils.hasInstance()) {
      
  	window.addEventListener("load", function(){PROFILEMENOT.gTrackMeNot._load();}, false);
  }else { // we have an instance already ---------------------------------
  	PROFILEMENOT.gTrackMeNot._2nd_load();
  	window.addEventListener("load", function(){
  		PROFILEMENOT.gTrackMeNot._2nd_load();
	}, false);
}
	
if (!PROFILEMENOT.utils.hasInstance()) {	


    PROFILEMENOT.tmnDATA= function () {
  	
  		function getElementsByAttrValue(dom,nodeType,attrName,nodeValue) {
  				       var outlines = dom.getElementsByTagName(nodeType);
  				       for (var i = 0; i<outlines.length;i++) {
  					         if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) == nodeValue ) 
  						          return outlines[i]
  				      }
  				    return null
  		}
  	    
  	    
  	  function nodeListToArray( nodelist) {
              var result = [];
              for (var i=0; i<nodelist.length; i++ ) 
                result.push(nodelist[i]);
              return result;
       }
          
  	
  	return{
      	   _logFile : null,
      	   _logStream : null,
      	   _logWindow : null,
      	   _seedNsFile : null,
      	   _preferences : null,
        // _burstEngine : null,
      	   _burstEngine : 'bing', /*changed to bing from null-HS*/	    
      	   _delim : "&D=LiM",
      	   _useRssFeeds : true,
           _useUrlFeeds : true, /*added by HS*/
      	   _evolveQueryList : true,
      	   _doClickThroughs : true,
      	   _doClickNext : true,
      	   _disableCookieCleaning : true,
      	   _lastSeedFileWriteTime : 0,
           _clickThroughProb : 0.2,
      	   _clickNextProb : 1.0, /*Never Used!*/
      	   _substitutionProb : 0.4,	    
      	   _hideReferer : false,
      	   _showFrame : false,
      	   _seedFile : "", 
      	   _searchHistory : new Array(),
      	   _imageDir : "chrome://trackmenot/skin/",
      	   _skipex : new Array(), 
      	   _timeDist : null,
    	     _termStat : null,
      	   _clickHistory : null,
      	   _maxHistoryLength : 9,
           _newTabBrowser : null,  /*Added by HS*/
           _newTabBrowserForPersistence : null, /*Added by HS*/
           _goToNewLink : true, /*added by HS, this checks to see if we should go to a new link or not-HS*/
           _currentLink : null, /*added by HS, this is the last visited link, each link will be visited twice-HS*/
      	   _lastLinkVisited : null, /*sometimes currentlink is null-HS*/
           _maxQueriesInBurst : 8,
      	   _burstTimeout : 6000,
      	   _startTimestamp : 0,
      	   _avgFreqPerMin : 0,
      	   _sessionCount : 0,
      	   _rssQueriesCount : 0, // count the number of rss queries in the queries array
      	   _lastTimeout : 0,
      	   _burstCount : 0,
      	   _elapsed : 0,
           _dbug : true,
  	   _searchEngines : "bing;bing;bing;bing", // ask?
  	   enabled : true,
           _kwBlackList : [],
           _urlTargetedNoiseList : new Array(),
        //   _urlTargetedNoiseListCounter : new Array(),
           _urlTargetedNoiseListForNews : new Array(),
           _urlTargetedNoiseListForGames : new Array(),
           _urlTargetedNoiseListOther : new Array(),
  	   _rssFeedList : "",
  	   _defaultRssFeeds : null,
  	   _burstEnabled : false,
  	   _cleanCookies : false,
  	   _logDisabled : false,
  	   _timeout : 12000,
  	   _logPreserved : false,
  	   _useIncrementals : true,
  	   _queryUrl : null,
           sandbox : null, /*added HS*/
           request : null,
  	   _incQueries : [],
  	   _showStatus : true,
  	   _showQueries : true,   
  	   _queries : [],
           _urls : [], /*added by HS*/
  	   _query : null, 
  	   _useFile : false, /*Never used*/
   //        _repProc2 : null,
  	   _referer : '',
  	   _cookieAccountChanged : '',   
      	   
      	    _regexMap : {
      	          google : "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z^\/]{2,3}\/(s|search){1}\?.*?[&\?]{1}q=)([^&]*)(.*)$",      
      	          yahoo :  "^(http:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$",
      	          bing : "^(http:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$",
      	          aol : "^(http:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$",
      	          baidu : "^(http:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$",
      	          ask : "^(http:\/\/www\.ask\.com\/web\?.*?q=)([^&]*)(.*)$"
      	   },
      	
      	
      	   _clickUrlMap : {
      	          google : "http://www.google.com",
      	          yahoo : "",
      	          aol : "http://search.aol.com/aol/",
      	          bing : "http://www.bing.com"
      	    },
      	    
             clickUrlMap : {  /*added by HS*/
	      google : "http://www.google.com",
	      yahoo : "",
	      aol : "http://search.aol.com/aol/",
	      bing : "http://www.bing.com"
	    },
                
      	   _SKIPEX : new Array(   
      	            /calendar/i,/advanced/i,/click /i,/terms/i,/Groups/i,
      	            /Images/,/Maps/,/search/i,/cache/i,/similar/i,/&#169;/,
      	            /sign in/i,/help[^Ss]/i,/download/i,/print/i,/Books/i,/rss/i,
      	            /google/i,/bing/i,/yahoo/i,/aol/i,/html/i,/ask/i,/xRank/,
      	            /permalink/i,/aggregator/i,/trackback/,/comment/i,/More/,
      	            /business solutions/i,/result/i,/ view /i,/Legal/,/See all/,
      	            /links/i,/submit/i,/Sites/i,/ click/i,/Blogs/,/See your mess/,
      	            /feedback/i,/sponsored/i,/preferences/i,/privacy/i,/News/,
      	            /Finance/,/Reader/,/Documents/,/windows live/i,/tell us/i,
      	            /shopping/i,/Photos/,/Video/,/Scholar/,/AOL/,/advertis/i,
      	            /Webmasters/,/MapQuest/,/Movies/,/Music/,/Yellow Pages/,
      	            /jobs/i,/answers/i,/options/i,/customize/i,/settings/i,
      	            /Developers/,/cashback/,/Health/,/Products/,/QnABeta/,
      	            /<more>/,/Travel/,/Personals/,/Local/,/Trademarks/,
      	            /cache/i,/similar/i,/login/i,/mail/i,/feed/i
      	    ),
      		
  		
  			 // public variables
 
  	         
  	 
  	        currentUrlMap : {
  	          google:"https://www.google.com/search?hl=en&q=|",
  	          yahoo:"http://search.yahoo.com/search;_ylt="
  	            +PROFILEMENOT.utils.getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1",
  	          bing:"http://www.bing.com/search?q=|",
  	          baidu:"http://www.baidu.com/s?wd=|",
  	          aol:"http://search.aol.com/aol/search?s_it=topsearchbox.nrf&q=|",
  	          ask:"http://www.ask.com/web?q=|&search=search&qsrc=0&o=0&l=dir"
  	        },       
  	        headerMap : {google:"", yahoo:"", bing:"", aol:"", baidu:'', ask:"", none:""}, 
  	        searchBoxMap : {
  	          google:"q",
  	          yahoo:"p",
  	          bing:"q",
  	          aol:"query",
  	          ask:""
  	        },
  	        
                
                
  	        hostMap :{
  	          google : "([a-z]+\.google\.(co\.|com\.)?[a-z]{2,3})$",    
              gstatic : "(ssl\.gstatic\.com)$",   
              googleusercontent : "([a-z0-9.]+\.googleusercontent\.com)$",
  	          yahoo :  "([a-z.]*?search\.yahoo\.com)$",
  	          bing : "(www\.bing\.com)$",
  	          baidu : "(www\.baidu\.com)$",
  	          aol : "([a-z0-9.]*?search\.aol\.com)$"
  	        },
  	        
  	        engineUpdated :{
  	          google : false,      
  	          yahoo :  false,
  	          bing : false,
  	          baidu : false,
  	          aol : false
  	        },
  	        
  	        suggest_filters : {
  	            google :  ['gsr' , 'td', function ( elt ) {return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c' )}],
  	            yahoo : ['atgl' , 'a', function ( elt ) {return elt.hasAttribute('gossiptext')}],
  	            bing : ['sa_drw' , 'li', function ( elt ) {return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg' )}],
  	            baidu : ['st' , 'tr', function ( elt ) {return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml' )}],
  	            aol : ['ACC' , 'a', function ( elt ) {return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs')}]
  	        },
  	
  	        getButtonMap : {
  	          google : function( doc ) { 
  	              return getElementsByAttrValue(doc,'button', 'name', "btnG" );         
  	          },         
  	          yahoo:   function( doc ) {   
  	              return getElementsByAttrValue(doc,'input', 'class', "sbb" );        
  	          },          
  	          bing:    function( doc ) {
  	              return doc.getElementById('sb_form_go');             
  	          },        
  	          aol:  function( doc ) {
  	              return doc.getElementById('csbbtn1');           
  	          },
  	          baidu:  function( doc ) {      
  	              return getElementsByAttrValue(doc,'input', 'value', "????" );           
  	          }           
  	        },
  	        
  	        getSearchBoxMap : {
  	          google : function( doc ) { 
  	              return getElementsByAttrValue(doc,'input', 'name', "q" );         
  	          },         
  	          yahoo:   function( doc ) {   
  	              return doc.getElementById('yschsp');       
  	          },          
  	          bing:    function( doc ) {
  	              return doc.getElementById('sb_form_q');       
  	          },        
  	          aol:  function( doc ) {
  	              return doc.getElementById('csbquery1');            
  	          },
  	          baidu:  function( doc ) {
  	              return doc.getElementById('kw');            
  	          }         
  	        },
  	        
  	        getNextLinkMap : {
  	          google : function( doc ) { 
  	              var mainDiv = doc.getElementById('nav');
  	              if(!mainDiv) return null;
  	              var links_ =  nodeListToArray(mainDiv.getElementsByTagName('a')).filter(function(x){return x.hasAttribute('href');})
  	              return links_       
  	          },         
  	          yahoo:   function( doc ) {   
  	              var mainDiv = doc.getElementById('pg');
  	              if(!mainDiv) return null;
  	              var links_ =  nodeListToArray(mainDiv.getElementsByTagName('a')).filter(function(x){return x.hasAttribute('href');})
  	              return links_              
  	          },          
  	          bing:    function( doc ) {
  	              var mainDiv = getElementsByAttrValue(doc,'div', 'class', "sb_pag" );  
  	              if(!mainDiv) return null;
  	              var links_ =  nodeListToArray(mainDiv.getElementsByTagName('a')).filter(function(x){return x.hasAttribute('href');})
  	              return links_                
  	          },        
  	          aol:  function( doc ) {
  	              return null;            
  	          },
  	          baidu:    function( doc ) {
  	              var mainDiv = getElementsByAttrValue(doc,'div', 'class', "p" );  
  	              if(!mainDiv) return null;
  	              var links_ =  nodeListToArray(mainDiv.getElementsByTagName('a')).filter(function(x){return x.hasAttribute('href');})
  	              return links_                
  	          }          
  	        },
                
  	    _reqStrToArray : function(reqStr)
	    {
	      var req = new Array();
	      var tmp = reqStr.split(/[\r\n]/);
	      for (var i in tmp){
	        if (!tmp[i])continue;
	        var header = tmp[i].match(/^([^:]+)\s*:\s*(.*)$/);
	        if (header){
	          req[header[1]] = header[2];
	          if (header[1].match(/^(If-Modified-Since|If-None-Match)$/)){
	            req["MUST_VALIDATE"] = true;
	            this._cerr("MUST VALIDATE!!!");
	          }
	        }
	      }
	      return req;
	    },
	      	        
  	      testAdMap : {
  	          google : function(anchorClass,anchorlink) {
  	            return ( anchorlink
  	                     && anchorClass=='l' 
  	                     && anchorlink.indexOf("http")==0 
						             && anchorlink.indexOf('https')!=0);
  	          },
  	          yahoo : function(anchorClass,anchorlink) {
  	            return ( anchorClass=='"yschttl spt"' || anchorClass=='yschttl spt');
  	          },
  	          aol : function(anchorClass,anchorlink) {
  	            return (anchorClass=='"find"' || anchorClass=='find'
  	                     && anchorlink.indexOf('https')!=0 && anchorlink.indexOf('aol')<0 );
  	          },
  	          bing : function(anchorClass,anchorlink) {
  	            return ( anchorlink
  	              && anchorlink.indexOf('http')==0 
  	              && anchorlink.indexOf('https')!=0 
  	              && anchorlink.indexOf('msn')<0 
  	              && anchorlink.indexOf('live')<0 
  	              && anchorlink.indexOf('bing')<0 
  	              && anchorlink.indexOf('microsoft')<0
  	              && anchorlink.indexOf('WindowsLiveTranslator')<0 );
  	          },
  	          baidu : function(anchorClass,anchorlink) {
  	            return ( anchorlink
  	              && anchorlink.indexOf('baidu')<0 
  	              && anchorlink.indexOf('https')!=0  );
  	          }
  	        },
  	     
  	   
      	   _getData: function(){
      	   	 return this;
      	   }
  	   		
  	};
  	
  } ();
}



     
     


