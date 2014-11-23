var socket = io("http://127.0.0.1:3000");
var receptionist = new ConnectionManager();
document.addEventListener("ConnectionManager_ready", function(){ receptionist.storageGuy.scan("home"); });
receptionist.init();