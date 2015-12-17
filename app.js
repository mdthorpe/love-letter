var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var players = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/host', function(req, res){
  res.sendFile(__dirname + '/host.html');
});

app.get('/player', function(req, res){
  res.sendFile(__dirname + '/player.html');
});

io.on('connection', function(socket){

    // when the client emits 'adduser', this listens and executes
    socket.on('addplayer', function(playername){
				var room = 'AAAA';
				console.log('addplayer: ' + playername);
				console.log('room: ' + room);

        socket.username = playername;
        socket.room = room
        players[playername] = playername;

        socket.join(room);
        // echo to client they've connected
        socket.emit('statusmessage', 'SERVER', 'you have connected to ' + room);
        // echo to room that a person has connected to their room
        socket.broadcast.to(room).emit('statusmessage', 'SERVER', playername + ' has connected to this room');
    });



  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg + ' in ' + socket.room);
    io.sockets["in"](socket.room).emit('chat message', msg);
  });

  socket.on('join room', function(room_id){
    console.log('socket: ' + socket.id + ' is joining room: ' + room_id);
    socket.join(room_id);
    // welcome to the room
    var msg = "Welcome " + socket.id + " to the room!"
    io.to(room_id).emit('chat message', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

