"use strict";

var clientType = "player"

var playerName = sessionStorage.getItem('playerName');
var playerReady = sessionStorage.getItem('playerReady');
var playerInGame = sessionStorage.getItem('playerInGame');

var set_player_name = function() {

    socket.emit('set-player-name', clientUniqueID, playerName, function(connected) {
        if (connected === true) {
            sessionStorage.setItem('playerName', playerName);
            $('#set-player-name').hide();
        }
    })
    $('#player-name').html(playerName).show();
    return false;
}

var ask_player_ready = function() {
    $('#player-ready').show();
    return false;
};

var set_player_ready = function() {
    status_message("player/set_player_ready", "Trying to set ready")
    socket.emit('set-player-ready', clientUniqueID, true, function(success) {
        if (success === true) {

            playerReady = true;
            sessionStorage.setItem('playerReady', playerReady);

            status_message("player", "Player Ready");

            $('#player-name')
                .addClass('player-is-ready');
            $('#player-ready :button')
                .addClass('disable-actions')
                .text('Waiting..')

        } else {
            status_message("player", "Failed to set Ready");
        }
    });
    return false;
};

var draw_card = function() {
    socket.emit('draw-card');
}

var play_card = function(c) {
    console.log("Playing card: ", HAND[c]);
    //$('#player-ready').show();
    // Tell the game server about it
    socket.emit('play-card', HAND[c], function(data) {
        console.log("Got callback: ", data);
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


// Called by main.js on register event
//
var restore_session = function() {
    status_message("player/restore_session", "Trying to restore session")
    if (playerName) {
        set_player_name();
        if (playerReady)
            set_player_ready();
    } else {
        $('#set-player-name').show();
    }

    //ask_player_ready(); 
    return false;
}

$('#player-ready :button').click(function () {
    set_player_ready();
});

$('#set-player-name').submit(function() {

    playerName = $('#player-name-field').val();
    set_player_name();
    console.log("set-player-name");
    ask_player_ready();

    return false;
});


$(window).load(function() {});