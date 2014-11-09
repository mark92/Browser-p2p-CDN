var SessionManager = function(){
	var sessionManager = this;

	this.id = Date.now().toString() + (Math.random()*100000).toString().split('.')[0],
	this.session = {
		timestamp: Date.now(),
		checkin: 0
	}

	this.registerSelf = function(){
		var sessions = JSON.parse(sessionStorage.sessions || '{}');
		sessions[this.id] = true;
		sessionStorage.sessions = JSON.stringify(sessions);

		sessionStorage["session_"+this.id] = JSON.stringify(this.session);

		checkForRace();
	}

	function checkForRace(){
		var triesLeft = 10;

		var interval = setInterval(function(){
			triesLeft--;
			var sessions = JSON.parse(sessionStorage.sessions);

			if( triesLeft == 0 ){
				clearInterval(interval);
				sessionManager.sessions = sessions;
				heartbeat();
			}

			if( !sessions[sessionManager.id] ){
				clearInterval(interval);
				sessionManager.registerSelf();
			}
		},2);
	}

	function heartbeat(){
		var sessions = JSON.parse(sessionStorage.sessions);
		delete sessions["session_"+this.id];

		var time = Date.now();

		var seismic = false;
		for( var session in sessions ){
			if( time - JSON.parse(sessionStorage[ "session_"+session ]).checkin > 2000 ){
				var buff = JSON.parse(sessionStorage[ "session_"+session ]);
				buff.dead = true;
				sessionStorage[ "session_"+session ] = JSON.stringify(buff);
				seismic = true;
			}
		}
	}

	function setLeader(leader){

	}
}