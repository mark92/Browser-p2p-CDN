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
			if( Object.keys(sessions).length == 1 ) beLeader();
			localStorage.sessions = JSON.stringify(sessions);
			localStorage["session_"+self.id] = JSON.stringify(this.session);
			heartbeat();
		});
	}

	function heartbeat(){
		requestPermission(function(){
			var sessions = JSON.parse(localStorage.sessions);
			var time = Date.now();
			self.session.checkin = time;
			localStorage[ "session_"+self.id ] = JSON.stringify( self.session );

			var theWinnerIsYou = false;
			for( var session in sessions ){
				if( time - JSON.parse(localStorage[ "session_"+session ]).checkin > 2000 ){
					delete sessions[session];
					theWinnerIsYou = true;					
				}
			}

			localStorage.sessions = JSON.stringify(sessions);

			if( theWinnerIsYou ){
				beLeader();
			}
			
			setTimeout(heartbeat, 0);
		});
	}

	function listenForSessionEvent(eventName, callback, terminate){
		setInterval(function(){
			if( localStorage["events_"+eventName] ){
				if(terminate) delete localStorage["events_"+eventName];
				callback(localStorage["events_"+eventName]);
			}
		},10);
	}

	function fireSessionEvent(eventName, info){
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
		console.log("yay");
	}

	this.registerSelf();
}