var GlobalCacheManager = function(){
	var self = this;
	this.cachedPages = {};

	this.observe = function(){
		window.addEventListener('storage', function(e){
			if( e.key.indexOf("download_pagename_") != -1 ){
				var pageName = e.key.split("download_pagename_")[1];
				var resources = JSON.parse(e.newValue);

				if( !self.cachedPages[pageName] ){
					self.addToCache(pageName);
					receptionist.storageGuy.scan(pageName, resources, true);
				}
			}
		});
	}

	this.announce = function(pageName, resources){
		localStorage["download_pagename_"+pageName] = JSON.stringify(resources);
		self.addToCache(pageName);
	}

	this.addToCache = function(pageName){
		self.cachedPages[pageName] = true;
	}
}