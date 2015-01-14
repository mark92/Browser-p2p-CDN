var debugWindow, logList, closeButton;
initDebugUI();
setSecretConsoleListener();

function initDebugUI(){
	debugWindow = document.createElement("div");
	logList = document.createElement("div");
	closeButton = document.createElement("div");

	closeButton.style['width'] = '3vh';
	closeButton.style['height'] = '3vh';
	closeButton.style['background'] = '#aa3333';
	closeButton.style['position'] = 'absolute';
	closeButton.style['top'] = '0.5vh';
	closeButton.style['right'] = '0.5vh';
	closeButton.style['cursor'] = 'pointer';

	debugWindow.style['width'] = '65vw';
	debugWindow.style['height'] = '50vh';
	debugWindow.style['background'] = '#332a28';
	debugWindow.style['position'] = 'fixed';
	debugWindow.style['right'] = '19vw';
	debugWindow.style['top'] = '20vh';
	debugWindow.style['overflow'] = 'hidden';
	debugWindow.style['-webkit-box-shadow'] = '0px 2px 15px 0px rgba(0, 0, 0, 0.81)';
	debugWindow.style['-moz-box-shadow'] = '0px 2px 15px 0px rgba(0, 0, 0, 0.81)';
	debugWindow.style['box-shadow'] = '0px 2px 15px 0px rgba(0, 0, 0, 0.81)';

	debugWindow.style['display'] = window.demoMode?'block':'none';

	logList.style['width'] = '98%';
	logList.style['height'] = '46vh';
	logList.style['position'] = 'absolute';
	logList.style['bottom'] = '0';
	logList.style['background'] = '#28211f';
	logList.style['color'] = '#CCFFD7';
	logList.style['font-family'] = 'monospace';
	logList.style['overflow-y'] = 'scroll';
	logList.style['overflow-x'] = 'hidden';
	logList.style['padding-left'] = '1%';
	logList.style['padding-right'] = '1%';
	logList.style['font-size'] = '1em';

	debugWindow.appendChild(closeButton);
	debugWindow.appendChild(logList);
	document.body.appendChild(debugWindow);
}

function setSecretConsoleListener(){
	var keysPressed = [];
	window.addEventListener("keydown", function(e){
		keysPressed.push(e.keyCode);
		if( keysPressed.slice(-12).join('') == "495051527273866977737868" ){
			debugWindow.style["display"] = "block";
		};
	});
	logList.addEventListener("mousedown", function(e){e.stopPropagation();});
	closeButton.addEventListener("mousedown", function(e){ 
		debugWindow.style["display"] = "none";
	});
}

function debug(msg){
	if(msg.indexOf("recv") != -1 ){
		return;
	}

	var d = new Date();
	var h = ("0"+d.getHours()).slice(-2);
	var m = ("0"+d.getMinutes()).slice(-2);
	var s = ("0"+d.getSeconds()).slice(-2);
	var ms = ("000"+d.getMilliseconds()).slice(-3);
	time = h+":"+m+":"+s+"."+ms+"> ";
	console.log(time+msg);

	if( msg.match("http") ){
		msg = msg.split("http")[0] + "http" + (msg.split("http")[1].length > 50? msg.split("http")[1].slice(0, 20) + "..." + msg.split("http")[1].slice(-30):msg.split("http")[1]);
	}

	msg = "<div style='width: 100%;word-wrap: break-word;'><span style='color: #BFADA9;'>"+time+"</span><span>"+msg+"</span></div>";
	logList.innerHTML += msg;
	logList.scrollTop = logList.scrollHeight;
}