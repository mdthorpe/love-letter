"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var PLAYERS = {};
var HOSTS = {};
var LISTENERS = {};

var ROOM = 'AAAA';
var PORT = 3000;
var NUM_PLAYERS = 2;

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
     title: 'host:' + ROOM,
     total_players: NUM_PLAYERS });
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
        if (!isEmptyObject(msg) ) {
            socket.broadcast.to(ROOM).emit('event', msg);
        }
    };
    
    socket.on('*', function (msg) {
        event_stream({ "source": 'event',
                       "recieved" : msg});
    });

    var broadcast_player_list = function () {
        event_stream({ "source": 'server',
                       "player-list" : PLAYERS});

        socket.broadcast.to(ROOM).emit('player-list', PLAYERS);
    };

    // when the client emits 'addplayer', this listens and executes
    socket.on('addplayer', function(playername, callback){

        var  player = {
            "name": playername,
            "connected": true,
            "ready" : false
        };

        // set the player name
        PLAYERS[player.name] = player;
        socket.username = player.name;

        // join the room channel
        socket.room = ROOM;
        socket.join(ROOM);
        event_stream({ "source": 'player', 
                       "connect": playername});

        broadcast_player_list(); 

        callback(true);  
        return false;   
    });

    // when the client emits 'addhost', this listens and executes
    socket.on('addhost', function(callback){
        HOSTS[socket.id] = socket.id;
        
        socket.room = ROOM;
        socket.join(ROOM);

        event_stream({ "source": 'host', 
                       "connect": socket.id});

        broadcast_player_list();

        callback(PLAYERS);

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
        if (PLAYERS[socket.username]){ 
            event_stream({ "source": 'socket', 
             "event" : 'remove player: ' + PLAYERS[socket.username]});

            delete PLAYERS[socket.username]; 
            broadcast_player_list();
        }
        if (HOSTS[socket.id]){ 
            event_stream({ "source": 'socket', 
             "event" : 'remove host: ' + HOSTS[socket.id]});

            delete HOSTS[socket.id]; 
        }
    });

  // Player Events
  //
  socket.on('player-ready', function(callback){    
    // echo to room that a person has connected to their room
    console.log(socket.username + ' ready.');
    event_stream({ "source": 'player', 
     "event": socket.username + ' ready.'});
    PLAYERS[socket.username].ready = true;
    broadcast_player_list();

    callback(true);
});

});

//require('express-debug')(app);

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});


// Util functions
//

// Detect empty objects
function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}
