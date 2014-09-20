CHS.Video = {
    ytid:null,
    DEFAULT_WIDTH:750,
    DEFAULT_HEIGHT:562,

    PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3
    },

    loadSWF: function(url, targetID, width, height) {
        var isFound = false;
        var el = document.getElementById(targetID);
        if(el && (el.nodeName === "OBJECT" || el.nodeName === "EMBED")){
            isFound = true;
        }
        if (isFound) {
            var el = document.getElementById(targetID);
            if(el){
                var div = document.createElement("div");
                el.parentNode.insertBefore(div, el);

                //Remove the SWF
                swfobject.removeSWF(targetID);

                //Give the new DIV the old element's ID
                div.setAttribute("id", targetID);
            }
        }
        
        var params = { allowScriptAccess: "always", allowFullScreen: "true" };
        var atts = { id: "myytplayer" };
        
        if (swfobject.hasFlashPlayerVersion("7")) {
            var attributes = { data: url, width:width, height:height };
            //var obj = swfobject.createSWF(attributes, params, targetID);
            var obj = swfobject.embedSWF(url, targetID, width, height, "8", null, null, params, atts);
            
        }
    },
    play: function(options) {
        var url = "http://www.youtube.com/v/" + CHS.Video.ytid + "?enablejsapi=1&playerapiid=ytplayer&version=3&rel=0";
        
        //var width =  (options && options.width != undefined) ? options.width : CHS.Video.DEFAULT_WIDTH;
        var width = "100%";
        var height = (options && options.height != undefined) ? options.height : CHS.Video.DEFAULT_HEIGHT;
        
        CHS.Video.loadSWF(url, "ytapiplayer", width, height);
    },

    onytplayerStateChange: function(newState) {
        switch(newState) {
            case CHS.Video.PlayerState.ENDED:
                CHS.ConceptMap.complete({
                    type: "2",
                    id: $("#vid").val()
                });
                break;
            case CHS.Video.PlayerState.PLAYING:
                CHS.Video.fullscreen();
                break;
        }
    },

    fullscreen: function(){
        console.log('cliekd');
        var vid = $('#myytplayer')[0];
        vid.requestFullScreen();
    },

    // Setup for the Video Page
    setup: function() {
        $('#done_button').click(function(){

            function redirect(s){
                window.location.href = $('#done_button').attr("data-next"); 
            }

            CHS.ConceptMap.complete({
                type: "2",
                id: $("#vid").val()
            }, redirect);
        });
    }
};

function onYouTubePlayerReady(playerId) {
    ytplayer = document.getElementById("myytplayer");
    ytplayer.addEventListener("onStateChange", "CHS.Video.onytplayerStateChange");
    //ytplayer.playVideo(); // don't play on page load by default
}

