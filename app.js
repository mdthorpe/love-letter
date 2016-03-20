"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var path = require('path');
var sleep = require('sleep');

var PLAYERS = {};
var HOSTS = {};

var ROOM = 'AAAA';
var PORT = 3000;
var NUM_PLAYERS = 1;

var DECK = ['1_guard', '2_preist', '3_baron'];

var STARTING_GAME_STATE = {
    "in_game": false,
    "round": 1,
    "turn": 1,
    "game_count": 1,
    "game_over": false,
    "winner": null,
    "active_player": null,
    "target_player": null,
    "turn_phase": 0, // 0,draw 1,play 2,end
    "players": {},
    "deck": DECK
};

var GAME_STATE = STARTING_GAME_STATE;

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
        room: ROOM,
        title: 'host:' + ROOM,
        total_players: NUM_PLAYERS,
        game_state: GAME_STATE
    });
});

app.get('/player', function(req, res) {
    res.render('player', {
        room: ROOM,
        title: 'player: ' + ROOM
    });
});

app.get('/events', function(req, res) {
    res.render('events');
});

app.get('/', function(req, res) {
    res.redirect('/host');
});

io.on('connection', function(socket) {

    var event_stream = function(msg) {
        if (!isEmptyObject(msg)) {
            socket.broadcast.to(ROOM).emit('event', msg);
        }
    };

    var broadcast_player_list = function() {
        event_stream({
            "source": 'server',
            "player-list": PLAYERS
        });

        socket.broadcast.to(ROOM).emit('player-list', PLAYERS);
    };

    var broadcast_game_state = function() {
        event_stream({
            "source": 'server',
            "game-state": GAME_STATE
        })

        io.in(ROOM).emit('game-state', GAME_STATE);
    };

    socket.on('*', function(msg) {
        event_stream({
            "source": 'event',
            "recieved": msg
        });
    });

    // when the client emits 'addplayer', this listens and executes
    socket.on('addplayer', function(playername, callback) {
        var msg = add_player(playername, socket);
        event_stream(msg);

        broadcast_player_list();

        callback(true);
        return false;

    });

    // when the client emits 'addhost', this listens and executes
    socket.on('addhost', function(callback) {
        HOSTS[socket.id] = socket.id;

        socket.room = ROOM;
        socket.join(ROOM);

        event_stream({
            "source": 'host',
            "connect": socket.id
        });

        broadcast_player_list();

        callback(PLAYERS);
    });

    // Join for connected event listners
    socket.on('addlistener', function(callback) {

        socket.room = ROOM;
        socket.join(ROOM);

        // echo to room that a person has connected to their room
        event_stream({
            "source": 'event_listener',
            "event": socket.id + ' connected.'
        });

        callback(true);
    });

    // Client disconnect
    socket.on('disconnect', function() {
        if (PLAYERS[socket.username]) {
            // remove player
            var msg = remove_player(socket);
            event_stream(msg);

            broadcast_player_list();
            //broadcast_game_state();
        }

        if (HOSTS[socket.id]) {
            //remove host
            event_stream({
                "source": 'socket',
                "event": 'remove host: ' + HOSTS[socket.id]
            });

            delete HOSTS[socket.id];
        }
    });

    // Player Events
    //
    socket.on('player-ready', function(callback) {
        // echo to room that a person has connected to their room
        console.log(socket.username + ' ready.');
        event_stream({
            "source": 'player',
            "event": socket.username + ' ready.'
        });
        PLAYERS[socket.username].ready = true;
        broadcast_player_list();

        callback(true);
    });


    // Game Events : Start the game

    socket.on('start-game', function(callback) {
        console.log('Handling: start-game');
        start_game();
        console.log('Broadcasting: game-state');
        broadcast_game_state();
    });


    // Game Events : End the game

    socket.on('end-game', function(callback) {
        if (GAME_STATE["in_game"] === true) {
            GAME_STATE["in_game"] = false;
            console.log("Game Ending");
        } else {
            console.log("No game to end.");
        }
        broadcast_game_state();
    });

    socket.on('draw-card', function() {
        if (GAME_STATE["in_game"] === true) {

            var player_name = socket.username;

            if (GAME_STATE["active_player"] === player_name) {
                // draw a card.
                GAME_STATE["players"][player_name] =
                    draw_card(GAME_STATE["players"][player_name]);

                // Change turn phase
                GAME_STATE["turn_phase"] = 1;

                // update your state to everyone.
                broadcast_game_state();
            }
        }

    });

    socket.on('play-card', function(card, callback) {
        console.log(card, callback)
        callback({"success" : true});
    });

    // Debugging Functions

    // Send game state
    socket.on('send-state', function(callback) {
        console.log("send state event");
        broadcast_game_state();
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
    var player = {
        "name": playername,
        "connected": true,
        "ready": false
    };

    // set the player name
    PLAYERS[player.name] = player;
    socket.username = player.name;

    // join the room channel
    socket.room = ROOM;
    socket.join(ROOM);
}

var remove_player = function(socket) {
    delete PLAYERS[socket.username];
    var msg = {
        "source": 'socket',
        "event": 'remove player: ' + PLAYERS[socket.username]
    };
    return msg;
}


// Game Event Handlers

var start_game = function(socket) {
    if (GAME_STATE["in_game"] === false) {

        // Push list of player names into GAME_STATE.
        io.sockets.sockets.map(function(e) {
            if (e.hasOwnProperty('username')) {
                var new_player_state = player_init(e.username);
                console.log("Adding player: ", e.username);
                GAME_STATE['players'][e.username] = new_player_state;
            }
        })

        GAME_STATE["in_game"] = true;
        GAME_STATE["active_player"] = Object.keys(GAME_STATE["players"])[0];
        GAME_STATE["round"] = 1

        console.log("Starting Game: ", GAME_STATE);
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
    if (DECK.length > 0) {
        if (player["hand"].length < 2) {
            player["hand"].push(DECK.pop());
        }
    }
    return player;
}

//require('express-debug')(app);

http.listen(PORT, function() {
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