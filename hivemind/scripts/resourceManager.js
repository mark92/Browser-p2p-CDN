var ResourceManager = function(){

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

	this.scan = function(){
		var images = document.querySelectorAll("img");
		var resource;

		for( var i = 0; i < images.length; i++ ){
			resource = localStorage["resource_"+images[i].getAttribute("data-resource")];
			if( resource ){
				images[i].src = resource;
			} else {
				document.addEventListener(images[i].getAttribute("data-resource"), this.receiveResource);
				var well = receptionist.getResource(images[i].getAttribute("data-resource"));
				
				if( well != "okay" ){
					(function(img){
						$.get( img.getAttribute("data-resource"), function(msg){
							localStorage["resource_" + img.getAttribute("data-resource")] = msg;
							img.src = msg;
						});
					})(images[i]);
				} 
			}
		}
	}

	this.receiveResource = function(e){
		var resource = e.type;
		var images = document.querySelectorAll("img[data-resource = '"+resource+"']");
		for( var i = 0; i < images.length; i++ ){
			images[i].src = localStorage["resource_"+resource];
		}
	}
}