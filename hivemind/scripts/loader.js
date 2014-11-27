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

var baseUrl = "http://127.0.0.1:3000/";
var sources = [
    baseUrl+"scripts/webRTCnormalize.js",
    baseUrl+"scripts/debugger.js",
    baseUrl+"scripts/signaler.js",
    baseUrl+"scripts/fileManager.js",
    baseUrl+"scripts/p2pManager.js",
    baseUrl+"scripts/resourceManager.js",
    baseUrl+"scripts/connectionManager.js",
    baseUrl+"scripts/globalCache.js",
    "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256.js",
    "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js",
    "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/core-min.js",
    "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-utf16-min.js",
    "http://crypto-js.googlecode.com/svn/tags/3.1/build/components/lib-typedarrays.js",
    baseUrl+"scripts/main.js"
];

loadScripts(sources);