var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var peerList = {};

app.get('/peerlist/*', function(req, res) {
    var peers = peerList[req.originalUrl.split("peerlist/")[1]];
    res.send("var peers =" + JSON.stringify(peers));
});

app.use('/scripts', express.static(__dirname + '/hivemind/scripts'));

var sockets = {};
io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on("pagename", function(msg){
        peerList[msg] = peerList[msg] || {};
        peerList[msg][this.id] = true;
        sockets[this.id] = sockets[this.id] || this;
        sockets[this.id].pages = sockets[this.id].pages || [];
    	sockets[this.id].pages.push(msg);
        socket.emit('youridis', this.id);
    });

    socket.on('disconnect', function() {
        for( var i = 0; i < sockets[this.id].pages.length; i++){
            delete peerList[sockets[this.id].pages[i]][this.id];
        }
        delete sockets[this.id];
        console.log('user disconnected');
    });

    socket.on("offer", function(msg){
    	sockets[JSON.parse(msg).to].emit("offer", msg);
    });

    socket.on("answer", function(msg){
    	sockets[JSON.parse(msg).to].emit("answer", msg);
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});