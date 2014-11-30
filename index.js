var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var peerList = {};

app.get('/peerlist/*', function(req, res) {
    var peers = peerList[req.originalUrl.split("peerlist/")[1]];
    res.send("var peers =" + (JSON.stringify(peers) || JSON.stringify({}) ) );
});

app.use('/scripts', express.static(__dirname + '/hivemind/scripts'));

var sockets = {};
io.on('connection', function(socket) {
    console.log(socket.id+': a user connected');
    console.log(socket.id+': sending ID');
    socket.emit('youridis', socket.id);

    socket.on("pagename", function(msg){
        console.log(this.id+': received pagename - '+msg);
        peerList[msg] = peerList[msg] || {};
        peerList[msg][this.id] = true;
        sockets[this.id] = sockets[this.id] || this;
        sockets[this.id].pages = sockets[this.id].pages || [];
        sockets[this.id].pages.push(msg);

        var peers = peerList[msg];
        socket.emit("peerList_"+msg, (JSON.stringify(peers) || JSON.stringify({}) ));
    });

    socket.on('disconnect', function() {
        if(sockets[this.id] && sockets[this.id].pages){
            for( var i = 0; i < sockets[this.id].pages.length; i++){
                delete peerList[sockets[this.id].pages[i]][this.id];
            }
        }
        delete sockets[this.id];
        console.log('user disconnected');
    });

    socket.on("offer", function(msg){
        console.log(socket.id+": receiving offer");
        if( sockets[JSON.parse(msg).to] ){
            sockets[JSON.parse(msg).to].emit("offer", msg);
        } else {
            socket.emit("peerisdead", msg.to);
        }
    });

    socket.on("answer", function(msg){
        console.log(socket.id+": receiving answer");
        if( sockets[JSON.parse(msg).to] ){
            sockets[JSON.parse(msg).to].emit("answer", msg);
        }
    })
});

http.listen((process.env.PORT || 3000), function() {
    console.log('listening on *:'+ (process.env.PORT || 3000));
});