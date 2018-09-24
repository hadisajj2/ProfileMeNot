// $Id: tmn_search.js,v 1.1 2009/05/18 01:15:53 dchowe Exp $ 



if(!PROFILEMENOT) var PROFILEMENOT = {};

PROFILEMENOT.TMNSearch = function() {
    var tmn_frame = null;
    var searchScheduled = false;
    var tmn = null;
    var cc = null;
    var ci = null;
    var engine = 'bing';
    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];
    var tmn_timer = null; 
    var searchInit = false;
    var page_loaded = false;
    var context_menu_active = false;
    var sendQueryCounter = 0;
    var newTabBrowser = null;
    var rep = null;

	
    function pressKey(chara) { 
        var docFrame =  tmn_frame.contentDocument;
        var win = tmn_frame.contentWindow;
        var searchbox = tmn.dataTMN.getSearchBoxMap[engine](docFrame);
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtDown = document.createEvent("KeyboardEvent");
        evtDown.initKeyEvent( "keydown", false, true, win, false, false, false, false, 0, charCode );   
        searchbox.dispatchEvent(evtDown)	

    }
  
    function isMenuActive() {
  
        var menu = document.getElementById('main-menubar');
        for ( var i=0; i< menu.children.length;i++) {
            if( menu.children[i].open ) {
                return true;
            }
        }
  
 
        //     var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        //                    .getInterface(Components.interfaces.nsIWebNavigation)
        //                    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
        //                    .rootTreeItem
        //                    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
        //                    .getInterface(Components.interfaces.nsIDOMWindow); 
        //   
        // 
        //     var pups = mainWindow.document.getElementsByTagName('toolbar')
        //    
        //     for( var j=0; j<pups.length; j++ ) {
        //     /*  for( var n=0; n< pups[j].children.length; n++) {
        //          alert(pups[j].children[n].nodeName )
        //       } */
        //       // tmn._cout( pups[j].currentSet)
        // 
        //      //   tmn._cout('Toolbar name'+pups[j].getAttribute('toolbarname'))
        //       var contextId = pups[j].getAttribute('context');
        //       if (!contextId) continue;
        //       var contextMenu = document.getElementById(contextId) 
        //         if ( contextMenu.state == 'open')
        //           return true;
        //     } 
        //     
        //       var urlContainer = mainWindow.document.getElementById('urlbar-container');
        //       var pups = urlContainer.children[0].getElementsByTagName('menupopup');
        //       //alert(pups.length)
        //       for (var k= 0; k< pups.lengh; k++ ) {
        //          tmn._cout(pups[k].state)
        //          if (pups[k].state == 'open') return true;
        //       }
        //       
        // 
        //      /*  var searchContainer = mainWindow.document.getElementById('search-container'); 
        //        if ( searchContainer.children[0].getElementsByTagName('menupopup')[0].state =='open')
        //         return true;    
        //                            */
        //    /* var pups = mainWindow.locationbar.getElementsByTagName('menupopup');
        //     for( var j=0; j<pups.length; j++ ) {
        //         if (pups[j] && pups[j].state == 'open')
        //           return true;
        //     }    */
        //               
        //     
        pups = window.document.getElementsByTagName('menu')
        for( var j=0; j<pups.length; j++ ) {
            if (pups[j] && pups[j].open )
                return true;
        }
    
        pups = window.document.getElementsByTagName('menupopup')
        for( var j=0; j<pups.length; j++ ) {
            if (pups[j] && pups[j].state == 'open')
                return true;
        }
    
        pups = window.document.getElementsByTagName('popup')
        for( var j=0; j<pups.length; j++ ) {
            if (pups[j] && pups[j].state == 'open')
                return true;
        }
 
        // 
        //     var contextMenu = document.getElementById("contentAreaContextMenu");
        //     if (contextMenu && contextMenu.state!= 'closed' ) {
        //       return true;
        //     }
        //     
        // 
        //     
        //     var contextMenu = mainWindow.document.getElementById("searchBar_contextMenu");
        //     if (contextMenu && contextMenu.state!= 'closed' ) {
        //       return true;
        //     }
        // 
        menu = document.getElementById('main-menubar');
        for ( var i=0; i< menu.children.length;i++) {
            if( menu.children[i].open ) {
                return true;
            }
        }
    
        // 
        // 
        return context_menu_active;
    }
  
    function releaseKey(chara) {
        var docFrame =  tmn_frame.contentDocument;
        var searchbox = tmn.dataTMN.getSearchBoxMap[engine](docFrame);
        var charCode = chara[chara.length-1].charCodeAt(0)
        var win = tmn_frame.contentWindow;
        if ( isMenuActive() ) {
            return true;
        }
        var evtPress = document.createEvent("KeyboardEvent");
        evtPress.initKeyEvent( "keypress",true,true,win,false,false,false,false,0,charCode );   
        searchbox.dispatchEvent(evtPress);
        var evtUp = document.createEvent("KeyboardEvent");
        evtUp.initKeyEvent( "keyup",true,true,win,false,false,false,false,0,charCode);   
        searchbox.dispatchEvent(evtUp);   
    }
  
    function blurElt(elt) {
        var docFrame =  tmn_frame.contentDocument;
        if (!tmn.dataTMN.enabled) return
        var evtChange = docFrame.createEvent("Event");
        evtChange.initEvent( "change",true,true);     
        elt.dispatchEvent(evtChange);   
        var evtBl = docFrame.createEvent("Event");
        evtBl.initEvent( "blur",true,true);     
        elt.dispatchEvent(evtBl);  
    }
  
    function selectElt(elt, bar) {
        if (!tmn.dataTMN.enabled) return
        var docFrame =  tmn_frame.contentDocument;
        var evtOut = docFrame.createEvent("MouseEvents");
        var win = tmn_frame.contentWindow;
        evtOut.initMouseEvent( "mouseout",true,true,win,0,0,0,0,0,false,false,false,false,0,null);     
        bar.dispatchEvent(evtOut);  
        var evtDown = document.createEvent("MouseEvents");
        evtDown.initMouseEvent( "mouseover",true,true,win,0,0,0,0,0,false,false,false,false,0,bar);     
        elt.dispatchEvent(evtDown);  
        var evtSelect = document.createEvent("Event");
        evtSelect.initEvent( "select",true,true);     
        elt.dispatchEvent(evtSelect);  
    }
  
    function clickElt(elt) {
        if (!tmn.dataTMN.enabled) return
        var win = tmn_frame.contentWindow;
        if ( !elt) return;
       /* var evtFocus = document.createEvent("Event");
        evtFocus.initEvent( "focus", true, true);     
        elt.dispatchEvent(evtFocus);    */
        var evtDown = document.createEvent("MouseEvents");
        evtDown.initMouseEvent("mousedown",true,true,win,0, 0, 0, 0, 0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtDown); 
        var evtUp = document.createEvent("MouseEvents");
        evtUp.initMouseEvent("mouseup",true, true,win,0,0,0,0,0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtUp);    
        var evtCl = document.createEvent("MouseEvents");
        evtCl.initMouseEvent("click",true, true,win,0,0,0,0, 0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtCl)                             
    }
  
  
    function clickButton() {      
        if (!tmn.dataTMN.enabled) return
        var docFrame =  tmn_frame.contentDocument;
        var win = tmn_frame.contentWindow;   
        var button = tmn.dataTMN.getButtonMap[engine](docFrame);
        //clickElt(button);
        button.click();
        win.setTimeout(sendTMNLoadedEvent, 1000); 
    }
  
  
    function createFrame() {
        tmn_frame = document.createElement("browser"); // iframe or browser
        tmn_frame.setAttribute("id", "tmn-frame"); // THIS IS WHERE THE NAME IS SET, https://developer.mozilla.org/en-US/docs/Code_snippets/HTML_to_DOM, HS
        tmn_frame.setAttribute("name", "sample-frame");
        tmn_frame.setAttribute("type", "content");
        tmn_frame.setAttribute("resizable", "true");
        tmn_frame.setAttribute("collapsed", "true");
        tmn_frame.setAttribute("firstpage", "true");
        document.getElementById("main-window").appendChild(tmn_frame);	
		
        // Restrict frame rights
        tmn_frame.docShell.allowPlugins = false;
        tmn_frame.docShell.allowSubframes = true;
        tmn_frame.docShell.allowJavascript = true;
        tmn_frame.docShell.allowMetaRedirects = true;
        tmn_frame.docShell.allowAuth = true;
        tmn_frame.docShell.allowImages = true;
        tmn_frame.style.height = "400px";

        tmn_frame.addEventListener("DOMContentLoaded", sendTMNLoadedEvent, true );
	  /*LISTEN FOR TMNLOADED- HS*/
        tmn_frame.addEventListener("TMNLoaded", function (event) {
		        var doc = tmn_frame.contentDocument;
            var win = doc.defaultView;
            //for each (var evt in allEvents) 
            //     win.addEventListener(evt,stopEvent,true)
            var tmn = PROFILEMENOT.utils.getTrackMeNot();
            
            
            try {
                var host = doc.location.host
            } 
            catch (e) {
                host = null
            }
            var regex = tmn.dataTMN.hostMap[engine]
            var frame = document.getElementById("tmn-frame");
            if (!host ||  !host.match(regex ) ) {
                frame.parentNode.removeChild(frame);
                tmn._cout('Warning: Frame deleted');
                return
            }
             
            
            
            if ( page_loaded ) return;
            page_loaded = true;  
//	    alert("timeout clear!");
            clearTimeout(tmn_timer);  	
  
  	        if (tmn.dataTMN._dbug) tmn._cout('Timer cleared');
            // skip blank page or frame
            if (doc.location.href == "about:blank" ) return;
            //tmn._cout(doc.location.href)
            tmn._updateFavicon(doc.location.href);
            if (  engine!= "yahoo" && tmn._clickThrough() ) 
                PROFILEMENOT.TMNClick._init(engine, tmn);
      /*      else if ( tmn._clickNext() ) {  // Comment Start
                tmn_frame.setAttribute("firstpage", "false");
                var links_ =  tmn.dataTMN.getNextLinkMap[engine](doc);
                if ( links_ != null) {
                    var index_ = tmn._roll(1,links_.length) ;
                    var delay = tmn._roll(100,500) ;
                    setTimeout(clickElt,delay,links_[index_])
                }
            }*/  //Comment End
        } , true)      
        return tmn_frame; 	
    }
	
    function dectevnt (evt) {
        tmn._cout('TMN' + evt.target.name+ ':' + evt.type);
        setTimeout(dectTableEvnt,3000,engine, tmn);
    }
  
    function stopEvent (evt) {
    //evt.stopPropagation();
    // evt.preventDefault();
    }
  
    function dectTableEvnt (engine, tmn) {
        var docFrame =  tmn_frame.contentDocument;
        var suggestFilter =  tmn.dataTMN.suggest_filters[engine];    
        var searchTable = docFrame.getElementById(suggestFilter[0]);
   
        for each (var evt in allEvents) 
            searchTable.addEventListener(evt,dectevnt,false) 
    }    
        
	
    function getQuerySuggestion(doc) {
        var suggestFilter =  tmn.dataTMN.suggest_filters[engine];
        var searchTable = doc.getElementById(suggestFilter[0]);
        if ( !searchTable) return [];
        var sublines = searchTable.getElementsByTagName(suggestFilter[1]);
        var suggestElts = [];
        for ( var i=0; i< sublines.length; i++) {
            var line =  sublines[i];
            if( suggestFilter[2](line) ) 
                suggestElts.push(line);
        }
        var suggestions = suggestElts.map(function(x) {
            return tmn._stripTags(x.innerHTML)
        });
        //tmn._cout( 'TMN ' +suggestions)
        return suggestElts.slice();
    }
  
    function randomQuery()  {
        var queries = tmn.dataTMN._queries;
        var queryIdx = Math.floor(Math.random()*queries.length);
        var term = tmn._trim(queries[queryIdx]);
        if (!term || term.length<1)
            throw new Error("queryIdx="+queryIdx+" getQuery.term='"+term+"'");
        return term;
    }

    function longestWord(terms) {
        var longest = '';
        var words = terms.split(" ");
        for (var i = 0;i < words.length; i++)
            if (words[i].length > longest.length)
                longest = words[i];
        return longest;
    }

    function getQuery() {
        var term = randomQuery();
        var choice = tmn._roll(0,20);
        if (choice<2) {         //  occasionally just take longest word
            term = longestWord(term);
        }
        else if (choice==2) {   //  occasionally negate an extra word
            var single = longestWord(term);

            term = randomQuery();
            while (term.indexOf(single) > -1)
                term = randomQuery();

            if (tmn._roll(0,10)==1)
                term = '\"'+term+'\"';

            // make sure we have 3 words
            term = term +' -'+single;
            while (term.split(" ").length<3) 
                term += ' '+randomQuery();
        }
        else if (choice==3) {   //  occasionally quote a term
            term = '\"'+term+'\"';
        }

        if (term.indexOf('\n') > 0) { // yuck, replace w' chomp(); 
            while (true) {
                for (var i = 0;i < term.length; i++) {
                    if (term.charAt(i)=='\n') {
                        term = term.substring(0,i)+' '+term.substring(i+1,term.length);
                        continue;
                    }
                }
                break;
            }
        }
        return term;
    }
  
    function charOk(ch)  {
        var bad = new Array(9,10,13,32);
        for (var i = 0;i < bad.length; i++)
            if (ch==bad[i]) return false;
        return true;
    }
  
    function log(msg) {
        tmn._log(msg);
    }

    function clog(msg) {
        tmn._clog(msg);
    }
  
    function stripPhrases(htmlStr)  {
        var reg = /(<b>(.+)<\/b>)/mig;
        var strip = reg.exec(htmlStr);
        return strip[0];
    }
  
  
    function getCommonWords(searchValue, nextQuery) {
        var searched = searchValue.split(' ');
        var tosearch = nextQuery.split(' ');
        var result =  [];
        result = result.concat(searched.filter(function(x) {
            return (tosearch.indexOf(x)>=0)
            }));
        return result;
    }
  /*THIS FUNCTION IS NEVER CALLED! - HS*/
    function extractLinks(htmlStr)  {
//	alert("Extract links from tmn_search is being called");
        var reg = /<\/?(?:(?:[a][a-z])|(?:[b-z!]))[^>]*>/mig;
  
        var html = htmlStr.replace(reg,"");
  
        var l = html.split("</a>");
        var links = new Array();
        for (var i = 0;i < l.length; i++) {
            if( !l[i] || l[i] == "undefined") continue;
            l[i] += "</a>";
            if (l[i].indexOf("<a")< 0)continue;
            l[i] = l[i].replace(/[^<]+<a/img,"<a");
            l[i] = tmn._trim(l[i]);
            links.push(l[i]);
        }
//	alert(links[0]);
        return links;
    }
  
  
    function getSearchTrackMeNot() {
        if ( typeof PROFILEMENOT=='undefined' || !PROFILEMENOT || typeof PROFILEMENOT.gTrackMeNot=='undefined' || !PROFILEMENOT.gTrackMeNot)
        {
            var appServ, appWin, appClass; 
            if (typeof cc=='undefined')
                tmn._cout("[ERROR] Components(cc)is undefined!!!!");

            appClass = cc["@mozilla.org/appshell/appShellService;1"];
            if (appClass)appServ = appClass.getService(ci.nsIAppShellService);

            if (!appServ)alert("Search: Unable to get: "+APP_SHELL_SERV);
            if (appServ)appWin = appServ.hiddenDOMWindow;
            if (!appWin)alert("Search: Unable to get hiddenWindow ");

            return appWin.trackMeNot;
        }
        return PROFILEMENOT.gTrackMeNot;
    }

    function getSubQuery(queryWords) {
        var incQuery = "";
        var randomArray = new Array();
        for (var k = 0; k < queryWords.length ; k++) {
            randomIndex = Math.floor(Math.random()*queryWords.length);
            if ( randomArray.indexOf(randomIndex) < 0)
                randomArray.push(randomIndex);
        }
        randomArray.sort()

        for ( k = 0; k < randomArray.length-1 && k < 5; k++) {
            incQuery += queryWords[randomArray[k]]+' ';
        }

        incQuery += queryWords[randomArray[k]];
        incQuery = tmn._trim(incQuery);
        if (tmn.dataTMN._incQueries && tmn.dataTMN._incQueries.indexOf(incQuery) <0 )
            tmn.dataTMN._incQueries.push(incQuery);
    }
  
  
    function sendTMNLoadedEvent() {
        if (!tmn.dataTMN.enabled) return
        var win = tmn_frame.contentWindow;
        var evtFocus = document.createEvent("Event");
        evtFocus.initEvent( "TMNLoaded", true, true);     
        tmn_frame.dispatchEvent(evtFocus);
    }
  
    function typeQuery( queryToSend, currIndex, searchBox, chara,doc,isIncr ) {

        var win = tmn_frame.contentWindow;   
        if ( isMenuActive() ) { // Menus is active and could capture 'keypress', we clic and leave
            clickButton();
            return;
        }
        if ( currIndex < queryToSend.length  ) {
            var suggestElt = getQuerySuggestion(doc);	
            if ( Math.random() < 0.001 && suggestElt.length >0 ) {        // Accept a seaerch suggestion
                var index_ =  tmn._roll(0,suggestElt.length-1);
                selectElt(suggestElt[index_],searchBox);
                clickElt(suggestElt[index_]);
                blurElt(searchBox);
                tmn._updateOnSend( engine, isIncr, tmn._stripTags(suggestElt[index_].innerHTML) );
                win.setTimeout( function () {return sendTMNLoadedEvent()}, nextPress+1000)
                return;
            } else {  
          
                if ( currIndex == 0 || queryToSend[currIndex-1]==" " ) {
                    var newWord = queryToSend.substring(currIndex).split(" ")[0];
                    if( searchBox.value.indexOf(newWord)>=0 ) {     // The keyword to enter is already in the search box
                        currIndex+= newWord.length+1;
                        searchBox.selectionEnd+= newWord.length+1;
                        searchBox.selectionStart =searchBox.selectionEnd;
                        tmn._updateStatusText(searchBox.value);
                        var nextPress = tmn._roll(50,250);
                        win.setTimeout( function(){ return typeQuery(queryToSend,currIndex,searchBox,chara.slice(),doc ,isIncr )},nextPress  )
                        return;
                    }
                }      // Just type a letter    
                chara.push(queryToSend[currIndex++])
                if (tmn.dataTMN._dbug) tmn._cout("Character to be typed: "+chara + " in searchbox:"+ searchBox + win);
                win.setTimeout( function(){ return pressKey(chara, searchBox)}, 10);    
                win.setTimeout( function(){ return releaseKey( chara, searchBox)}, 15);   
                tmn._updateStatusText(searchBox.value);
                nextPress = tmn._roll(50,250);
                win.setTimeout( function() { return typeQuery(queryToSend,currIndex,searchBox,chara.slice(),doc ,isIncr)}, nextPress  )
            }
        } else {      //Click on search
            tmn._updateOnSend( engine, isIncr ,queryToSend);
            nextPress = tmn._roll(50,250);
            if (tmn.dataTMN._dbug) tmn._cout('Click button');
            win.setTimeout( function () {return clickButton()}, nextPress); 		    
        }
    }
    
function handleResponse()
  {
 //   alert("In handle response");
    try     
    {
      if (tmn.request && tmn.request.readyState == 4)
      {
        if (typeof tmn.request.status=='undefined')
        {
          throw new Error("request.status = 'undefined'");
        }
        else if (!tmn.request.status)   
        {
          // when does this occur - no connection?
          throw new Error("NS_ERROR_NOT_AVAILABLE");
        }
        else if (tmn.request.status != 200)  
        {
          clog("[WARN] HttpResponse="+tmn.request.status+": '"+urlQuery
            +"' | "+tmn.request.status+": "+tmn.request.statusText);
					return rescheduleOnError();
        }
        else // status=200 OK
        {
          if (!tmn.dataTMN.enabled) {
            tmn._updateStatusText();
            return false;
          }

          var html = tmn.request.responseText;
	//  alert(html);
//          if (tmn.doClickThroughs /*&& (Math.random() < tmn.clickThroughProb)*/) 
//          {
             try {
	      
              tmn._repProc2.init(html, engine, tmn);
	  //    alert("handleResponse is being called");
            }
            catch (ex) {
	      alert("message is " + ex. message);
              tmn._cerr("unable to init repProcessor: "
                + tmn._repProc2, ex, tmn._repProc2.init);
            }
  //        }

          //if (tmn._isBursting())  // schedule for burst
          //{
          //  //if (DBUG)cout("SCHEDULING_NEXT_BURST: "+
          //    // tmn.burstCount+" left, delay="+tmn.burstTimeout);
          //
          //  var delay = Math.min(tmn.timeout,tmn.burstTimeout);
          //  tmn._scheduleNextSearch(delay);
          //  tmn.burstCount--;
          //
          //  //if (tmn.burstCount <= 0)// Burst done
          //    //cout("BURST_MODE_COMPLETE!");
          //}
          //else  // Not bursting, schedule per usual
          //{ 
            // parse html & update query-list (only when not in burst)
//            if (tmn.evolveQueryList && (Math.random() < tmn.substitutionProb)) 
//            {
//	          	html = html.replace(/(&nbsp;)/gi," ");
//		          var newQueries = tmn._extractQueries(html, tmn.query);
//		          updateQueryList(newQueries); 
//						}
      //      tmn._scheduleNextSearch(tmn.timeout);
          }
        }
      }
   
    catch (ex)
    {
       // DO WE NOT HAVE A CONNECTION?
       if (ex.message.indexOf("NS_ERROR_NOT_AVAILABLE")>-1) {
         tmn._clog("[WARN] No available network connection...");
         //tmn._cerr("[WARN] No available network connection...",ex);
          alert("NS no avaialbale + :   " + ex.message);
       }
       else // AN UNKNOWN ERROR
         tmn._cerr("Unexpected error in handleResponse",ex);
         alert("Other error message : " + ex.message);
       rescheduleOnError();
    }
  }
    
/*adding a new tab as a test*/
       function sendLinkRequest(){
	/*	alert("adding a new tab");
           var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
           va
           r mainWindow = wm.getMostRecentWindow("navigator:browser");
           var tabX =  mainWindow.gBrowser.addTab("http://www.isna.ir");
	     gBrowser.selectedTab = gBrowser.addTab("http://www.google.com/");*/
	
	if(newTabBrowser == null){
	    
	    newTabBrowser = gBrowser.addTab("http://www.google.com");
	}
	
	else{
	//    alert("We are here!");
	    var tempBrowser = null;
	     tempBrowser = gBrowser.getBrowserForTab(newTabBrowser);
	  //   tempBrowser.contentDocument.body.innerHTML = "<div>hello world</div>";
	  tempBrowser.loadURI("http://people.scs.carleton.ca/~ssajjadp/");
	//    newTabBrowser = tempBrowser;
	    
	}
/*	var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("http://www.google.com/"));
            newTabBrowser.addEventListener("load", function () {
            newTabBrowser.contentDocument.body.innerHTML = "<div>hello world</div>";
            }, true);*/
            
          }
  
    function sendQuery(queryToSend, engine, tmn)  {
//	alert("send query " + sendQueryCounter++);
        if ( tmn_timer) clearTimeout(tmn_timer); 
        var isIncr = (queryToSend == null);
        if (queryToSend == null){ 
            if (tmn.dataTMN._incQueries && tmn.dataTMN._incQueries.length > 0) 
                queryToSend = tmn.dataTMN._incQueries.pop();
            else  {
                if (tmn.dbug)clog("No Query to send !!"); 
                return;
            }
        }
        if (Math.random() < 0.9)
            queryToSend = queryToSend.toLowerCase();
        queryToSend = queryToSend.trimRight();
        var last_query = tmn.dataTMN._query;
        tmn.dataTMN._query = queryToSend; // last sent
      
        if (!queryToSend) tmn._cout('SendQuery error! queryToSendis null')
        //cout("sending: "+queryToSend);
//	alert("sending: " + queryToSend);
        var url = tmn.dataTMN.currentUrlMap[engine];
        tmn._getPrefs().setCharPref("lastQuery", queryToSend);
        urlQuery = url.replace('|',queryToSend);
        urlQuery = urlQuery.replace(/ /g,'+');
        var encodedUrl = encodeURI(urlQuery);
      
        // bug in encodeURI method??
        encodedUrl = encodedUrl.replace(/%253/g,"%3");
       
        tmn.dataTMN._queryUrl =  encodedUrl;

      
        if (!tmn.dataTMN.enabled) return;
        //if (tmn.dbug)clog("Query will be send by sendQuery!!");  


        tmn_frame = document.getElementById("tmn-frame");
	if (tmn.dataTMN._dbug) tmn._cout('Query to be sent through frame')
        if ( !tmn_frame )
            tmn_frame = createFrame();
	  
        var showFrame = tmn._showFrame();
        tmn_frame.setAttribute("collapsed",!showFrame);
        var docFrame =  tmn_frame.contentDocument;
        var searchBox = tmn.dataTMN.getSearchBoxMap[engine](docFrame);
        var searchButton = tmn.dataTMN.getButtonMap[engine](docFrame);
	
	
	/*TODOHS check to see if we need to add calling handleResponse in _rescheduleOnError*/
        tmn_timer = setTimeout(function() { 
            return tmn._rescheduleOnError();
        },3*tmn.dataTMN._timeout);
        page_loaded = false;
	  
        tmn_frame.setAttribute("firstpage", "true");
        if ( searchBox && searchButton && !isMenuActive()
                       &&(tmn.dataTMN._cookieAccountChanged=='') && engine!='aol'
                       && last_query!= queryToSend) {
	//    alert("in here");
            searchBox.value = getCommonWords(searchBox.value,queryToSend).join(' '); 
            searchBox.selectionStart = 0;    
            searchBox.selectionEnd = 0;  
            //tmn._cout("Starting searchbox value : " + searchBox.value)                  
            //for each (var evt in allEvents) 
            //  searchBox.addEventListener(evt,dectevnt,false)
	 //   alert(searchBox.value);
            clickElt(searchBox)
            var chara = new Array();
            if (tmn.dataTMN._dbug) tmn._cout('Will type chara '+ chara)
            typeQuery( queryToSend, 0, searchBox, chara,docFrame,isIncr )
	    
	 /************************* NEW CODE ADDED FROM OLD TMN HS*************************/   
	      if (!tmn.dataTMN.enabled) return;
    try{
	//    alert("in here too");
	     // get header as array
      var headerStr = tmn.dataTMN.headerMap[engine];
      var headers = tmn.dataTMN._reqStrToArray(headerStr);
  
      // do we need these?? delete the flags
      var ver = headers['VERSION'];
      tmn._deleteFalseHeaders(headers);
	
	    tmn.request = cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
	      .createInstance(ci.nsIXMLHttpRequest);
      
	    if (tmn.request.channel instanceof ci.nsISupportsPriority) {
	      cout("[INFO] Using low priority channel for request...");
	      tmn.request.channel.priority = ci.nsISupportsPriority.PRIORITY_LOWEST;
	    }		
      
	    tmn.request.open('GET', encodedUrl, true);
      
	    // deal with google bad cookie header here?
	    for (var i in headers) {
	      if (headers[i])
		tmn.request.setRequestHeader(i, headers[i]);
	    }
    
	  //if (isIncr) cout("SENT_QUERY: incremental="+  // tmp
	  // isIncr+" burst="+tmn.burstCount+" tmn.query="+queryToSend); 
    
	  tmn.request.onreadystatechange = handleResponse;
	  tmn.request.send(null);
	  
    }
    
    catch(ex){
      alert(ex.message);
    }
	    
	 /***************************END OF NEW ADDED CODE!*************************************/
	 
        } else {
            if (tmn.dataTMN._dbug) tmn._cout('Query URL is '+ encodedUrl)
            docFrame.location.href = encodedUrl;
            if ( tmn.dataTMN._cookieAccountChanged != '' ) {
                tmn.dataTMN._cookieAccountChanged = '';
            }
            tmn._updateOnSend( engine,isIncr );
        }
    }

	
    return {  

        _setMenuActive : function(event) {
            context_menu_active = true;
    
        },
  
        _setMenuInactive : function() {
            context_menu_active = false; 
        },

        isScheduleSearch : function () {
            if (!searchScheduled) {
                searchScheduled = true;
                return false;      
            } else 
                return true;
        },

        getEngine : function() {
            if ( typeof engine=='undefined' || !engine  ) return "none";
            return  engine; 
        },
	
	
	  
     /*	  I ADDED THIS HERE, THIS DOESN"T DO ANYTHING WHEN CALLED- HS
      *   extractLinks :function (htmlStr)  {
//	alert("Extract links from tmn_search is being called");
        var reg = /<\/?(?:(?:[a][a-z])|(?:[b-z!]))[^>]*>/mig;
  
        var html = htmlStr.replace(reg,"");
  
        var l = html.split("</a>");
        var links = new Array();
        for (var i = 0;i < l.length; i++) {
            if( !l[i] || l[i] == "undefined") continue;
            l[i] += "</a>";
            if (l[i].indexOf("<a")< 0)continue;
            l[i] = l[i].replace(/[^<]+<a/img,"<a");
            l[i] = tmn._trim(l[i]);
            links.push(l[i]);
        }
//	alert(links[0]);
        return links;
    },*/
           
        doSearch : function (tmn_engine, tmn_cc, tmn_ci,tmn_extracter) 	{
//	    alert("do search being called");
//	    sendLinkRequest();
            searchScheduled = false;
            engine = tmn_engine
            cc = tmn_cc;
            ci = tmn_ci;
	    rep = tmn_extracter;
	//    alert("step 2");
            tmn = getSearchTrackMeNot();
            tmn_frame = document.getElementById("tmn-frame");
	    if (tmn.dataTMN._dbug) tmn._cout("Do Search"); 
            if (!tmn_frame)
                createFrame();
	
            if (!searchInit) {
                window.addEventListener('contextmenu', PROFILEMENOT.TMNSearch._setMenuActive, false);
                //window.addEventListener('popupshowing',PROFILEMENOT.TMNSearch._setMenuActive , false); 
                window.addEventListener('popuphiding',PROFILEMENOT.TMNSearch._setMenuInactive,false);
                var placesBar = document.getElementById('PlacesToolbar');
                if ( placesBar )   {
                    placesBar.addEventListener('popupshowing',PROFILEMENOT.TMNSearch._setMenuActive , false); 
                    placesBar.addEventListener('popuphiding',PROFILEMENOT.TMNSearch._setMenuInactive , false); 
                }
                searchInit = true;    
            }
            //try { 
            var url = tmn.dataTMN.currentUrlMap[engine];
            if (!url) { 
                tmn._cerr("doSearch()-> currentUrlMap null for "+engine);
                return; 
            }
	      
            if (tmn.dataTMN._incQueries && tmn.dataTMN._incQueries.length > 0)
                sendQuery(null, engine, tmn);
            else {
                var newquery = getQuery();     
                queryWords = newquery.split(' ');
	  
                if (queryWords.length > 3 )   {
                    getSubQuery(queryWords, tmn);
                    if (tmn._useIncrementals)   {
                        var unsatisfiedNumber = tmn._roll(1,4);
                        for (var n = 0; n < unsatisfiedNumber-1; n++)
                            getSubQuery(queryWords, tmn);
                    }	
                    // not sure what is going on here? -dch
                    if (tmn._incQueries && tmn.dataTMN._incQueries.length > 0)
                        newquery = tmn.dataTMN._incQueries.pop();
                }
                sendQuery(newquery, engine, tmn);
            }
        /*}  catch (e) {
 	      tmn._cerr("error in doSearch",e);
 	  }*/
        },
    }



}();




