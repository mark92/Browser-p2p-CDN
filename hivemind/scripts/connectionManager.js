var ConnectionManager = function(){
	var self = this;

	this.init = function(){
		socket.on("connect", function(){
			socket.on("youridis", function(msg){
				self.me = {
					uid: msg,
					registered: false
				};
				self.pigeon = new Signaler(self.me);
				self.johny = new P2PManager(self.pigeon, self.me);
				self.pigeon.updatePeerlist(analyzePeers);
				self.storageGuy = new ResourceManager();
				self.storageGuy.scan();
			});
		});
	}
	
	function analyzePeers(peers){
		delete peers[self.uid];
		self.peers = peers;
		var x = [];
		for(var peer in peers){
			x.push(peer);
		}
		refreshPeerList(x, self.johny);
	}

	this.getResource = function(name){
		if(Object.keys(peers).length != 0){
			this.johny.pleaseInitConnection(Object.keys(peers)[0]);
			document.addEventListener(Object.keys(peers)[0], function(){
				receptionist.johny.emmitMessage("ask:"+name);
			});
			return "okay";
		} else {
			return "no peers";
		}
	}

}