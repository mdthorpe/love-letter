"use strict";

var clientType = "host";
var activePlayer = "";

var update_player_list = function(players) {
    $("#players").html('');
    for (var p in players) {
        var name = players[p]['playerName'];
        $("#players").append($('<li>').text(name).addClass("player"));
        if (players[p].connected === true){
            $("#players li:last").attr('data-player-state', 'connected')
        } else {
            $("#players li:last").attr('data-player-state', 'nostate')
        }
        if (p === activePlayer)
            $("#players li:last").attr('data-player-state', 'isturn');
    }
};


var show_played_card = function(card) {
    $(".cards").append('<div class="box card" data-pos="offscreen" data-face="' 
        + card + '" data-anim="playcard">');
};

var update_game_state = function(game) {
    console.log("game_state:", game);
    activePlayer = game.gameState.activePlayer;
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
        if (callback === true) {
            status_message("start-game", "start game");
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
    // return false;
});


$(document).ready(function() {});