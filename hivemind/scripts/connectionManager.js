var ConnectionManager = function(){
	var self = this;

	this.init = function(){
		socket.on("youridis", function(msg){
			debug("Received ID - "+msg);
			localStorage['peer_'+msg] = true;
			self.me = {
				uid: msg,
				registered: false
			};
			self.pigeon = new Signaler(self.me);
			self.johny = new P2PManager(self.pigeon, self.me);
			self.storageGuy = new ResourceManager();
			var x = new Event("ConnectionManager_ready");
			document.dispatchEvent(x);
		});

		socket.on("connect", function(){
			debug("Connected to peer server");
		});
	}
	
	function analyzePeers(peers, pageName){
		delete peers[self.me.uid];
		self.peers = peers;
		var x = [];
		for(var peer in peers){
			x.push(peer);
		}
		var y = new Event("peerlist_"+pageName+"_ready");
		document.dispatchEvent(y);
	}

	this.loadPage = function(pageName, resources){
		self.pigeon.updatePeerlist(analyzePeers, pageName);
		document.addEventListener("peerlist_"+pageName+"_ready", function(){
			if(Object.keys(self.peers).length != 0){
				for( var resource in resources ){
					self.getResource(resource);
				}
				var x = new Event("peersFound");
				document.dispatchEvent(x);
			} else {
				var x = new Event("peersNotFound");
				document.dispatchEvent(x);
			}
		});
	}
	
	this.getResource = function(name){
		for( var peer in self.peers ){
			if( localStorage['peer_'+peer] ){
				break;
			}
			peer == null;
		}
		this.johny.pleaseInitConnection(peer||Object.keys(self.peers)[0]);
		document.addEventListener(peer||Object.keys(self.peers)[0], function(){
			receptionist.johny.emmitMessage("ask:"+name);
		});
	}

}