"use strict";

var clientType = "host";
var activePlayer = "";
var numPlayers = 0;
var inGame = false;

var update_player_list = function(players) {
    
    $("#players").html('');
    
    var addedCount = 0;
    var name = '';

    for (var p in players) {
        
        addedCount += 1;
        
        if (players[p].hasOwnProperty('playerName')) {
            name = '<div class="player-name">' + players[p].playerName + '</div>';
        } else {
            name = '<div class="player-name">' + 'No Name' + '</div>';
        }
        
        var wins = "";
        var handmaid = "";

        for (var n = 0; n < players[p].wins; n += 1) {
            wins = wins + '<div class="crown"></div>';
        }

        // Show shield for protected players
        if (players[p].protected === true) {
            handmaid = handmaid + '<div class="handmaid" data-anim="showShield"></div>';
        }

        $("#players").append($('<li>').html(name + wins + handmaid).addClass("player"));

        if (players[p].outOfRound) {
            $("#players li:last").attr('data-player-state', 'outofround')
        } else if (players[p].connected === true) {
            $("#players li:last").attr('data-player-state', 'connected')
        } else {
            $("#players li:last").attr('data-player-state', 'nostate')
        }
        if (p === activePlayer)
            $("#players li:last").attr('data-player-state', 'isturn');
    }
    for (var x = 0; x < (numPlayers - addedCount); x += 1) {
        var html = '<li data-player-state="nostate" class="player"><div class="player-name">' + 'Waiting for player...' + '</div></li>';
        $("#players").append(html);
    }

    // if (inGame === false && (addedCount === numPlayers)) {
    //     setTimeout(function() {
    //         start_game();
    //     }, 4000);
    // }
};


var show_played_card = function(card) {
    $(".cards").append('<div class="box card" data-pos="offscreen" data-face="' + card + '" data-anim="playcard">');
};

var update_game_state = function(game) {
    // activePlayer = game.gameState.activePlayer;
    // numPlayers = game.gameState.numPlayers;
    // inGame = game.gameState.inGame;
    var cardsLeft = ("0" + game.gameState.deck.length).substr(-2,2)
    $(".cards-left").html("Cards: " +cardsLeft);
};


var send_state = function() {
    socket.emit('send-state', function(callback) {
        if (callback === true) {
            status_message("game-state", "Game state sent");
        } else
            status_message("game-state", "Game state failed");
    })
};


var send_players = function() {
    socket.emit('send-player-list', function(callback) {
        if (callback === true) {
            status_message("send-player-list", "Player list sent");
        } else
            status_message("send-player-list", "Player list failed");
    })
}


var start_game = function() {
    socket.emit('start-game', function(callback) {
        if (callback["success"] === true) {
            status_message("start-game", "start game");
            socket.emit('next-round', function(callback) {
                if (callback === true) {
                    status_message("start-game", "next round");
                }
            })
        }
    })
}

// Called by main.js on register event
//
var restore_session = function() {
    status_message("host/restore_session", "Trying to restore session")

    status_message("host/restore_session", "Getting Game State");
    socket.emit('send-state', function(callback) {
        if (callback === true) {
            status_message("host/restore_session", "Game state received");

        } else
            status_message("game-state", "Game state failed");
    })

    status_message("host/restore_session", "Getting player list");
    socket.emit('send-player-list', function(callback) {
        if (callback === true) {
            status_message("host/restore_session", "Player list received");
        } else
            status_message("send-player-list", "Player list failed");
    })
    status_message("host/restore_session", "Complete.")
    return false;
}

// Debug 
$(".send-state").click(function() {
    send_state();
})

$(".start-game").click(function() {
    start_game();
})

$(".send-players").click(function() {
    send_players();
})

$('.toggle-banner').click(function() {
    toggle_banner();
})

$('.flash-banner').click(function() {
    set_banner("Testing");
    flash_banner();
})

$('.show-played-card').click(function() {
    show_played_card("none");
})




// Host events
//

socket.on('game-state', function(game_state) {
    status_message('host/socket/game-state', 'Game State Event');
    update_game_state(game_state);
    return false;
});

socket.on('player-list', function(players) {
    status_message('host/socket/player-list', 'Received Player List: ' + players);
    update_player_list(players);
    return false;
});

socket.on('played-card', function(card) {
    status_message('host/socket/played-card', 'Played Card: ' + card);
    show_played_card(card);
    return false;
});

socket.on('start-round', function(card) {
    show_played_card('back');
    setTimeout(function() {
        show_played_card('back');
    }, 300);
    setTimeout(function() {
        show_played_card('back');
    }, 600);
    return false;
});


$(document).ready(function() {});