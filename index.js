var express = require('express');
var app = express();
var http = require('http').Server(app);
var cookieParser = require('cookie-parser');
var io = require('socket.io')(http);

var peerList = {};
app.use(cookieParser('1234'));

app.set('views', __dirname + '/hivemind/views')
app.set('view engine', 'jade')
app.set('view options', {
    layout: false
});

app.get('/', function(req, res) {
    var id;
    if (req.cookies['uid']) {
        id = req.cookies['uid'];
    } else {
        id = new Date().getTime();
    }

    peerList["home"] = peerList["home"] || {};
    peerList["home"][id] = true;

    setUID(res, id);
    res.render('index', {
        pageName: 'home'
    });
});

app.get('/peerlist/*', function(req, res) {
    var peers = peerList[req.originalUrl.split("peerlist/")[1]];
    res.send("var peers =" + JSON.stringify(peers));
});

app.use('/scripts', express.static(__dirname + '/hivemind/scripts'));
app.use('/styles', express.static(__dirname + '/hivemind/styles'));
app.use('/images', express.static(__dirname + '/hivemind/images'));

var sockets = {};
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('myidis', function(msg) {
    	sockets[msg] = this;
        this.uid = msg;
    });

    socket.on('disconnect', function() {
        delete peerList[this.uid];
        delete sockets[this.uid];
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


function setUID(res, uid) {
    var thirtyDays = 30 * 24 * 60 * 60 * 1000;
    res.cookie('uid', uid, {
        maxAge: thirtyDays
    });
}
