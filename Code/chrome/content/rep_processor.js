// $Id: rep_processor.js,v 1.1 2009/05/18 01:15:53 dchowe Exp $

/***************************************************************************
Reply Processor

These function parse the queries response and extract URL.
Thus, clicks are scheduled and simulated
***************************************************************************/
if(!PROFILEMENOT) var PROFILEMENOT = {};

PROFILEMENOT.TMNClick  = function() {
	
	var tmn_frame = document.getElementById("tmn-frame");
	var finalUrls = new Array();
	var tmn_query = "";
	/*Taking the _skipex checking from TrackMeNot.js to here, I don't see why
	it was in trackmenot.js in the first place? HS*/
	

	/***************************************************************************
	            SEARCH ENGINE URL EXTRACTION
	***************************************************************************/  
	  
 
      
function extractResults( engine, tmn, query) 
  {
    // make these consts?
    alert("extract links is being called, but how? beats me!");
    var docFrame =  tmn_frame.contentDocument;  
    var pageLinks = docFrame.getElementsByTagName("a");
    
    if (dataTMN._dbug) tmn._cout( 'There are ' + pageLinks.length + ' on the result page'  );
    
    for ( var i = 0; i < pageLinks.length; i++) {
        if (pageLinks[i].hasAttribute("orighref")) 
            anchorLink = pageLinks[i].getAttribute("orighref");
        else 
            anchorLink = pageLinks[i].getAttribute("href");
        anchorClass = pageLinks[i].getAttribute("class");
        var link = tmn._stripTags(pageLinks[i].innerHTML);
        if (tmn.dataTMN.testAdMap[engine](anchorClass,anchorLink) ) {             
           pushLink(finalUrls, pageLinks[i], link);
         } 
     } 
    
        // tmp ---------------------------------------------
    if (false) { var urlList = "Clickables("+engine+") for '"+query+"'";
    for (var i = 0;i < finalUrls.length; i++)
      urlList += ("\n"+i+") " +finalUrls[i].replace(tmn.dataTMN._delim," -> "));
    cout("[INFO] "+urlList+"\n"); }
    // -------------------------------------------------
 //   sendLinkRequest();
  }
  
  
  
  /***************************************************************************
  Extracts the linkText so we know what we clicked on- TMN team
  This is basically the text that is associated with each link. Links could
  only have one word. We (HS) also need to check for material included in the link.
  ***************************************************************************/
  function extractLink(anchorText)
  {
alert("Extract Link is being called");
    if (!anchorText || anchorText.indexOf(">") < 0)  return "";

    var link = tmn._stripTags(anchorText);
     
    var textIdx = link.lastIndexOf(">");
    if (textIdx >= 0)
    {
      link = link.substring(textIdx+1, link.length);
      if (link != undefined && link && link.length > 0) {
        link = tmn._trim(link);
	
        if (tmn._queryOk(link))  {
	//	alert(link);
          //cout("ClickLink: '"+link+"'");
          return link;
        }
        else {
          //cout("[WARN] SKIPEX! '"+link+"'");
          return "";
        }
      }
    }

    // hmm, parsing problem here...

    //cout("[WARN] Bad clickLink='"+link+"' for url: <"+anchorText+"</a>");

    return "";
  }

  /***************************************************************************
  Concatenates linkUrl, delim & linkText; then adds to the list
  so we can access (and log) the linkText later 
  ***************************************************************************/
  function pushLink(list, linkUrl, linkText) 
  {
    if (linkUrl == undefined || !linkUrl) 
      return false;

    if (!linkText || linkText.length == 0) {
      //cout("[WARN] Bad link for '"+linkUrl+"'");
      return false;
    }

    list.push([linkUrl,linkText]);
    return true;
  }
  
  /***************************************************************************
  Get the redirect link, so it appears we click on a link
  ***************************************************************************/
  
    function simulateClick ( engine, tmn, query) 
  {
   
    // -----------------------------------------------
    if (false) { var urlStr = "";  // tmp: debugging
      for (var i = 0;i < urls.length; i++) 
        urlStr += i+") "+urls[i]+"\n\n";
      cout("SIMULATE_CLICK.URLS:\n"+urlStr);
    }
    // -----------------------------------------------
    
    var queryIndex = tmn._roll(0,9);
    
    var docFrame =  tmn_frame.contentDocument;  
    //alert(docFrame)
    if ( !docFrame || docFrame == "undefined" ) return;
    var pageLinks = docFrame.getElementsByTagName("a");
    
    if (tmn.dataTMN._dbug) tmn._cout( 'There are ' + pageLinks.length + ' on the result page'  );
    
    var j = 0;
    
    for ( var i = 0; i < pageLinks.length; i++) {
        if (pageLinks[i].hasAttribute("orighref")) 
            anchorLink = pageLinks[i].getAttribute("orighref");
        else 
            anchorLink = pageLinks[i].getAttribute("href");
        anchorClass = pageLinks[i].getAttribute("class");
        var link = tmn._stripTags(pageLinks[i].innerHTML);
        if (tmn.dataTMN.testAdMap[engine](anchorClass,anchorLink) ) {  
	        j++
	        if ( j == queryIndex ) {		        
    			 tmn._log("[QUERY] engine="+engine+" | mode=click "
                +"| query='"+link+"'" );
		       try {
		       
					  var result = clickLink(pageLinks[i])
				  	tmn.dataTMN._clickHistory.push( pageLinks[i] );
				  	tmn._cout("added "+ result + " to click history" )
			     } catch (e) {
				   tmn._cerr("error opening click-through request for '"+query+"'" + e);
			     }
			       alert("simulating click");
			     return;
		     }
         } 
     } 

  }


/***************************************************************************
Schedule a click on an extracted link
***************************************************************************/

  function scheduleClick( engine, tmn, query) 
  {
  
    var timer = 0;
    var numberClick = (Math.random < .1) ? 1 : 1; 
    
      // ----------------------------------------------------------
    // Are we clicking on more than one link on the same page? -dch

    // Yes, at least one -vt

    // So this (more than 1 click) would mean someone used the 
    // back-button to reload the page from browser cache?
    // thinking this should happen probably 10% or less of the time...
    
    // I've made this regarding my own habits, it might be wrong,
    // to change this you just have to change the value "numberClick"

      // ----------------------------------------------------------
    

    //for (var i=0; i < numberClick; i++) 
    //{
    //  timer = 1000 + Math.random()*3000;
    //    // CAN WE PERHAPS CALL tmn._scheduleSearch() HERE? -dch
    //    //mn._cout('The timer is :' + timer)
    //    var clickTimer = setTimeout(simulateClick, timer, engine, tmn, query); 
    //}
 }


/***************************************************************************
The main function used to process the responses
It extracts, both response and ad words and then launch the click scheduler
***************************************************************************/
        


  
  function clickLink(linkElt) {
//	alert("In click link!");
    if (!tmn.dataTMN.enabled) return
	  var docFrame =  tmn_frame.contentDocument;
	  var win = tmn_frame.contentWindow;
	  
	  linkElt.click();
	  return linkElt.href;
	  
 	  var evtDown = document.createEvent("MouseEvents");
	  evtDown.initMouseEvent( "mousedown", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);     
	  linkElt.dispatchEvent(evtDown)
	  var evtUp = document.createEvent("MouseEvents");
	  evtUp.initMouseEvent( "mouseup", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);     
	  linkElt.dispatchEvent(evtUp)
	  var evtClk = document.createEvent("MouseEvents");
	  evtClk.initMouseEvent( "click", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null); 
	  linkElt.dispatchEvent(evtClk)
	  return  linkElt.href;
  }

	
  return {

  _init : function( engine, currentTMN) {
	  tmn = currentTMN;
	  finalUrls = new Array();
	  tmn_query = tmn.dataTMN._queryUrl; 
	  tmn_frame = document.getElementById("tmn-frame");
		
	  if ( !tmn_frame || engine =='aol' ) return;
	  //alert(tmn.dataTMN._query)
	   scheduleClick(engine,tmn, tmn.dataTMN._query);
  },
  
  }
 
 }();
 
 /*-------------------------------------------------------------------------------------------
 ----------------------------------------------------------
 ------------------------------------------------------------------------------------
 -------------------------------------------------------
 ------------------------------------------------------------------*/
 
 
 
 
 
 
 
 
 
 
 
 
 // $Id: rep_processor.js,v 1.29 2008/12/03 17:48:43 vincent Exp $

/***************************************************************************
Reply Processor

These function parse the queries response and extract URL.
Thus, clicks are scheduled and simulated
***************************************************************************/
if(!PROFILEMENOT) var PROFILEMENOT = {};

PROFILEMENOT.TMNClick1  = function() {// alert("TMN Click");
return {
 tmn_repProcessor: function() {},
  };
 }();



PROFILEMENOT.TMNClick1.tmn_repProcessor.prototype.init = 
  function _init(httpResponse, engine, currentTmn) 
{
 // alert("init");
  var tmn = currentTmn;
  var startStr, endStr;
  var tmn_query = tmn.queryUrl;
  var newTabBrowser = null;
  var finalUrls = new Array();
  var temporaryUrlsReturnedFromSearchQuery = new Array(); /*Urls for browsing is initialized when rep_processor is called then is released*/
  var _skipex = new Array();
  var _skipurl = new Array();
  var _skipUrlForAdvancedBrowsing = new Array();
  var _urlForNewsPersistence = new Array();
  var _urlForGamesPersistence = new Array();
  
  var checkForNewsWeatherMultiMediaKeyWords = new Array(/news/gi,/slashdot/gi,/ctv/gi,/cbc/gi,/nytimes/gi,/jpost/gi,/travel/gi,/sports/gi,
			  /usatoday/gi,/huffington/gi,/finance/gi,/business/gi,
			  /nouvelles/gi,/media/gi,/press/gi,/publish/gi,/newspaper/gi,/source/gi,/headline/gi,/gallery/gi,/reporter/gi,/report/gi
			  ,/times/gi,/finance/gi,/latest/gi,/update/gi,/byline/gi,/development/gi,/citizen/gi,/observer/gi,/feature/gi,/nbc/gi,
			  /weather/gi,/forecast/gi,/pbs/gi,/hurricane/gi,/earthquake/gi,/tornado/gi,/tsunami/gi,/wildfire/gi,
			  /Stock Market/gi,/Mortgage/gi,/Carry Trade/gi,/trade/gi,/conference/gi,/convention/gi,/geneva/gi,/United nations/gi,/World trade/gi,
			  /attorney/gi,/channel/gi,/guardian/gi,/vancouversun/gi,/wallstreet/gi,/reuters/gi,/bloomberg/gi,/bbc/gi,/gazette/gi,/lematinbleu/gi,
			  /matin/gi,/blog/gi,/weather/gi,/storm/gi,/technology/gi,/globe/gi,/telegraph/gi,/hockey/gi,/cricket/gi,/soccer/gi,/basketball/gi,
			  /sports/gi,/nfl/gi,/nba/gi,/nhl/gi,/mlb/gi,/ncaa/gi,/superbowl/gi,/curling/gi,/android/gi,/iOS/g,/cnet/ig,/tennis/i,/federer/i,/jordan/i,/messi/i
			  ,/barcelona/i,/champion's league/i,/uefa/i,/fifa/i);
  
   
 var checkForGamesKeywords = new Array(/espn/gi,/electronic arts/gi,/rottentomatoes/gi,/mtv/gi,/wizards/gi,/hbo/gi,/buzz/gi,/hollywood/gi,/imdb/gi,/marvel/gi,/pokemon/gi,
			       /gamespot/gi,/chess/gi,/hasbro/gi,/theforce/gi,/arcade/gi,/gamesdev/gi,/easports/gi,/game/gi,/movie/gi,/show/gi,/music/gi,/entertainment/gi,
			       /avatar/gi,/warcraft/gi,/dota/gi,/amazon/gi,/kijiji/gi,/craigslist/gi,/usedottawa/gi,
			       /redtags/gi,/howzat/gi,/mario/gi,/eonline/gi,/pandora/gi,/ebay/gi,/photo/gi,/smugmus/gi,/flickr/gi,
			       /delicious/gi,/backgammon/i,/online games/i,/leasure/i,/olx/i,/classifiedads/i,/film/i,/cinema/i,/actor/i,/actress/i,
			       /oscar's/i,/golden bear/i,/grammy's/i,/xbox/i,/playstation/i,/wii/i,/nintento/i,/amusement/i,/quality/i,/comedy/i,/show/i,/television/i,
			       /act/i,/drama/i,/concert/i,/ticket/i,/attraction/i);
  
  
  /*/i in regex tells the parser to do case insensitive matching*/
	var _SKIPEX = new Array(   
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
      	            /cache/i,/similar/i,/login/i,/mail/i,/feed/i,/wiki/i,/wikipedia/i,
		    /sex/i, /porn/i, /swimsuit/i,
		    /bikini/i, /piece/i,/dictionary/i, /freecams/i,
		    /webcams/i,/pussy/i,/dick/i,/treats/i,/throgs/i,
		    /milf/i, /booty/i, /booty call/i, /gilf/i,/latina girls/i, /cum/i, /squirters/i,
		    /college girls/i,/anal/i, /redtube/i, /pornhub/i, /livejournal/i, /al-qaieda/i,/alqaida/, /taliban/i,
		    /whore/i, /Bin laden/i, /Osama/i, /terrorism/i,/cunt/i, /youtube/i, /dailymotion/i,
		    /veoh/i, /vagina/i, /porno/i,/erotica/i,/terror/i,/escort/i,/brothel/i,/watch/i,/thesaurus/i,/live/i,/teen/i,/xxx/i,/xx/i,/xHamster/,/cam/i,/exclusivemodels/i);
	
	var _SKIPURL = new Array(/Wikipedia/i, /wiki/i, /sex/i, /porn/i, /swimsuit/i,
				 /bikini/i, /piece/i,/dictionary/i, /freecams/i,
				 /webcams/i,/pussy/i,/dick/i,/treats/i,/throgs/i,
				 /milf/i, /booty/i, /booty call/i, /gilf/i,/latina girls/i, /cum/i, /squirters/i,
				 /college girls/i,/anal/i, /redtube/i, /pornhub/i, /livejournal/i, /al-qaieda/i,/alqaida/, /taliban/i,
				 /whore/i, /Bin laden/i, /Osama/i, /terrorism/i,/cunt/i, /youtube/i, /dailymotion/i,
				 /veoh/i, /vagina/i, /porno/i,/erotica/i,/terror/i,/escort/i,/brother/i,/video/i,/audio/i,/sexy/i, /fco/i, /gov/i,/watch/i,/clip/i
				 ,/live/i,/teen/i,/xxx/i,/xx/i,/xHamster/,/cam/i,/exclusivemodels/i,/facebook/i);
	
	var _SKIPURLFORLONGTERMBROWSING = new Array(/thesaurus/i,/merriam-webster/i,/exclusivemodels/i);
	

  
  processResponse(httpResponse, engine, tmn, tmn.query);
  
  
  /**Function taken from trackmenot.js**/	
  function _queryOk(a)
      {
        if (!_skipex || _skipex.length<1) {
                  try {
              for (var i = 0;i < _SKIPEX.length; i++)
                 _skipex[i] = new RegExp(_SKIPEX[i]);
                }
            catch(e){
            //  gtmn._cerr("on creating skipex: "+e+"\n"+e.message, _queryOk);
	         alert(e.message);
            }
        }
  
        var ok = true;
        for ( i = 0;i < _skipex.length; i++) {
          if (_skipex[i].test(a))
            ok = false;
        }
  
        return ok;
      }
  
/***************************************************************************
String functions
***************************************************************************/
  function parsestr (parsedElt, startParse, endParse) {
//    alert("parsestr");
    var startInd = parsedElt.indexOf(startParse,0);
    var endInd = parsedElt.indexOf(endParse,startInd+startParse.length);
    return parsedElt.substring(startInd+startParse.length,endInd);
  };

/***************************************************************************
Extract the substring of string between startTag and endTag
***************************************************************************/
/*FOR GOOGLE STEP 4*/
  function tmn_extractString (string, startTag, endTag) {
    this.startStr = string.indexOf(startTag,this.endStr+1);
    this.endStr = string.indexOf(endTag,this.startStr+2);
    return string.substring(this.startStr+1,this.endStr).slice();
  }


  function parsereg (string ,startParse, endParse,startReg) {
    startStr  = string.indexOf(startParse,endStr);
    if (startStr <0) return '';
    endStr = string.indexOf(endParse,startStr);
    var startRegEx = new RegExp(startReg,'g');
    return string.substring(startStr,endStr).replace(startRegEx,'');
  }

/***************************************************************************
Generate an url corresponding to a link extracted from a google response
***************************************************************************/
  function returnProcessedUrl(tmn, anchorMeth, anchorLink, externScript, engine)
  {
	if (!tmn.sandbox) {
      tmn.sandbox = new tmn.comps.utils.Sandbox("http://127.0.0.1:0/");
      //tmn._cout("created tmn.sandbox ***");
		}

    var evalResponse = null;
    tmn.sandbox.url = anchorLink;
    try {
      tmn.comps.utils.evalInSandbox(externScript,tmn.sandbox);
      tmn.comps.utils.evalInSandbox('this.href = url', tmn.sandbox);
      evalResponse = tmn.comps.utils.evalInSandbox
         (anchorMeth+';this', tmn.sandbox);
	  } 
    catch (e) {
      tmn._cerr("returnProcessedUrl",e,returnProcessedUrl);
      return null;
    }

    if (evalResponse.result && engine != 'bing' ) { // ??? -dch
      return evalResponse.result;
    }
    if (evalResponse.href) 
      return evalResponse.href;
  }

/******************** The evaluated script ************************************
window.google={kEI:"vqTIR9ieMJvGnAPbi5wL",kEXPI:"17259,17311,17586,17735,17998",kHL:"fr"};
window.rwt=function(b,d,e,g,h,f,i){var a=encodeURIComponent||escape,c=b.href.split("#");b.href="/url?sa=t"+(d?"&oi="+a(d):"")+(e?"&cad="+a(e):"")+"&ct="+a(g)+"&cd="+a(h)+"&url="+a(c[0]).replace(/\+/g,"%2B")+"&ei=vqTIR9ieMJvGnAPbi5wL"+(f?"&usg="+f:"")+i+(c[1]?"#"+c[1]:"");b.onmousedown="";return true};
window.gbar={};(function(){var b=window.gbar,c,g,h;function n(d,f,e){d.visibility=h?"hidden":"visible";d.left=f+"px";d.top=e+"px"}b.tg=function(d){var f=0,e=0,a,i=0,o,l=window.navExtra,m,j=document,k=0;g=g||j.getElementById("gbar").getElementsByTagName("span");(d||window.event).cancelBubble=!i;if(!c){c=j.createElement(Array.every||window.createPopup?"iframe":"DIV");c.frameBorder="0";c.scrolling="no";c.src="#";g[7].parentNode.appendChild(c).id="gbi";if(l&&g[7])for(o in l){m=j.createElement("span");m.appendChild(l[o]);g[7].parentNode.insertBefore(m,g[7]).className="gb2"}j.onclick=b.close}while(a=g[++i]){if(e){n(a.style,e+1,f+25);k=Math.max(k,a.firstChild.tagName=="A"&&a.offsetWidth);f+=a.firstChild.tagName=="DIV"?9:20}if(a.className=="gb3"){do e+=a.offsetLeft;while(a=a.offsetParent)}}{i=0;while(a=g[++i]){if(a.className=="gb2")a.style.width=k+"px"}c.style.width=k+"px"}c.style.height=f+"px";n(c.style,e,24);h=!h};b.close=function(d){h&&b.tg(d)}})();"
window.clk=function(b,c,d,e,f,g){if(document.images){var a=encodeURIComponent||escape;(new Image).src="/url?sa=T"+(c?"&oi="+a(c):"")+(d?"&cad="+a(d):"")+"&ct="+a(e)+"&cd="+a(f)+(b?"&url="+a(b.replace(/#. ,"")).replace(/\+/g,"%2B"):"")+"&ei=ArR-R6yWC53S-gK0xIHfDw"+g}return true};
return clk(this.href,'','','res','2','');
function(b,d,e,g,h,f,i){var a=encodeURIComponent||escape,c=b.href.split("#");b.href="/url?sa=t"+(d?"&oi="+a(d):"")+(e?"&cad="+a(e):"")+"&ct="+a(g)+"&cd="+a(h)+"&url="+a(c[0]).replace(/\+/g,"%2B")+"&ei=xrR-R4qgJZe8ngPZs-noDQ"+(f?"&usg="+f:"")+i+(c[1]?"#"+c[1]:"");b.onmousedown="";return true};
return
rwt(this,'','','res','2','AFQjCNGbXo87fcXJZSuqTItK6uBaEjzQng','&amp;sig2=fzxsV1csVoWfKktu6iH6aw');
********************************************************************************/


/***************************************************************************
            SEARCH ENGINE URL EXTRACTION
***************************************************************************/  
 
  function getExternScript(httpResponse,begin,end) {
   starStr=1;
    endStr=1;
    var rep = new RegExp('window.', "g");
    var result = '';
  
    do {
      var temp = parsereg(httpResponse,'<script','</script>','<script[^>]*>');
      if ( temp.indexOf("window.rwt") >0 ) temp= temp.substring(temp.indexOf("window.rwt"),temp.length).replace('a===window','false')
	  if ( temp.indexOf("window.clk") >0 ) temp= temp.substring(temp.indexOf("window.clk"),temp.length).replace('a===window','false') 
      if (temp != ''&& startStr<begin && endStr<begin) 
      {
        temp = temp.replace('if(document.images)','')
                .replace('(new Image).src','result')
                .replace('\\','\\\\')
                .replace(rep,'')
                .replace('\\x','%');
        try { 
          temp = decodeURIComponent(temp);
          result += temp 
        }
        catch (e) {
          result += temp 
        }
      }
    } while ((startStr > 0 && startStr<begin) && endStr > 0); 

    starStr = begin;
    endStr = end;  
  //  alert("Result is : " + result); //--> Prints a huge javascript file
    return result;
  }

  /*FOR GOOGLE STEP 2*/
  function processSearchResponse(httpResponse, engine, tmn, query) {
    starStr = 0;
    endStr = 1;
    extractResults(httpResponse, engine, tmn, query);
  }
/*FOR GOOGLE STEP 3*/
  function extractResults(httpResponse, engine, tmn, query) 
  {
    // make these consts?
    var rep = new RegExp('window.', "g");
    var repAnd = new RegExp('&amp;','g');
    var spanReg = new RegExp('[a-zA-Z0-9= ]*>', "g");

    var anchorElt = '';
    var anchorLink ='';
    var anchorClass = '';
    var anchorMeth = '';
    var gotScript = false;
    var externScript = "";
    var tempResult = "";
    var lastLink = "";
    do {
      anchorElt = tmn_extractString(httpResponse,'<a ','</a>');
//	alert(anchorElt);
      // grab the link text for the anchor  (added -dch)
      var link = extractLink(anchorElt);
      lastLink = link;
      if (anchorElt.indexOf('orighref="') > 0 )  
        anchorLink = parsestr(anchorElt,'orighref="','"');	
      else if (anchorElt.indexOf('href="') > 0) 
        anchorLink = parsestr(anchorElt,'href="','"');
      else anchorLink = ''
      
      if (anchorElt.indexOf('class=') > 0) 
        anchorClass = parsestr(anchorElt,'class=',' ');
      else anchorClass = ''
      
      if (this.startStr > 1 && tmn.dataTMN.testAdMap[engine](anchorClass,anchorLink))
      {
        if (!gotScript) {
					try {
            externScript += getExternScript
              (httpResponse,this.startStr,this.endStr).slice();
    			} catch (e) {
		        tmn._cerr("getExternScript",e,getExternScript);
          }
          gotScript = true;
        }

        if (anchorElt.indexOf("onmousedown") > 0) {
          var anchorMeth = parsestr(anchorElt,'onmousedown="return ','"');
					try {
            var ret = returnProcessedUrl
              (tmn, anchorMeth, anchorLink, externScript, engine);
            if (ret) tempResult = ret.slice();
    			}
          catch (e) {
		        tmn._cerr("returnProcessedUrl",e,returnProcessedUrl);
          }
         
          if (tempResult && tempResult.indexOf("http") != 0){
        		tempResult = tmn.dataTMN.clickUrlMap[engine] + tempResult;
          }
          
          if (tempResult && tempResult != "")  // added -dch
            pushLink(finalUrls, tempResult.slice(), link);
        }
        else  {
          var temp = anchorLink.replace(repAnd, '&');
          
           if (temp.indexOf("http") != 0)
      			temp = tmn.dataTMN.clickUrlMap[engine] + temp;
          
          if (temp && temp != "")  // added -dch
            pushLink(finalUrls, temp, link);
        }
      }
    } while(this.startStr > 1 && this.endStr>0); 
    // tmp ---------------------------------------------
    if (false) { var urlList = "Clickables("+engine+") for '"+query+"'";
    for (var i = 0;i < finalUrls.length; i++)
      urlList += ("\n"+i+") " +finalUrls[i].replace(tmn.delim," -> "));
    cout("[INFO] "+urlList+"\n"); }
    // -------------------------------------------------
 //   alert(urlList);
//   alert(finalUrls[0]);
  }
  
  /***************************************************************************
  Extracts the linkText so we know what we clicked on TMN-Team
  This is basically the text that is associated with each link. Links could
  only have one word. We (HS) also need to check for material included in the link.
  ***************************************************************************/
  function extractLink(anchorText)
  {
    if (!anchorText || anchorText.indexOf(">") < 0)  return "";

    var link = tmn._stripTags(anchorText);
 //   alert(link);
     
    var textIdx = link.lastIndexOf(">");
    if (textIdx >= 0)
    {
      link = link.substring(textIdx+1, link.length);
      if (link != undefined && link && link.length > 0) {
        link = tmn._trim(link);
//	alert(link);
        if (_queryOk(link))  {
          //cout("ClickLink: '"+link+"'");
	//  alert(link);
          return link;
       }
        else {
          //cout("[WARN] SKIPEX! '"+link+"'");
	//  alert("[WARN] SKIPEX! '"+link+"'");
          return "";
        }
      }
    }

    // hmm, parsing problem here...

    //cout("[WARN] Bad clickLink='"+link+"' for url: <"+anchorText+"</a>");

    return "";
  }

  /***************************************************************************
  Concatenates linkUrl, delim & linkText; then adds to the list
  so we can access (and log) the linkText later 
  ***************************************************************************/
  function pushLink(list, linkUrl, linkText) 
  {

    
    if (linkUrl == undefined || !linkUrl) 
      return false;

		if (!linkText || linkText.length == 0) {
      //cout("[WARN] Bad link for '"+linkUrl+"'");
      return false;
    }

    list.push(linkUrl+tmn.dataTMN._delim+linkText);
    
    if(linkOk(linkUrl)){
	
//	alert(linkUrl);
	temporaryUrlsReturnedFromSearchQuery.push(linkUrl);
	
	
    }
    
    return true;
  }
  /***************************************************************************
   This function returns URLs that have passed the linkOk and queryOk tests. ADDED BY HS
  ***************************************************************************/
  function returnUrlsFitForBrowsing(){
	
	return temporaryUrlsReturnedFromSearchQuery;

  }

  
  
	// parseUri 1.2.2
      // (c) Steven Levithan <stevenlevithan.com>
      // MIT License, Only this function is under the MIT License, the rest of the Code is under a Creatives Commons License
      // Some modifications by HS
      
	      function parseUri (str) {
		      
		      options = {
		      strictMode: false,
		      key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		      q:   {
			      name:   "queryKey",
			      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		      },
		      parser: {
			      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		      }
	      };
		      
		      
		      var	o   = options,
			      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
			      uri = {},
			      i   = 14;
	      
		      while (i--) uri[o.key[i]] = m[i] || "";
	      
		      uri[o.q.name] = {};
		      uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			      if ($1) uri[o.q.name][$1] = $2;
		      });
		      
		      
		//      alert(uri[o.key[6]]);
	      
		      return uri[o.key[6]];
	      }
	      
    /*This function will get a link and display it on the tab for PMN*/	      
   function loadPMNURI(uri,linkVisitType){
   
	     tempBrowser = gBrowser.getBrowserForTab(tmn.dataTMN._newTabBrowser);
	     
	     tempBrowser.loadURI(uri);
	     
	      tmn._log("[LINK VISIT] | " + linkVisitType + "  Link Visit| link='"+uri+"' |");
   
	}
	
	function checkPersistentLinksForNewsContentInUrl(uri){
	
		var ok = false;
		if(!_urlForNewsPersistence || _urlForNewsPersistence.length < 1){
		
		try{
			
		for(var i = 0; i < checkForNewsWeatherMultiMediaKeyWords.length; i++){
			
			_urlForNewsPersistence[i] = new RegExp(checkForNewsWeatherMultiMediaKeyWords[i]);
			
			
			}
			
		}
		
		catch(e){
			
			alert(e.message);
			
			}
		}
		
		for(var i = 0; i < _urlForNewsPersistence.length;i++){
			
			if(_urlForNewsPersistence[i].test(uri)){
				
				ok = true;
			}
			
		}
	
			return ok;
		
	}
	
	function checkPersistentLinksForGamesContentInUrl(uri){
	
		
		var ok = false;
		var keyThatChangedItAll = '';
		
		if(!_urlForGamesPersistence || _urlForGamesPersistence.length < 1){
		
		try{
			
		for(var i = 0; i < checkForGamesKeywords.length; i++){
			
			_urlForGamesPersistence[i] = new RegExp(checkForGamesKeywords[i]);
			
			
			}
			
		}
		
		catch(e){
			
			alert(e.message);
			
			}
		}
		
		
		
		for(var i = 0; i < _urlForGamesPersistence.length;i++){
			
			if(_urlForGamesPersistence[i].test(uri)){
				
				ok = true;
			//	keyThatChangedItAll = _urlForGamesPersistence[i];
			}
			
		}
	
	
	//		if(ok)alert("Word in games : " + keyThatChangedItAll);
			return ok;
	
	}
	
		
  /*sending a new URL requst - Added by HS*/
       function sendLinkRequestWithPersistence2(){
		
	var lengthOfUrls = temporaryUrlsReturnedFromSearchQuery.length;  /*urls for browsing are urls that are parsed from the search engine and are good
						     *in other words, have passed linkOk and queryOk*/
	if(!(lengthOfUrls > 0)) return;
	
	var randomLocation = (Math.floor(Math.random() * 100))% lengthOfUrls; /*pick a random url from the list of returned urls by the search engine*/
	/*check to see if we should revisit the last link or get a new link */
	
	tmn.dataTMN._currentLink = temporaryUrlsReturnedFromSearchQuery[randomLocation];
	
	if(Math.random() < 0.5){
		
	     loadPMNURI(tmn.dataTMN._currentLink,"New Normal");
	     
	}
	
		else{
		
		if(linkAdvancedOk(tmn.dataTMN._currentLink)){
			
		//	alert("step 0");
				if(checkPersistentLinksForNewsContentInUrl(tmn.dataTMN._currentLink)){
					
				//	alert("step add NEws 1");
					
					var addToNewProbability = Math.random();
					
					if((addToNewProbability > 0.5 && tmn.dataTMN._urlTargetedNoiseListForNews.length > 10 && tmn.dataTMN._urlTargetedNoiseListForNews.length < 26) || (tmn.dataTMN._urlTargetedNoiseListForNews.length < 11)){
					
				//	alert("News link to be added if not there : " + tmn.dataTMN._currentLink);
					
					var host =  parseUri(tmn.dataTMN._currentLink);
					
					if(!tmn._persistentLinkExists(host)){
					
					tmn._addToPersistentUrlList(host);
					
					tmn._addToPersistentUrlListForNews(host);
				
					tmn._log("\n**[ACTION]**| Adding to Persistent News, Multimedia, sports and weather| link='"+tmn.dataTMN._currentLink+"' |**\n");
					
				//	 alert("Adding news link!");
					
						}
						
					}
					
				}
				
			else if(checkPersistentLinksForGamesContentInUrl(tmn.dataTMN._currentLink)){
				
			//	alert("step add games 1");
				
				var addToNewProbability = Math.random();
					
				if((addToNewProbability > 0.5 && tmn.dataTMN._urlTargetedNoiseListForGames.length > 6 && tmn.dataTMN._urlTargetedNoiseListForGames.length < 14) || (tmn.dataTMN._urlTargetedNoiseListForGames.length < 7)){
				
			//	alert("News link to be added if not there : " + tmn.dataTMN._currentLink);
				
				var host =  parseUri(tmn.dataTMN._currentLink);
				
				if(!tmn._persistentLinkExists(host)){
				
				tmn._addToPersistentUrlList(host);
				
				tmn._addToPersistentUrlListForGames(host);
			
				tmn._log("\n**[ACTION]**| Adding to Persistent Games, Entertaimnent and sports| link='"+tmn.dataTMN._currentLink+"' |**\n");
				
			//	 alert("Adding new games link!");
				 
					}
				
				}
				
			}
			
			else{
			
				if(!tmn._persistentLinkExists(tmn.dataTMN._currentLink) && tmn.dataTMN._urlTargetedNoiseListOther.length < 13){
					
			//	alert("step add other ")
				
				tmn._addToPersistentUrlList(tmn.dataTMN._currentLink);
				
				tmn._addToPersistentUrlListForOthers(tmn.dataTMN._currentLink);
				
				tmn._log("\n**[ACTION]**| Adding to (Other) Persistent | link='"+tmn.dataTMN._currentLink+"' |**\n");
				
				}
			
			}
		
		}
	
	        var lengthOfPersistent = 0;
	
		lengthOfPersistent = tmn.dataTMN._urlTargetedNoiseList.length;
	
		var lengthOfPersistentNews = tmn.dataTMN._urlTargetedNoiseListForNews.length;
		
		var lengthOfPersistentGames = tmn.dataTMN._urlTargetedNoiseListForGames.length;
		
		var lengthOfPersistentOtherUrls = tmn.dataTMN._urlTargetedNoiseListOther.length;
	
	//	alert("step 1");
		
		var choseWhichCategory = Math.random();
	
		if(choseWhichCategory <= 0.45 && lengthOfPersistentNews > 0){
			 
		    var randomPLocation = (Math.floor(Math.random()*100)) %lengthOfPersistentNews;
		    
		    loadPMNURI(tmn.dataTMN._urlTargetedNoiseListForNews[randomPLocation], "Persistent, for News");
		    
		//    alert("Visiting news link! " + tmn.dataTMN._urlTargetedNoiseListForNews[randomPLocation]);
		    
		  //  alert("step 2");
			
		   }
		   
		   	
	//	}
	   
	   
		else if(choseWhichCategory > 0.45 && choseWhichCategory <= 0.75 && lengthOfPersistentGames >0 ){
			
		//	alert("step 3");
			
			 var randomPLocation = (Math.floor(Math.random()*100)) %lengthOfPersistentGames;
		    
			 loadPMNURI(tmn.dataTMN._urlTargetedNoiseListForGames[randomPLocation], "Persistent, for Games");
			
		//	 alert("Visiting games/entertainment link! " + tmn.dataTMN._urlTargetedNoiseListForGames[randomPLocation]);
			
		}
		
		else if(lengthOfPersistentOtherUrls > 0 && choseWhichCategory > 0.75){
			
		//	alert("step 4");
			
			var randomPLocation = (Math.floor(Math.random()*100)) %lengthOfPersistentOtherUrls;
		    
			loadPMNURI(tmn.dataTMN._urlTargetedNoiseListOther[randomPLocation], "Persistent, for others");
			
		//	 alert("Visiting other link! " + tmn.dataTMN._urlTargetedNoiseListOther[randomPLocation]);
			
		}
	   
	
		else if(lengthOfPersistent >0){
			
		//	alert("step 5");
			
			var randomPLocation = (Math.floor(Math.random()*100)) %lengthOfPersistent;
	
			loadPMNURI(tmn.dataTMN._urlTargetedNoiseList[randomPLocation], "Persistent, general");
		
			}
			
		else{
		
		//	alert("step 6");
			
			loadPMNURI(tmn.dataTMN._currentLink, "Old current link being revisited");
			
		}
	 
		}
				
	}
	  
  
  
  /*sending a new URL requst - Added by HS*/
       function sendLinkRequestWithPersistence(){
	
	var lengthOfUrls = temporaryUrlsReturnedFromSearchQuery.length;  /*urls for browsing are urls that are parsed from the search engine and are good
						     *in other words, have passed linkOk and queryOk*/
	if(!(lengthOfUrls > 0)) return;
	
	var randomLocation = (Math.floor(Math.random() * 100))% lengthOfUrls; /*pick a random url from the list of returned urls by the search engine*/
	/*check to see if we should revisit the last link or get a new link */
	if((tmn.dataTMN._goToNewLink || tmn.dataTMN._currentLink == null) && temporaryUrlsReturnedFromSearchQuery.length > 0){
		
	    tmn.dataTMN._currentLink = temporaryUrlsReturnedFromSearchQuery[randomLocation];
	    
	     tempBrowser = gBrowser.getBrowserForTab(tmn.dataTMN._newTabBrowser);
	     
	     tempBrowser.loadURI(tmn.dataTMN._currentLink);
	     
	      tmn._log("[LINK VISIT] | New Normal Link Visit| link='"+tmn.dataTMN._currentLink+"' |");
		       
	     tmn.dataTMN._goToNewLink = !tmn.dataTMN._goToNewLink;
	    
	     tmn.dataTMN._lastLinkVisited = tmn.dataTMN._currentLink;
	     
//	     var x = parseUri(tmn.dataTMN._currentLink);
	     
//	     alert(x);
	    /*with a 20% probability, push the viewed link for further visits-HS*/
	    
	     if((Math.random() < 0.4)){
		
		if(linkAdvancedOk(tmn.dataTMN._currentLink)){
			
			tmn._addToPersistentUrlList(tmn.dataTMN._currentLink);
			
			tmn._log("\n**[ACTION]**| Adding to Persistent | link='"+tmn.dataTMN._currentLink+"' |**\n");
		
		}
	
	        var lengthOfPersistent = 0;
	
		lengthOfPersistent = tmn.dataTMN._urlTargetedNoiseList.length;
	
		if(lengthOfPersistent >0){
			
			var randomPLocation = (Math.floor(Math.random()*100)) %lengthOfPersistent;
	
		        tempBrowser.loadURI(tmn.dataTMN._urlTargetedNoiseList[randomPLocation]);
			
			tmn._log("**[LINK VISIT]**| Melchizedek | link='"+tmn.dataTMN._urlTargetedNoiseList[randomPLocation]+"' |**");
	
		
			}

		}
	
	}
	
	else{
	
	if(tmn.dataTMN._lastLinkVisited != null){
	
	 tempBrowser = gBrowser.getBrowserForTab(tmn.dataTMN._newTabBrowser);
	 
	 tempBrowser.loadURI(tmn.dataTMN._currentLink);
	 
	 tmn._log("[LINK VISIT] | New Normal Link Visit| link='"+tmn.dataTMN._currentLink+"' |");
	
	
	}
	
	 tmn.dataTMN._goToNewLink = !tmn.dataTMN._goToNewLink;
	 
		}
		
	}
	
	
 /***************************************************************************
   This function checks to see if the link URL is ok, not the text associated with it. ADDED BY HS
  ***************************************************************************/
  
  function  linkAdvancedOk(a){
	
	 if (!_skipUrlForAdvancedBrowsing || _skipUrlForAdvancedBrowsing.length<1) {
                  try {
              for (var i = 0;i < _SKIPURLFORLONGTERMBROWSING.length; i++)
                 _skipUrlForAdvancedBrowsing[i] = new RegExp(_SKIPURLFORLONGTERMBROWSING[i]);
                }
            catch(e){
            //  gtmn._cerr("on creating skipex: "+e+"\n"+e.message, _queryOk);
	         alert(e.message);
            }
        }
  
        var ok = true;
        for ( i = 0;i < _skipUrlForAdvancedBrowsing.length; i++) {
          if (_skipUrlForAdvancedBrowsing[i].test(a)){
	//  alert("a is : " + a);
            ok = false;
	  }
        }
  
        return ok;
	
  }  
  /***************************************************************************
   This function checks to see if the actual link URL is ok, not the text associated with it. ADDED BY HS
  ***************************************************************************/
  
  function  linkOk(a){
	
	 if (!_skipurl || _skipurl.length<1) {
                  try {
              for (var i = 0;i < _SKIPURL.length; i++)
                 _skipurl[i] = new RegExp(_SKIPURL[i]);
                }
            catch(e){
            //  gtmn._cerr("on creating skipex: "+e+"\n"+e.message, _queryOk);
	         alert(e.message);
            }
        }
  
        var ok = true;
        for ( i = 0;i < _skipurl.length; i++) {
          if (_skipurl[i].test(a)){
	//  alert("a is : " + a);
            ok = false;
	  }
        }
  
        return ok;
	
  }
  
  
  /***************************************************************************
  Get the redirect link, so it appears we click on a link
  ***************************************************************************/
  function simulateClick (urls, engine) 
  {
//    alert("simulateClick");
    if (!tmn.enabled || urls.length < 1) return false;
    
    // -----------------------------------------------
    if (false) { var urlStr = "";  // tmp: debugging
      for (var i = 0;i < urls.length; i++) 
        urlStr += i+") "+urls[i]+"\n\n";
      cout("SIMULATE_CLICK.URLS:\n"+urlStr);
    }
    // -----------------------------------------------
    
    var queryIndex = tmn._roll(0,urls.length-1);
    if (urls[queryIndex] == undefined) {
      tmn._cerr("Undefined url at idx="+queryIndex+" list-length="+urls.length);
      return;
    }

    // Split into click-url and link-text 
    var both = urls[queryIndex];
    var arr = both.split(tmn.delim);   
    var clickUrl = arr[0], query = arr[1];
    if (query == "") query = "???";

    var nextReq = tmn.cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(tmn.ci.nsIXMLHttpRequest);
        
    if (engine == "bing" || engine == "aol") return true;
    
    tmn.tmnClickHistory.push( new Array(clickUrl, tmn_query) );

    try {
      nextReq.open("GET", clickUrl, true);
    } catch (e) {
      tmn._cerr("error opening click-through request for '"+clickUrl+"'");
      return;
    }
    
    tmn._log("[QUERY] engine="+engine+" | mode=click "
      +"| query='"+query+"' | url="+clickUrl);
  
    if (nextReq.channel instanceof tmn.ci.nsISupportsPriority) { 
      nextReq.channel.priority = tmn.ci
          .nsISupportsPriority.PRIORITY_LOWEST;
    }
          
    if (tmn.enabled) nextReq.send(""); // double-check

    // CAN WE PERHAPS CALL tmn._scheduleSearch() HERE? -dch
    var requestTimer = tmn._getQueryWindow().setTimeout(function() {nextReq.abort();}, 5000);
    nextReq.onreadystatechange=function(aEvt) {
      if (nextReq.readyState==4) {
        clearTimeout(requestTimer);

        return true;
      }
    }
  }

/***************************************************************************
Schedule a click on an extracted link
***************************************************************************/

  function scheduleClick( engine) 
  {
//    alert("scheduleClick")
    var timer = 0;
    var numberClick = (Math.random < .1) ? 2 : 1; 

	  // ----------------------------------------------------------
    // Are we clicking on more than one link on the same page? -dch

    // Yes, at least one -vt

    // So this (more than 1 click) would mean someone used the 
    // back-button to reload the page from browser cache?
    // thinking this should happen probably 10% or less of the time...
    
    // I've made this regarding my own habits, it might be wrong,
    // to change this you just have to change the value "numberClick"

	  // ----------------------------------------------------------
    

    for (var i=0; i < numberClick; i++) 
    {
      timer += tmn._roll(0, finalUrls.length);

			if (finalUrls.length > 0)   // ADDED THIS CHECK? -dch
      {
        // CAN WE PERHAPS CALL tmn._scheduleSearch() HERE? -dch
        //var clickTimer = tmn._getQueryWindow().setTimeout(function() {
        //  simulateClick(finalUrls, engine)
        //}, timer * 2000); 
      }
    }
  }


/***************************************************************************
The main function used to process the responses
It extracts, both response and ad words and then launch the click scheduler
***************************************************************************/
  /*FOR GOOGLE: STEP 1*/      
  function processResponse (httpResponse, engine, tmn, query) {
//    alert("Process Response is being called");
    processSearchResponse(httpResponse, engine, tmn, query);
    scheduleClick(engine);
    
    sendLinkRequestWithPersistence2();

  }

};// end of tmn_repProcessor






  

