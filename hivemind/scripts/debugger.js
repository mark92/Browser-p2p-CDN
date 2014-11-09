$(".debug-window").draggable({ containment: "parent" });
document.querySelector(".debug-window .log").addEventListener("mousedown", function(e){e.stopPropagation();});
document.querySelector(".debug-window .log").style["width"] = 2*document.querySelector(".debug-window .log").getBoundingClientRect().width - document.querySelector(".debug-window .log").scrollWidth;

$(".peer-window").draggable({ containment: "parent" });
document.querySelector(".peer-window .list").addEventListener("mousedown", function(e){e.stopPropagation();});
document.querySelector(".peer-window .list").style["width"] = 2*document.querySelector(".peer-window .list").getBoundingClientRect().width - document.querySelector(".peer-window .list").scrollWidth;

document.querySelector(".msgBox").addEventListener("keyup", function(e){
	if(e.keyCode==13){
		e.preventDefault();
		if( this.value != "" ){
			receptionist.johny.emmitMessage(this.value);
			this.value = "";
		}
	}
});

function activateInput(){
	document.querySelector(".msgBox").classList.add("active");
}

function refreshPeerList(peers, p2pManager){
	document.querySelector(".peer-window .list").innerHTML = "";
	for( var i = 0; i < peers.length; i++ ){
		document.querySelector(".peer-window .list").innerHTML += ("<span class='peerItem"+(receptionist.me.uid==peers[i]?" peerMe":"")+"'>"+peers[i]+"</span><br>");
	}
	var peers = document.querySelectorAll(".peer-window .list span");
	for( var i = 0; i < peers.length; i++ ){
		peers[i].addEventListener("click", function(){
			p2pManager.pleaseInitConnection(this.textContent);
		});
	}
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

	msg = "<span class='debug-window-time'>"+time+"</span>"+msg;
	document.querySelector(".debug-window .log").innerHTML += msg + "<br>";
	document.querySelector(".debug-window .log").scrollTop = document.querySelector(".debug-window .log").scrollHeight;
}