var SessionManager = function(){
	var self = this;

	this.id = Date.now().toString() + (Math.random()*100000).toString().split('.')[0];
	this.session = {
		timestamp: Date.now(),
		checkin: Date.now()
	}

	this.registerSelf = function(){
		requestPermission(function(){
			var sessions = JSON.parse(localStorage.sessions || '{}');
			sessions[self.id] = true;
			if(Object.keys(sessions).length == 1) beLeader();
			localStorage.sessions = JSON.stringify(sessions);
			localStorage["session_"+self.id] = JSON.stringify(self.session);
			self.heartbeat();
		});
	}

	this.heartbeat = function(){
		requestPermission(function(){
			var sessions = JSON.parse(localStorage.sessions);
			var time = Date.now();
			self.session.checkin = time;
			localStorage[ "session_"+self.id ] = JSON.stringify( self.session );

			var theWinnerIsYou = false;
			for( var session in sessions ){
				if( time - JSON.parse(localStorage[ "session_"+session ]).checkin > 5000 ){
					console.log(session);
					delete sessions[session];
					theWinnerIsYou = true;					
				}
			}

			localStorage.sessions = JSON.stringify(sessions);

			if( theWinnerIsYou ){
				beLeader();
			}
			
			setTimeout(self.heartbeat, 0);
		});
	}

	this.listenForSessionEvent = function(eventName, callback, terminate){
		setInterval(function(){
			if( localStorage["events_"+eventName] ){
				if(terminate) delete localStorage["events_"+eventName];
				callback(localStorage["events_"+eventName]);
			}
		},10);
	}

	this.fireSessionEvent = function(eventName, info){
		localStorage["events_"+eventName] = JSON.stringify(info) || true;
	}

	function requestPermission(callback){
		var x = setInterval(function(){
			if( !localStorage.occupied ){
				clearInterval(x);
				localStorage.occupied = true;

				callback();

				delete localStorage.occupied;
			}
		},2);
	}

	function beLeader(){
		self.leader = true;
		receptionist.master();
		debug("I AM THE LAW!");
	}

	this.registerSelf();
}