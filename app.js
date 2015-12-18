var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var PLAYERS = {};
var HOST = {};
var ROOM = 'AAAA';

app.set('view engine', 'jade');

app.get('/host', function (req, res) {
  res.render('host', { room: ROOM });
});

app.get('/player', function (req, res) {
  res.render('player', { room: ROOM });
});

app.get('/', function (req, res){
  res.redirect('/host');
});

app.get('/js/:file', function (req,res) {
  var file = req.params.file;
  res.sendFile(path.join(__dirname + '/js/' + file));
});

io.on('connection', function (socket) {

    // when the client emits 'addplayer', this listens and executes
    socket.on('addplayer', function(playername){
				console.log('addplayer: ' + playername);
				console.log('room: ' + ROOM);

        socket.username = playername;
        socket.room = ROOM
        PLAYERS[playername] = playername;

        socket.join(ROOM);
        // echo to client they've connected
        socket.emit('statusmessage', 'SERVER', 'you have connected to ' + ROOM);
        // echo to room that a person has connected to their room
        socket.broadcast.to(ROOM).emit('statusmessage', 'SERVER', playername + ' has connected to this room');
    });

    // when the client emits 'addhost', this listens and executes
    socket.on('addhost', function(callback){
        console.log('adding host: ' + socket.id);
        console.log('room: ' + ROOM);

        socket.username = 'HOST';
        socket.room = ROOM
        HOST = socket.id;

        socket.join(ROOM);
        socket.broadcast.to(ROOM).emit('statusmessage', 'SERVER', socket.username + ' has connected to this room');

        callback('Host is ready!');
    });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

