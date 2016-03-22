"use strict";

var PLAYER_NAME = "";
var HAND = [];

var ClientType = "player"

var add_player = function() {
    socket.emit('addplayer', $('#p').val(), function(connected) {
        if (connected === true) {
            status_message("SYSTEM", "Host Ready");
        } else
            status_message("SYSTEM", "Host Failure");
    });

    $('#set-player-name').hide();
    return false;
};

var show_player_name = function() {
    PLAYER_NAME = $('#p').val()
    $('#player-name').html(PLAYER_NAME).show();
    return false;
};

var ask_player_ready = function() {
    $('#player-ready').show();
    return false;
};

var set_ready = function() {
    socket.emit('player-ready', function(callback) {
        if (callback === true) {
            status_message("player", "Player Ready");
        } else
            status_message("player", "Failed to set Ready");
    });

    $('#player-name')
        .addClass('player-is-ready');
    $('#player-ready :button')
        .addClass('disable-actions')
        .text('Waiting..');

    return false;
};

var draw_card = function() {
    socket.emit('draw-card');
}

var play_card = function(c) {
    console.log("Playing card: ", HAND[c]);
    $('#player-ready').show();
    // Tell the game server about it
    socket.emit('play-card', HAND[c], function(data) {
        console.log("Got callback: ",data);
        $('#player-ready').hide();
        if (data['success'] === true) {
            status_message("player", "Played Card: " + HAND[c]);
            // Remove card from HAND
            //
            delete HAND[c];
            redraw_cards();
        } else {
            status_message("player", "Couldn't play Card: +" + HAND[c]);
        }
    });
}

var redraw_cards = function() {
    console.log("Redrawing..")
    var cards = "";
    for (var c in HAND) {
        cards = cards + '<li><img src="img/' + HAND[c] + '.png" class="card-img" onClick="play_card(' + c + ')"/></li>';
    }
    // Blank second card if you only have one.
    //if (HAND.length < 2) {
      //  cards = cards + '<li><img src="img/0_back.png" class="card-img"/></li>';
    //}
    console.log(cards)
    $('#cards ul').html(cards);
}

socket.on('game-state', function(game_state) {

    // Updates local copy of game state
    // Main events handler
    game_state_update(game_state);

    return false;
});

var game_state_update = function(game_state) {

    console.log("Received Game State: ", game_state)

    // If the round is going.
    if (game_state['in_game'] === true) {

        // Read hand from state. 
        // Other players can mess with it.
        HAND = game_state['players'][PLAYER_NAME]['hand']

        // Hide Ready Message.
        //  probably show something like "game start!"
        if (game_state['turn'] === 1) {
            $('#player-ready').hide();
        }

        if (game_state['active_player'] === PLAYER_NAME) {

            // Draw Card a begining of turn
            if (game_state['turn_phase'] === 0) {
                status_message('player', 'Your turn, ' + PLAYER_NAME);
                draw_card();
            }
        }

        redraw_cards();
    }
}

$('#set-player-name').submit(function() {
    add_player();
    show_player_name();
    ask_player_ready();
    return false;
});


/* $(window).load(function(){ $('#game-area').imagefit(); });*/
2