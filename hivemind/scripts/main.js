var socket = io("http://127.0.0.1:3000");
socket.emit("pagename", "home");
var receptionist = new ConnectionManager();
receptionist.init();