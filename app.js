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
var NumPlayers = 2;
var MaxWins = 5;

var Game = require('./game').newGame(NumPlayers, MaxWins);

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

    // Watch for all events for event stream
    socket.on('*', function(msg) {
        event_stream({
            "source": undefined,
            "recieved": msg
        });
    });

    // Register a GUid for each client, for safe reconnect
    //
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
        broadcast_message("Starting Game", true);
        event_stream({
            "source": 'app/socket/start-game',
            "event": 'Starting Game'
        })
        start_game();
        callback({
            "success": true
        });
    });

    // Start the next round

    socket.on('next-round', function(callback) {
        console.log('Handling: next-round!');
        broadcast_message("Starting Round!", true);
        event_stream({
            "source": 'app/socket/next-round',
            "event": 'Starting Round'
        })
        start_round();
        callback({
            "success": true
        });
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
            "card": card
        });
    });

    socket.on('play-card', function(uid, action, callback) {
        console.log("action: ", action);
        event_stream({
            "source": 'app/socket/play-card',
            "action": action
        });

        // Deal with card event
        card_handler(uid, action, socket);

        // Remove card from Players Hand
        Game.Clients.removeCard(uid, action.card);

        // Get ready for next turn.
        Game.nextTurn();

        // Handle 'Game Over' and 'Round Over'
        //
        if (Game.gameState.gameWinner) {
            var winnerName = Game.Clients.getPlayerName(Game.gameState.gameWinner);
            broadcast_message(winnerName + ' wins the game.', true);
            broadcast_player_list();
            callback({
                "success": true,
                "gameOver": true
            });
        } else if (Game.gameState.roundWinner) {
            var winnerName = Game.Clients.getPlayerName(Game.gameState.roundWinner);
            broadcast_message(winnerName + ' wins the round.', true);
            broadcast_player_list();
            callback({
                "success": true,
                "gameOver": true
            });
            setTimeout(function() {
                end_round();
                broadcast_message('Round: ' + (Game.gameState.round + 1), true);
                start_round();
            }, 5000);
        } else {
            broadcast_game();
            broadcast_player_list();
        }

        callback({
            "success": true
        });
    });

    // Debugging Functions

    // Send game state
    socket.on('send-state', function(callback) {
        event_stream({
            "source": 'app/socket/send-state'
        });
        broadcast_game();
    });


    // Send player list
    socket.on('send-player-list', function(callback) {
        event_stream({
            "source": 'app/socket/send-player-list'
        });
        broadcast_player_list();
    });

    // Send hand
    // send player hand from game state.
    socket.on('get-hand', function(uid, callback) {
        event_stream({
            "source": 'app/socket/get-hand',
            "uid": uid
        });
        var hand = Game.Clients.getHand(uid);
        if (hand) {
            callback({
                "success": true,
                "hand": hand
            })
        }
    });

    return false;
});


// Card rules handlers

var card_handler = function(uid, action, socket) {

    // Handle card played
    io.in(Room).emit('played-card', action.card);

    // Check if target player is protected by handmaid
    if (action.hasOwnProperty('targetPlayerUid')) {
        var target = Game.Clients.getByUid(action.targetPlayerUid);
        if (target.protected) {
            return true;
        }
    }

    switch (action.card) {
        case 'guard':
            card_handler_guard(action);
            break;
        case 'priest':
            card_handler_priest(action, socket.id);
            break;
        case 'baron':
            card_handler_baron(action, uid);
            break;
        case 'handmaid':
            card_handler_handmaid(uid);
            break;
        default:
            break;
    }
    return true;
}

var card_handler_guard = function(action) {

    var target = Game.Clients.getByUid(action.targetPlayerUid);

    // Compare card to target player card
    if (Game.Clients.hasCard(target.uid, action.targetCard)) {
        broadcast_message(target.playerName + ' out of round.', true);
        Game.Clients.updateByUid(target.uid, 'outOfRound', true);
        Game.removeFromRound(target.uid)
    } else {
        broadcast_message(target.playerName + ' no match', true);
    }
    return true;
}

var card_handler_priest = function(action, playerSocketId) {

    var targetPlayer = Game.Clients.getByUid(action.targetPlayerUid);
    var targetHand = Game.Clients.getHand(action.targetPlayerUid);

    io.to(playerSocketId).emit('show-hand', {
        'uid': targetPlayer.uid,
        'name': targetPlayer.playerName,
        'hand': targetHand
    });
    return true;
}

var card_handler_baron = function(action, playerUid) {

    var player = Game.Clients.getByUid(playerUid);
    var target = Game.Clients.getByUid(action.targetPlayerUid);

    var targetHand = Game.Clients.getHand(target.uid);
    var playerHand = Game.Clients.getHand(player.uid);

    var playerCard = Game.Deck.getCardByName(playerHand[0]);
    var targetCard = Game.Deck.getCardByName(targetHand[0]);

    var loser = '';

    // player loses
    if (playerCard.value > targetCard.value) {
        loser = target;
    } else if (targetCard.value > playerCard.value) {
        loser = player;
    }

    io.to(player.socketId).emit('show-hand', {
        'uid': target.uid,
        'name': target.playerName,
        'hand': targetHand
    });

    io.to(target.socketId).emit('show-hand', {
        'uid': player.uid,
        'name': player.playerName,
        'hand': playerHand
    });

    if (loser) {
        Game.Clients.updateByUid(loser.uid, 'outOfRound', true);
        Game.removeFromRound(loser.uid);
        setTimeout(function() {
            broadcast_message(loser.playerName + ' out of round.', true);
        }, 3000);
    }
    return true;
}

var card_handler_handmaid = function(playerUid) {
    Game.Clients.updateByUid(playerUid, 'protected', true);
    return true;
}

// Player Event Handlers

var add_player = function(playername, socket) {
    x
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
    if (Game.getInGame() === false) {
        Game.startGame();
        return true;
    }
    return false
}


var start_round = function(socket) {
    if (Game.getInGame() === true) {
        Game.startRound();
        io.in(Room).emit('start-round');
        broadcast_game();
        broadcast_player_list();
        return true;
    }
    return false
}

var end_round = function(socket) {
    if (Game.getInGame() === true) {
        Game.endRound();
        io.in(Room).emit('end-round');
        return true;
    }
    return false
}

var broadcast_player_list = function() {
    var playerList = Game.Clients.getByType('player');
    event_stream({
        "source": 'server',
        "player-list": Game.Clients.getByType('player')
    });

    io.in(Room).emit('player-list', playerList);
};

var broadcast_host_list = function() {

    var hostList = Game.Clients.getByType('host');
    event_stream({
        "source": 'server',
        "host-list": Game.Clients.getByType('host')
    });


    io.in(Room).emit('host-list', hostList);
};


var broadcast_game = function() {
    event_stream({
        "source": 'server',
        "game-state": Game
    })

    io.in(Room).emit('game-state', Game);
};

var broadcast_message = function(message, flash) {
    event_stream({
        "source": 'server',
        "message": message,
        "flash": flash
    })

    io.in(Room).emit('broadcast-message', message, flash);
};


var event_stream = function(msg) {
    if (!isEmptyObject(msg)) {
        if (msg.source) {
            io.in(Room).emit('event', msg);
            console.log(JSON.stringify(msg))
        }
    }
};

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