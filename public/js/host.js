"use strict";

var clientType = "host";

var update_player_list = function(players) {
    $("#players").html('');
    for (var p in players) {
        var name = players[p]['playerName'];
        $("#players").append($('<li>').text(name).addClass("player"));
        if(players[p].connected === true) 
            $("#players li:last").attr('data-player-state','connected');
        
    }
};

var update_in_game = function(in_game) {
    $("#in-game").text(in_game)
}

var update_game_state = function(game_state) {
    update_in_game(game_state["in_game"]);
}

var update_host_view = function(players) {
    update_player_list(players);
}

// Debug Commands


var send_state = function() {
    socket.emit('send-state', function(callback) {
        if (callback === true) {
            status_message("game-state", "Game state sent");
        } else
            status_message("game-state", "Game state failed");
    })
}


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
            status_message("game-state", "start game");
        }
    })
}


$(".send-state").click(function() {
    send_state();
})


$(".send-players").click(function() {
    send_players();
})

$(".show played-card").click(function() {
    console.log("Played this card:");
})


// Host events
//

socket.on('game-state', function(game_state) {
    status_message('host/socket/game-state', 'Game State Event');
    update_game_state(game_state);
    return false;
});

socket.on('player-list', function(players) {
    status_message('host/socket/player-list', 'Received Player List' + players);
    update_host_view(players);
    return false;
});


$(document).ready(function() {});