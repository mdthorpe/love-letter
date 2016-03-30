"use strict";

var clientType = "player"

var playerName = sessionStorage.getItem('playerName');
var playerReady = sessionStorage.getItem('playerReady');
var playerInGame = sessionStorage.getItem('playerInGame');
var playerCards = sessionStorage.getItem('playerCards');

var localGameState = {};
var localPlayerList = {};

var set_player_name = function() {

    socket.emit('set-player-name', clientUniqueID, playerName, function(connected) {
        if (connected === true) {
            sessionStorage.setItem('playerName', playerName);
            $('.ask-player-name').hide();
        }
    })
    $('.player-name').html(playerName).fadeIn('slow');
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

            status_message("player/set_player_ready", "Player Ready");

            $('.player-name')
                .addClass('player-is-ready');
            $('#player-ready :button')
                .addClass('disable-actions')
                .text('Waiting..')

        } else {
            status_message("player/set_player_ready", "Failed to set Ready");
        }
    });
    return false;
};

var draw_card = function() {
    status_message("player/draw_card", "Drawing a card")
    socket.emit('draw-card', clientUniqueID, function(callback) {
        if (callback["success"] === true) {
            status_message("player/set_player_ready", "Drew card: " + callback["card"]);
            show_card(callback["card"]);
        } else {
            status_message("player/set_player_ready", "Failed to draw card");
        }
    });
    return false;
}

var play_card = function(c) {
    console.log("Playing card: ", c);
}

var show_card = function(c) {
    var d = card_div(c,"outtop");
    console.log(d);
    $(".cards").append(d);
}

var render_hand = function() {
            //     .box.card(data-pos="top",data-anim="none",data-face="back")
            // .box.card(data-pos="bottom", data-anim="none",data-face="back")
    console.log("Render hand..");
    var hand = localPlayerList[clientUniqueID].hand;
    if(hand.length === 1){
        console.log("one card");
        var c = card_div(hand[0],"middle");
        console.log(c);
        $(".cards.container").html(c);
    }

    if(hand.length === 2){
        console.log("two card");
        var t = card_div(hand[0],"top");
        console.log(t);
        var b = card_div(hand[1],"bottom");
        console.log(t);
        $(".cards.container").html(t+b);
    }

    $('.box').on('swipe', function() {
        $(this)
            .attr('data-anim', 'none')
            .attr('data-anim', 'playcard')
    });
}

var card_div = function(face, pos) {
    return '<div data-pos=' + pos 
         + ' data-anim=' + "drawcard" 
         + ' data-face=' + face 
         + ' class="box card"></div>';
}

var socket_game_state = function(game_state) {
    localGameState = game_state;
    // console.log("Received Game State: ", game_state)

    // // If the round is going.
    // if (game_state['in_game'] === true) {

    //     // Read hand from state. 
    //     // Other players can mess with it.
    //     HAND = game_state['players'][PLAYER_NAME]['hand']

    //     // Hide Ready Message.
    //     //  probably show something like "game start!"
    //     if (game_state['turn'] === 1) {
    //         $('#player-ready').hide();
    //     }

    //     if (game_state['active_player'] === PLAYER_NAME) {

    //         // Draw Card a begining of turn
    //         if (game_state['turn_phase'] === 0) {
    //             status_message('player', 'Your turn, ' + PLAYER_NAME);
    //             draw_card();
    //         }
    //     }

    //     redraw_cards();
    return true;
}

var socket_player_list = function(player_list) {

    var updateHand = false;

    if(localPlayerList[clientUniqueID]){

        if(!localPlayerList[clientUniqueID].hand.equals(
            player_list[clientUniqueID].hand) ){
            updateHand = true;
        }
    }

    localPlayerList = player_list;
    if (updateHand) {
        render_hand();
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
        $('.ask-player-name').show();
    }

    //ask_player_ready(); 
    status_message("player/restore_session", "Complete.")
    return false;
}

var clear_settings = function() {
    status_message("player/clear_settings", "Clearing local settings");
    sessionStorage.removeItem("playerName");
    sessionStorage.removeItem("playerReady");
    sessionStorage.removeItem("playerInGame");
    $(".ask-player-name").show();
    $(".player-name").hide();
    $(".container").hide();
}

var clear_uid = function() {
    status_message("player/clear_uid", "Clearing UID");
    localStorage.removeItem("clientUniqueID");
}

var toggle_cards = function() {
    $(".cards").toggle()
}

var toggle_ask = function() {
    $(".ask-player-name").toggle()
}

var flip_cards = function() {
    // Animate and move to tmp position
    $(".card[data-pos='top']")
        .attr('data-anim', 'bottom')
        .attr('data-pos', 'to-bottom');
    $(".card[data-pos='bottom']")
        .attr('data-anim', 'top')
        .attr('data-pos', 'to-top');

    // Set position
    $(".card[data-pos='to-top']")
        .attr('data-pos', 'top');
    $(".card[data-pos='to-bottom']")
        .attr('data-pos', 'bottom');
}

/////////////////////
// socket events

socket.on('game-state', function(game_state) {
    socket_game_state(game_state);
    return true;
});

socket.on('player-list', function(player_list) {
    socket_player_list(player_list);
    return true;
});


////////////////////
// jquery events

$('.box').click(function() {
    flip_cards();
});

$('#player-ready :button').click(function() {
    set_player_ready();
});

$('.draw_card').click(function() {
    draw_card();
})

// forms

$('.ask-player-name').submit(function() {
    playerName = $(".ask-player-name input").val()
    set_player_name();
    ask_player_ready();

    return false;
});


$(window).load(function() {});