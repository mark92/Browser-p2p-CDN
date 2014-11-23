var Signaler = function(me){
	this.updatePeerlist = function(analyzer, pagename){
		debug("updating peer list");
		debug("Sending page name to server");
		socket.emit("pagename", pagename);
		socket.on("peerList_"+pagename, function(msg){
			debug("Received peerlist");
			var peers = JSON.parse(msg);
			analyzer(peers, pagename);
		});
	}

	this.checkInbox = function(offerAnalyzer, answerAnalyzer){
		socket.on("offer", function(msg){
			offerAnalyzer(JSON.parse(msg));
		});
		socket.on("answer", function(msg){
			answerAnalyzer(JSON.parse(msg));
		});
	}

	this.sendAnswer = function(from, to, answer, ice){
		socket.emit("answer", JSON.stringify({to: to, id: from, answer: JSON.stringify(answer), ice: JSON.stringify(ice)}) );
	}

	this.sendOffer = function(from, to, offer, ice){
		socket.emit("offer", JSON.stringify({to: to, id: from, offer: JSON.stringify(offer), ice: JSON.stringify(ice)}) );
	}

	this.ready = function(ready){
		me.ready = ready;
	}

	this.ready(false);
}