if( PeerConnection ){
	var socket = io("https://auditorium-js.herokuapp.com");
	var receptionist = new ConnectionManager();
	var memmory = new GlobalCacheManager();
	memmory.observe();
	document.addEventListener("ConnectionManager_ready", function(){ receptionist.storageGuy.scan(location.href.split("://")[1]); });
	receptionist.init();
} else {
	var storageGuy = new ResourceManager();
	storageGuy.scan('', null, false, true);
}