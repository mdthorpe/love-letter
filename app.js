var express = require('express');
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path');

var PLAYERS = {},
    HOST = {},
    ROOM = 'AAAA';
    PORT = 3000;

app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/host', function (req, res) {
  res.render('host', { room: ROOM });
});

app.get('/player', function (req, res) {
  res.render('player', { room: ROOM });
});

app.get('/', function (req, res){
  res.redirect('/host');
});

io.on('connection', function (socket) {

    // when the client emits 'addplayer', this listens and executes
    socket.on('addplayer', function(playername){
				console.log('addplayer: ' + playername);
				console.log('room: ' + ROOM);

        socket.username = playername;
        socket.room = ROOM
        PLAYERS[socket.id] = playername;

        socket.join(ROOM);
        // echo to client they've connected
        socket.emit('statusmessage', 'SERVER', 'you have connected to ' + ROOM);
        // echo to room that a person has connected to their room
        socket.broadcast.to(ROOM).emit('statusmessage', 'SERVER', playername + ' has connected to this room');
        console.log(PLAYERS);
        console.log(HOST);
        socket.broadcast.to(HOST).emit('playerlist', PLAYERS);
    });

    // when the client emits 'addhost', this listens and executes
    socket.on('addhost', function(callback){
        console.log('adding host: ' + socket.id);
        console.log('room: ' + ROOM);
        
        socket.username = 'HOST';
        socket.room = ROOM;

        HOST = socket.id;

        socket.join(ROOM);
        socket.broadcast.to(ROOM).emit('statusmessage', 'SERVER', socket.username + ' has connected to this room');

        callback('Host is ready!');
    });

  socket.on('disconnect', function(){
    delete PLAYERS[socket.id];
    socket.broadcast.to(HOST).emit('playerlist', PLAYERS);
  });

});

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});

