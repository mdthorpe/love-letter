"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment')

var path = require('path');
var sleep = require('sleep');

var Room = 'AAAA';
var ServerPort = 3000;
var MaxPlayers = 2;

var Game = require('./game').newGame(MaxPlayers);

// wildcard socket events
var wildcard = require('socketio-wildcard')();
io.use(wildcard);

var request_logger = function(req, res, next) {
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

app.get('/host', function(req, res) {
    res.render('host', {
        room: Room,
        game_state: Game.gameState,
    });
});

app.get('/player', function(req, res) {
    res.render('player', {
        Room: Room,
        title: 'player: ' + Room
    });
});

app.get('/events', function(req, res) {
    res.render('events');
});

app.get('/', function(req, res) {
    res.redirect('/host');
});

io.on('connection', function(socket) {

    var client = null;

    var event_stream = function(msg) {
        if (!isEmptyObject(msg)) {
            if (msg.source) {
                //msg.ts = moment().format("HH:MM:ss\.SSS");
                socket.broadcast.to(Room).emit('event', msg);
                console.log(JSON.stringify(msg))
            }
        }
    };

    var broadcast_player_list = function() {
        var playerList = Game.Clients.getByType('player');
        event_stream({
            "source": 'server',
            "player-list": Game.Clients.getByType('player')
        });

        var hostList = Game.Clients.getByType('host');
        event_stream({
            "source": 'server',
            "host-list": Game.Clients.getByType('host')
        });
        

        io.in(Room).emit('player-list', playerList);
        //socket.broadcast.to(Room).emit('player-list', playerList);
    };

    var broadcast_game = function() {
        event_stream({
            "source": 'server',
            "game-state": Game
        })

        io.in(Room).emit('game-state', Game);
    };

    // Watch for all events for event stream
    socket.on('*', function(msg) {
        event_stream({
            "source": undefined,
            "recieved": msg
        });
    });

    // Register a GUid for each client, for safe reconnect
    //
    //socket.on('register', function(data) {
    socket.on('register', function(data, callback) {
        // A GUid was sent from client
        if (data !== null) {
            if (data.hasOwnProperty("clientUniqueID") &&
                data.hasOwnProperty("clientType")) {

                // If client has a UUid
                var uid = data.clientUniqueID;
                var clientType = data.clientType;

                // If the client has never registered
                if (!Game.Clients.getByUid(uid)) {
                    Game.Clients.addClient(uid, clientType);
                }

                Game.Clients.setConnected(uid, socket.id);
                if (clientType === "player") {
                    //broadcast_player_list();
                }

                socket.Room = Room;
                socket.join(Room);

                event_stream({
                    "source": "app/socket/register",
                    "register": uid,
                    "clientType": clientType
                });
            }
            callback(true);
        }
    });


    // Client disconnect
    socket.on('disconnect', function(data) {
        var client = Game.Clients.getBySocketId(socket.id)

        event_stream({
            "source": "app/socket/disconnect",
            "client": client,
        });

        if (client) {
            Game.Clients.setDisconnected(client.uid);
            if (client.clientType === "player") {
                broadcast_player_list();
            }
        }

    });

    // Player Events
    //

    // when the client emits 'addplayer', this listens and executes
    socket.on('set-player-name', function(uid, playerName, callback) {

        // set the player name
        Game.Clients.updateByUid(uid, "playerName", playerName);

        event_stream({
            "source": "app/socket/set-player-name",
            "event": playerName
        })

        broadcast_player_list()

        callback(true);

    });


    // Game Events : Start the game

    socket.on('start-game', function(callback) {
        console.log('Handling: start-game');
        event_stream({
            "source": 'app/socket/start-game',
            "event": 'Starting Game'
        })
        start_game();
        broadcast_game();
    });


    // Game Events : End the game

    socket.on('end-game', function(callback) {
        if (Game["in_game"] === true) {
            Game["in_game"] = false;
            console.log("Game Ending");
        } else {
            console.log("No game to end.");
        }
        broadcast_game();
    });

    socket.on('draw-card', function(uid, callback) {
        event_stream({
            "source": 'app/socket/draw-card',
            "event": uid
        });

        var card = Game.drawCard(uid);
        Game.Clients.addCard(uid, card);

        callback({
            "success": true,
            "card" : card
        });
    });

    socket.on('play-card', function(card, callback) {
        console.log(card, callback)
        callback({
            "success": true
        });
    });

    // Debugging Functions

    // Send game state
    socket.on('send-state', function(callback) {
        console.log("send state event");
        broadcast_game();
    });


    // Send player list
    socket.on('send-player-list', function(callback) {
        console.log("send player list event");
        broadcast_player_list();
    });

    return false;
});


// Player Event Handlers

var add_player = function(playername, socket) {

    // set the player name
    Game.Clients[uid].player_name = player;
}

var remove_player = function(socket) {
    delete Players[socket.username];
    var msg = {
        "source": 'socket',
        "event": 'remove player: ' + Players[socket.username]
    };
    return msg;
}


// Game Event Handlers

var start_game = function(socket) {
    if (Game["in_game"] === false) {

        // Push list of player names into Game.
        // io.sockets.sockets.map(function(e) {
        //     if (e.hasOwnProperty('username')) {
        //         var new_player_state = player_init(e.username);
        //         console.log("Adding player: ", e.username);
        //         Game['Players'][e.username] = new_player_state;
        //     }
        // })

        Game["in_game"] = true;
        // Game["active_player"] = Object.keys(Game["Players"])[0];
        Game["round"] = 1

        console.log("Starting Game: ", Game);
        broadcast_message("Starting Game");
        return true;
    }
    return false
}

var player_init = function(username) {
    var player = {
        "hand": []
    }
    player = draw_card(player);
    return player;
}

var draw_card = function(player) {
    if (Deck.length > 0) {
        if (player["hand"].length < 2) {
            player["hand"].push(Deck.pop());
        }
    }
    return player;
}


//require('express-debug')(app);

http.listen(ServerPort, function() {
    console.log('listening on *:' + ServerPort);
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