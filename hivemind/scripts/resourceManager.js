var ResourceManager = function(){
	var self = this;

	window.webRTCresources = {};

	this.scan = function(pagename, images, caching, noWebRTC){
		if( caching ){
			var resources = images;
		} else {
			var images = images || document.querySelectorAll("img");
			var resources = {};
			for( var i = 0; i < images.length; i++){
				resources[images[i].getAttribute("data-resource")] = true;
			}
		}

		if( noWebRTC ){
			self.downloadFromOrigin(resources);
			return;
		}

		var resource;
		var receivedResources = 0;
		var timeouts = {};

		for( var i in resources ){
			resource = webRTCresources["resource_"+i];
			if( resource ){
				this.receiveResource(i);
			} else {
				timeouts["resource_"+i] = (function(x){
					return setTimeout( function(){
						var rscs = {};
						rscs[x] = true;
						self.downloadFromOrigin(rscs);
					}, 8000);
				})(i);
				document.addEventListener("resource_"+i, function(e){
					clearTimeout( timeouts[e.type.substring(9) || e] );
				});
				document.addEventListener("resource_"+i, this.receiveResource);
				document.addEventListener("resource_"+i, function(){
					receivedResources++;
					if( receivedResources == Object.keys(resources).length ){
						memmory.announce(pagename, resources);
					}
				});
			}
		}
		

		receptionist.loadPage(pagename, resources);
		document.addEventListener("peersNotFound", function(){
			for( var timeout in timeouts ){

			}
			self.downloadFromOrigin(resources);
		});
	}

	this.receiveResource = function(e){
		//for passing event names and the resource names
		debug(e.type? "Resource retrieved from peer - "+e.type: "Resource retrieved from cache");
		var resource = e.type? e.type.substring(9) : e;
		var images = document.querySelectorAll("img[data-resource = '"+resource+"']");
		//check for cache
		if(!images) return;

		if( checkHash(webRTCresources["resource_"+resource], images[0].getAttribute("data-resource-hash")) ){
			for( var i = 0; i < images.length; i++ ){
				images[i].src = 'data:image/png;base64,'+ webRTCresources["resource_"+resource];
			}
		} else {
			debug("Bad resource, abort P2P");
			delete webRTCresources["resource_"+resource];
			var resources = {};
			resources[resource] = true;
			self.downloadFromOrigin(resources);
		}

	}

	this.downloadFromOrigin = function(rscs){
		for( var rsc in rscs ){
			if( webRTCresources["resource_"+rsc] ) return;
			debug("No peers, downloading from origin - "+rsc);

			(function(rsc){
				var images = document.querySelectorAll("img[data-resource='"+rsc+"']");

				var req = new XMLHttpRequest();
				req.open("GET", rsc, true);
				req.responseType = "arraybuffer";

				req.onload = function (e) {
				  arrayBuffer = req.response;
				  if (arrayBuffer) {
				    byteArray = new Uint8Array(arrayBuffer);
					webRTCresources["resource_"+rsc] = base64EncArr(byteArray);
					for( var i = 0; i < images.length; i++){
						images[i].src = 'data:image/png;base64,'+webRTCresources["resource_"+rsc];
					}
				  }
				};

				req.send(null);

			})(rsc);			
		}
	}

	function uint6ToB64 (nUint6) {
	  return nUint6 < 26 ?
	      nUint6 + 65
	    : nUint6 < 52 ?
	      nUint6 + 71
	    : nUint6 < 62 ?
	      nUint6 - 4
	    : nUint6 === 62 ?
	      43
	    : nUint6 === 63 ?
	      47
	    :
	      65;
	}

	function base64EncArr (aBytes) {
	  var nMod3 = 2, sB64Enc = "";
	  for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
	    nMod3 = nIdx % 3;
	    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
	    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
	    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
	      sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
	      nUint24 = 0;
	    }
	  }
	  return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
	}

	function b64ToUint6 (nChr) {

	  return nChr > 64 && nChr < 91 ?
	      nChr - 65
	    : nChr > 96 && nChr < 123 ?
	      nChr - 71
	    : nChr > 47 && nChr < 58 ?
	      nChr + 4
	    : nChr === 43 ?
	      62
	    : nChr === 47 ?
	      63
	    :
	      0;

	}

	function base64DecToArr (sBase64, nBlocksSize) {

	  var
	    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
	    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

	  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
	    nMod4 = nInIdx & 3;
	    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
	    if (nMod4 === 3 || nInLen - nInIdx === 1) {
	      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
	        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
	      }
	      nUint24 = 0;

	    }
	  }

	  return taBytes;
	}


	function checkHash(data, hash){
		var data = base64DecToArr(data).buffer;
		var hash = hash || '';
		var data = CryptoJS.lib.WordArray.create(data);
		var dataHash = CryptoJS.SHA256(data);
		return dataHash.toString(CryptoJS.enc.Base64) == hash;
	}
}