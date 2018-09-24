// JavaScript Document
if (!PROFILEMENOT) var PROFILEMENOT = {};

PROFILEMENOT.utils = function () {  
      return {
          getTMNService: function(){
            var service = Components.classes['@mrl.nyu.edu/trackmenot;1']
              .createInstance(Components.interfaces.nsITrackMeNot);
          return service;
        },
        
        showOptionsDialog : function(){
          this.getHiddenWindow().open("chrome://trackmenot/content/options.xul",
             "trackmenotOptions", "chrome,dialog,centerscreen,alwaysRaised");
        },
        
        showEditorWindow : function(){
          this.getHiddenWindow().open("chrome://trackmenot/content/editor.xul",
             "trackmenotEditor", "chrome,dialog,centerscreen,alwaysRaised");
        },
            
        showAboutDialog : function(){
          this.getHiddenWindow().open("chrome://trackmenot/content/about.xul",
            "trackmenotAbout", "chrome,dialog,centerscreen");
        },
        
        showSpamDialog : function(){
          this.getHiddenWindow().open("chrome://trackmenot/content/spam.xul",
            "trackmenotSpam", "chrome,dialog,centerscreen,alwaysRaised");
        },
            
        toggleEnabled : function (){ return this.getTrackMeNot()._toggleOnOff(); },
        
        getTrackMeNot : function()
        {
          //if (PROFILEMENOT.gTrackMeNot) return PROFILEMENOT.gTrackMeNot;
          var win = this._getRunningWindow();
          if (win && win.PROFILEMENOT.gTrackMeNot)
            return win.PROFILEMENOT.gTrackMeNot;
		  else	
		  	return null;
        },
        
        cout : function (msg){
          if (!msg || msg.length<1) return;
          var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
            .getService(Components.interfaces.nsIConsoleService);
          consoleService.logStringMessage(msg);
        },
        
        /*function cerr(msg, e){
          var txt = "[ERROR] "+msg;
          if (e){
            txt += "\n" + e;
            if (e.message)txt+=e.message;
          }
          else txt += " / No Exception";
          cout(txt);
        }*/
        
        nodeListToArray : function ( nodelist) {
            var result = [];
            for (var i=0; i<nodelist.length; i++ ) 
              result.push(nodelist[i]);
            return result;
        },
        
        _getRunningWindow: function() {
        		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
        							getService(Components.interfaces.nsIWindowMediator);
        		var en = wm.getEnumerator("navigator:browser");
        		 while (en.hasMoreElements()) { 
        	      var win = en.getNext(); 
        	      if (win.PROFILEMENOT && win.PROFILEMENOT.gTrackMeNot._isRunning() ) 
        	      	return win;
        	    }
    	    return null		
        },
          
          
      
        getWindows: function (){
          try {
            var windows =  new Array(); 
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	           .getService(Components.interfaces.nsIWindowMediator)
            var en = wm.getEnumerator('navigator:browser'); 
            while (en.hasMoreElements()){ 
              var win = en.getNext(); 
              if (win)windows.push(win);
            }
            return windows;
          } 
          catch(e){ cerr("getWindows(): ",e); }
        },
		
		hasInstance :function () {
			var win = PROFILEMENOT.utils._getRunningWindow();
			if (win != null ) return true;
			else return false; 			
		},
        
        getProfileDir: function() {
          		return Components.classes["@mozilla.org/file/directory_service;1"]
          	                    .getService(Components.interfaces.nsIProperties)
          	                    .get("ProfD",Components.interfaces.nsIFile);
	      },
	      
	      getFoStream:  function () {
      		return   Components.classes["@mozilla.org/network/file-output-stream;1"].
      				createInstance(Components.interfaces.nsIFileOutputStream);
      	},
        
        getHiddenWindow : function (win){
          var assServ, assWin = null; 
          var comp = window.Components
          if (win) comp = win.Components;
         // else comp = window.Components;
          var assClass = comp.classes["@mozilla.org/appshell/appShellService;1"];
          if (assClass)assServ = assClass.getService
            (comp.interfaces.nsIAppShellService);
          if (!assServ)cerr("Unable to get @mozilla.org/appshell/appShellService;1");
          if (assServ)assWin = assServ.hiddenDOMWindow;
          return assWin;
        },
        
        addToListener : function (obj)    {
          var observerService = Components.classes["@mozilla.org/observer-service;1"].
            getService(Components.interfaces.nsIObserverService);
          observerService.addObserver(obj, "http-on-modify-request", false);
          observerService.addObserver(obj, "http-on-examine-response", false);
        },
        
        removeFromListener : function(obj)    {
          var observerService = Components.classes["@mozilla.org/observer-service;1"].
            getService(Components.interfaces.nsIObserverService);
          observerService.removeObserver(obj, "http-on-modify-request");
          observerService.removeObserver(obj, "http-on-examine-response");
        },
        
        getYahooId: function() {
          var id = "A0geu";
          while (id.length < 24) {
            var lower = Math.random()< .5;
            var num = parseInt(Math.random()* 38);
            if (num == 37){ id += '_'; continue; }
            if (num == 36){ id += '.'; continue; }
            if (num < 10){
              id += String.fromCharCode(num + 48);
              continue;
            }
            num += lower ?  87 : 55;
            id += String.fromCharCode(num);
          }
          //cout("GENERATED ID="+id);
          return id;
        }

    }
}();