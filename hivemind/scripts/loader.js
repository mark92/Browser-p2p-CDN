function loadScripts(sources){
    var total = sources.length;
    var cur = 0;

    loadScript();

    function loadScript(){
        var scr = document.createElement("script");
        scr.onload = function(){
            cur++;
            if( cur < total ) loadScript();
        }
        scr.src = sources[cur];
        document.head.appendChild(scr);
    }
}

var baseUrl = "https://auditorium-js.herokuapp.com/";
var sources = [
    baseUrl+"scripts/webRTCnormalize.js",
    baseUrl+"scripts/debugger.js",
    baseUrl+"scripts/signaler.js",
    baseUrl+"scripts/fileManager.js",
    baseUrl+"scripts/p2pManager.js",
    baseUrl+"scripts/resourceManager.js",
    baseUrl+"scripts/connectionManager.js",
    baseUrl+"scripts/globalCache.js",
    baseUrl+"scripts/main.js",
    "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js",
    "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js",
    "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/core-min.js",
    "https://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-utf16-min.js",
    "https://crypto-js.googlecode.com/svn/tags/3.1/build/components/lib-typedarrays.js"
];

loadScripts(sources);