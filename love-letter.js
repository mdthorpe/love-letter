"use strict";

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var PLAYERS = {};
var HOSTS = {};
var LISTENERS = {};

var ROOM = 'AAAA';
var PORT = 3000;
var NUM_PLAYERS = 3;

// wildcard socket events
var wildcard = require('socketio-wildcard')();
io.use(wildcard);

var request_logger = function (req, res, next) {
    var ts = Date.now();
    console.log({
        "ts": ts,
        "url": req.originalUrl
    });
    next();
};

app.set('view engine', 'jade');

// serve static content from public dir
app.use(express.static('public'));

// global request logger
app.use(request_logger);

app.get('/host', function (req, res) {
  res.render('host', { room: ROOM, 
                       title: 'host: ' + ROOM,
                       num_players: NUM_PLAYERS });
});

app.get('/player', function (req, res) {
  res.render('player', { room: ROOM,
                         title: 'player: ' + ROOM }); 
});

app.get('/events', function (req, res) {
  res.render('events'); 
});

app.get('/', function (req, res){
  res.redirect('/host');
});

io.on('connection', function (socket) {

    var event_stream = function (msg) {
          socket.broadcast.to(ROOM).emit('event', msg);
    };
    socket.on('*', function (msg) {
        event_stream({ "source": 'wildcard',
                       "event" : msg})
    });

    var broadcast_player_list = function () {
        socket.broadcast.to(ROOM).emit('playerlist', PLAYERS);
    };

    // when the client emits 'addplayer', this listens and executes
    socket.on('addplayer', function(playername, callback){

        socket.username = playername;
        socket.room = ROOM;
        PLAYERS[socket.id] = playername;

        socket.join(ROOM);

        // echo to room that a person has connected to their room
        event_stream({ "source": 'player', 
                       "event": playername + ' connected.'});

        broadcast_player_list(); 

        callback(true);     
    });

    // when the client emits 'addhost', this listens and executes
    socket.on('addhost', function(callback){

        socket.username = socket.id;
        socket.room = ROOM;
        HOSTS[socket.id] = socket.id;

        socket.join(ROOM);

        event_stream({ "source": 'host', 
                       "event": socket.id + ' connected.'});

        broadcast_player_list();

        callback(true);

    });

    // Join for connected event listners
    socket.on('addlistener', function(callback){

        socket.room = ROOM;
        socket.join(ROOM);
        
        // echo to room that a person has connected to their room
        event_stream({ "source": 'event_listener', 
                       "event": socket.id + ' connected.'});

        callback(true);
    });

  socket.on('disconnect', function(){
    if (PLAYERS[socket.id]){ 
        event_stream({ "source": 'socket', 
                       "event" : 'remove player: ' + PLAYERS[socket.id]});

        delete PLAYERS[socket.id]; 
        broadcast_player_list();
    }
    if (HOSTS[socket.id]){ 
        event_stream({ "source": 'socket', 
                       "event" : 'remove host: ' + HOSTS[socket.id]});

        delete HOSTS[socket.id]; 
    }
  });

});

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});
