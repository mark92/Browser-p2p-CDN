var ResourceManager = function(){
	var self = this;

	window.webRTCresources = {};

	String.prototype.hashCode = function() {
		var hash = 0, i, chr, len;
		if (this.length == 0) return hash;
		for (i = 0, len = this.length; i < len; i++) {
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

	this.scan = function(pagename, images){
		var images = images || document.querySelectorAll("img");
		var resources = {};
		for( var i = 0; i < images.length; i++){
			resources[images[i].getAttribute("data-resource")] = true;
		}
		var resource;

		var retrieveList = [];
		for( var i in resources ){
			resource = webRTCresources["resource_"+i];
			if( resource ){
				this.receiveResource(i);
			} else {
				document.addEventListener("resource_"+i, this.receiveResource);
				retrieveList.push(i);
			}
		}
		receptionist.loadPage(pagename, retrieveList);
		document.addEventListener("peersNotFound", function(){
			self.downloadFromOrigin(retrieveList);
		});
	}

	this.receiveResource = function(e){
		//for passing event names and the resource names
		debug(e.type? "Resource retreived from peer - "+e.type: "Resource retreived from cache");
		var resource = e.type.substring(9) || e;
		var images = document.querySelectorAll("img[data-resource = '"+resource+"']");
		for( var i = 0; i < images.length; i++ ){
			images[i].src = webRTCresources["resource_"+resource];
		}
	}

	this.downloadFromOrigin = function(rscs){
		for( var j = 0; j < rscs.length; j++ ){
			var rsc = rscs[j];
			debug("No peers, downloading from origin - "+rsc);
			
			var images = document.querySelectorAll("img[data-resource='"+rsc+"']");

			(function(img, rsc){
				img.addEventListener("load", function(){
					webRTCresources["resource_"+rsc] = self.toBase64(img);
				});
			})(images[0], rsc);

			for( var i = 0; i < images.length; i++){
				images[i].crossOrigin = '';
				images[i].src = rsc;
			}
		}
	}

	this.toBase64 = function(image){
		var cnv = document.createElement("canvas");
		cnv.width = image.width;
		cnv.height = image.height;
		var ctx = cnv.getContext('2d');
		ctx.drawImage(image,0,0);

		return cnv.toDataURL();
	}
}