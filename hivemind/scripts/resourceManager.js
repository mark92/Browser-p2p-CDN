var ResourceManager = function(){
	var self = this;

	window.webRTCresources = {};

	this.scan = function(pagename, images, caching){
		if( caching ){
			var resources = images;
		} else {
			var images = images || document.querySelectorAll("img");
			var resources = {};
			for( var i = 0; i < images.length; i++){
				resources[images[i].getAttribute("data-resource")] = true;
			}
		}

		var resource;
		var receivedResources = 0;

		for( var i in resources ){
			resource = webRTCresources["resource_"+i];
			if( resource ){
				this.receiveResource(i);
			} else {
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
			self.downloadFromOrigin(resources);
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
		for( var rsc in rscs ){
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