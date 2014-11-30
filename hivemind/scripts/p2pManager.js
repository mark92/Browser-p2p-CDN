var P2PManager = function(signaler, me){
	var self = this;
	var handy = new FileManager();

	this.iceBucket = {
		servers: {},
		options: {
			optional: [
				{DtlsSrtpKeyAgreement: true},
				{DataChannels: true}
			]
		}
	}

	this.connections = {
		host:{},
		peer:{}
	};

	this.iShouldInitializeTheIceServers = function(){
		var http = new XMLHttpRequest();
		var url = "https://api.xirsys.com/getIceServers";
		var params = "ident=gzepelin&secret=9748538b-d16c-4966-9a5f-efb57a35c418&domain=googledrive.com&application=default&room=default&secure=0";
		http.open("POST", url, false);

		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
		    if(http.readyState == 4 && http.status == 200) {
		        self.iceBucket.servers = JSON.parse(http.responseText).d;
		    	signaler.ready(true);
		    }
		}
		http.send(params);
	}

	this.pleaseInitConnection = function(to){
		if( this.connections.host[to] ) return;
		var pc = new PeerConnection(this.iceBucket.servers, this.iceBucket.options);
		var channel = pc.createDataChannel("channel", {});
		receiveMessages(channel, to);

		debug("initializing connection to remote peer");
		pc.createOffer(function(offer){
			offer.sdp = offer.sdp.replace(/b\=AS:[0-9]*/g, "b=AS:5000");
			pc.setLocalDescription(offer);

			var candidates = [];
			pc.onicecandidate = function (e) {
				if( e.candidate ){
					candidates.push(e.candidate);
				}

				if( pc.iceGatheringState == "complete" ){
					debug("ended collecting ice");
					pc.onicecandidate = null;
					signaler.sendOffer(me.uid, to, offer, candidates);
				}
			};
		}, function(){});

		this.connections.host[to] = {p2p: pc, cnl: channel};
	}

	this.iShouldResumeConnecting = function(to){
		var pc = this.connections["host"][to.id].p2p;
		pc.setRemoteDescription(
			new SessionDescription(JSON.parse(to.answer))
		);
		var candidates = JSON.parse(to.ice);
		for( var i = 0; i < candidates.length; i++ ){
			pc.addIceCandidate(new IceCandidate(candidates[i]));
		}
	}

	this.iShouldAcceptConnection = function(from){
		var pc = new PeerConnection(this.iceBucket.servers, this.iceBucket.options);
		pc.ondatachannel = function(e){
			var channel = e.channel;
			self.connections.peer[from.id].cnl = channel;
			receiveMessages(channel);
		}

		debug("receiving a connection from a remote peer");
		pc.setRemoteDescription(
			new SessionDescription(JSON.parse(from.offer))
		);
		pc.createAnswer(function (answer) {
			pc.setLocalDescription(answer);

			var candidates = [];
			pc.onicecandidate = function (e) {
				if( e.candidate ){
					candidates.push(e.candidate);
				}
				if( pc.iceGatheringState == "complete" ){
					debug("ended collecting ice");
					pc.onicecandidate = null;
					debug("sending answer");
					signaler.sendAnswer(me.uid, from.id, answer, candidates);
				
					candidates = JSON.parse(from.ice);
					for( var i = 0; i < candidates.length; i++ ){
						pc.addIceCandidate(new IceCandidate(candidates[i]));
					}
				}
			};
		}, function(){});

		this.connections.peer[from.id] =  {p2p: pc, cnl: ''};
	}

	function receiveMessages (channel, to) {
		channel.onopen = function () { 
			debug("Channel Open");
			if(!to) return;
			var x = new Event(to);
			document.dispatchEvent(x);
		}
		channel.onmessage = function (e) {
			var msg = decodeURIComponent(e.data);
			debug("receiving message "+ msg);

			if( msg.match(/ask:/g) ){
				var resource = "resource_" + msg.split("ask:")[1];
				if( webRTCresources[resource] ){
					self.sendResource(this, webRTCresources[resource], msg.split("ask:")[1]);
				}
			}			
			if( msg.match(/recv:/g) ){
				var part = JSON.parse(msg.split("recv:")[1]);
				handy.rebuild(part);
			}
		};
		channel.onclose = function(e){
			delete self.connections.host[to];
			delete self.connections.peer[to];
		}
	}

	this.sendResource = function(channel, rsc, rscName){
		var messages = handy.split(rsc, rscName);
		for( var i = 0; i < messages.length; i++ ){
			channel.send("recv:" + JSON.stringify(messages[i]));
		}
	}

	this.sendMessage = function (to, msg) {
		debug("sending: "+msg);
		if( this.connections.host[to] ){
			this.connections.host[to].cnl.send(encodeURIComponent(msg));
		} else {
			this.connections.peer[to].cnl.send(encodeURIComponent(msg));
		}
	}

	this.emmitMessage = function (msg){
		debug("emmiting: "+msg);
		for( var to in this.connections.host ){
			this.connections.host[to].cnl.send(encodeURIComponent(msg));
		}
		for( var to in this.connections.peer ){
			this.connections.peer[to].cnl.send(encodeURIComponent(msg));
		}
	}

	function analyzeOffer(offer) {
		if(!me.ready)return;
		debug("offer received");

		debug("start connecting to peer: "+offer.id);
		self.iShouldAcceptConnection(offer);
		return;
	}

	function analyzeAnswer(answer){
		if(!me.ready)return;
		debug("answer received");

		debug("continue connecting to peer: "+answer.id);
		self.iShouldResumeConnecting(answer);
		return;
	}

	signaler.checkInbox(analyzeOffer, analyzeAnswer);
	this.iShouldInitializeTheIceServers();
}