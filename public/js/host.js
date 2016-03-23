"use strict";

var ClientType = "host";

// var join_as_host = function() {
//     /*jshint -W117 */
//     socket.emit('addhost', function(players) {
//         if (players) {
//             update_host_view(players);
//             status_message("SYSTEM", "Host Ready");
//         } else
//             status_message("SYSTEM", "Host Failure");
//     });
// };

var update_player_list = function(players) {
    $("#players").html('');
    for (var player in players) {
        if (players[player].ready) {
            $("#players").append($('<li>')
                .text(players[player].name).addClass('player-is-ready'));
        } else {
            $("#players").append($('<li>')
                .text(players[player].name));
        }
    }
};

var count_ready_players = function() {
    var counter = 0;
    for (var p in this) {
        if (this[p].hasOwnProperty("ready") &&
            this[p].ready === true)++counter;
    }
    return counter;
};

var count_connected_players = function() {
    var counter = 0;
    for (var p in this) {
        if (this[p].hasOwnProperty("connected") &&
            this[p].connected === true)++counter;
    }
    return counter;
}

var update_ready = function(players) {
    $("#ready-players").text(count_ready_players.call(players));
};

var update_connected = function(players) {
    $("#connected-players").text(count_connected_players.call(players));
};

var update_in_game = function(in_game) {
    $("#in-game").text(in_game)
}

var update_game_state = function(game_state) {
    update_in_game(game_state["in_game"]);
}

var update_host_view = function(players) {
    update_player_list(players);
    update_connected(players);
    update_ready(players);
    if (count_ready_players.call(players) ===
        parseInt($("#total-players").text())) {
        status_message('HOST', 'All players ready');
        socket.emit('start-game');
    }
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

$("#send-state :button").click(function() {
    send_state();
})


var send_players = function() {
    socket.emit('send-player-list', function(callback) {
        if (callback === true) {
            status_message("send-player-list", "Player list sent");
        } else
            status_message("send-player-list", "Player list failed");
    })
}

$("#send-players :button").click(function() {
    send_players();
})


var start_game = function() {
    socket.emit('start-game', function(callback) {
        if (callback === true) {
            status_message("game-state", "start game");
        }
    })
}

// Host events
//

socket.on('game-state', function(game_state) {
    status_message('host/socket/game-state', 'Game State Event');
    update_game_state(game_state);
    return false;
});

socket.on('player-list', function(players) {
    status_message('host/socket/player-list', 'Received Player List');
    update_host_view(players);
    return false;
});


$(document).ready(function() {});