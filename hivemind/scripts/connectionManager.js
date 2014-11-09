var ConnectionManager = function(){
	var connectionManager = this;

	this.init = function(){
		localStorage.uid = document.cookie.split("uid=")[1].split(";")[0];
		socket.on("connect", function(){
			socket.emit("myidis", document.cookie.split("uid=")[1].split(";")[0]);
		});
		this.me = {
			uid: localStorage.uid,
			registered: false
		};

		this.pigeon = new Signaler(this.me);
		this.johny = new P2PManager(this.pigeon, this.me);
		this.pigeon.updatePeerlist(analyzePeers);
		this.storageGuy = new ResourceManager();
		this.storageGuy.scan();
	}
	
	function analyzePeers(peers){
		delete peers[document.cookie.split("uid=")[1].split(";")[0]];
		connectionManager.peers = peers;
		var x = [];
		for(var peer in peers){
			x.push(peer);
		}
		refreshPeerList(x, connectionManager.johny);
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