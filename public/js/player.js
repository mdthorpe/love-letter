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

var draw_card = function() {
    status_message("player/draw_card", "Drawing a card")
    if ($(".card").length < 2) {
        socket.emit('draw-card', clientUniqueID, function(callback) {
            if (callback["success"] === true) {
                status_message("player/draw_card", "Drew card: " + callback["card"]);
                show_card(callback["card"]);
            } else {
                status_message("player/draw_card", "Failed to draw card");
            }
        });
    }
    return false;
}

var play_card = function() {

    // If there is a top card. (ie: You have two cards)
    if ($(".card[data-pos='top']").length) {

        // Disable card swapping
        $('.box').unbind('click');

        // Player card
        $(".card[data-pos='top']")
            .attr('data-anim', 'playcard')
            .attr('data-pos', 'played');


        $(".card[data-pos='bottom']")
            .attr('data-anim', 'slidemiddle')

        setTimeout(function() {
            $(".card[data-pos='played']").remove();
            $(".card[data-pos='bottom']")
                .attr('data-pos', 'middle')
        }, 1000);
    }
}

var show_card = function(c) {
    if ($(".card").length === 1) {
        var d = card_div(c, "outtop");
        $(".cards").append(d);
        $(".card[data-pos='middle']")
            .attr('data-anim', 'slidebottom')
            .attr('data-pos', 'to-bottom');
        $(".card[data-pos='to-bottom']")
            .attr('data-pos', 'bottom');
        $(".card[data-pos='outtop']")
            .attr('data-anim', 'drawcardToTop')
            .attr('data-pos', 'top');

        $('.box').click(function() {
            flip_cards();
        });
        $('.box').on('swipe', function() {
            play_card();
        });
    } else {
        var d = card_div(c, "outtop");
        $(".cards").append(d);
        $(".card[data-pos='outtop']")
            .attr('data-anim', 'drawcardToMiddle')
            .attr('data-pos', 'middle');
    }
}

var card_div = function(face, pos) {
    return '<div data-pos=' + pos + ' data-face=' + face + ' class="box card"></div>';
}

var socket_game_state = function(game_state) {
    localGameState = game_state;
    //console.log("Received Game State: ", game_state)
    return true;
}

var socket_player_list = function(player_list) {

    var updateHand = false;

    if (localPlayerList[clientUniqueID]) {

        if (!localPlayerList[clientUniqueID].hand.equals(
            player_list[clientUniqueID].hand)) {
            updateHand = true;
        }
    }

    localPlayerList = player_list;
    if (updateHand) {
        //render_hand();
    }
}


// Called by main.js on register event
//
var restore_session = function() {
    status_message("player/restore_session", "Trying to restore session")
    if (playerName) {
        set_player_name();
    } else {
        $('.ask-player-name').show();
    }


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

$('.draw_card').click(function() {
    draw_card();
})

$('.show_banner').click(function() {
    $(".banners").attr("data-anim", "showBanner").fadeIn();
})

$('.hide_banner').click(function() {
    $(".banners").attr("data-anim", "hideBanner").fadeOut();
})

$('.flash_banner').click(function() {
    $(".banners").attr("data-anim", "showBanner").fadeIn();
    setTimeout(function() {
        $(".banners").attr("data-anim", "hideBanner").fadeOut();
    }, 2000);
})


// forms

$('.ask-player-name').submit(function() {
    playerName = $(".ask-player-name input").val()
    set_player_name();
    return false;
});


$(window).load(function() {});