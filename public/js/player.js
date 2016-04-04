"use strict";

var clientType = "player"

var playerName = sessionStorage.getItem('playerName');
var playerCards = sessionStorage.getItem('playerCards');

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

        var cardFace = $(".card[data-pos='top']").attr("data-face");

        socket.emit('play-card', clientUniqueID, cardFace, function(callback) {
            if (callback["success"] === true) {

                // Disable card swapping
                $('.box').unbind('click');

                // Player card
                $(".card[data-pos='top']")
                    .attr('data-anim', 'playcard')
                    .attr('data-pos', 'played');


                $(".card[data-pos='bottom']")
                    .attr('data-anim', 'slidemiddle')

            }
        })

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

var socket_game_state = function(game) {
    console.log(game.gameState);
    var cards_in_hand = $(".card").length;
    console.log("cards_in_hand:", cards_in_hand);

    if (game.gameState.inGame === true) {
        if (cards_in_hand === 0) {
            draw_card();
        }
        if (game.gameState.activePlayer === clientUniqueID) {
            draw_card();
        }
    }
    return true;
}

var socket_player_list = function(player_list) {
    //console.log(player_list);
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

    if (playerCards) {
        for ( c in playerCards ) {
            
        }
    }


    status_message("player/restore_session", "Complete.")
    return false;
}

var clear_settings = function() {
    status_message("player/clear_settings", "Clearing local settings");
    sessionStorage.removeItem("playerName");
    $(".ask-player-name").show();
    $(".player-name").hide();
    $(".container").hide();
}

var clear_uid = function() {
    status_message("player/clear_uid", "Clearing UID");
    sessionStorage.removeItem("clientUniqueID");
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

socket.on('game-state', function(game) {
    socket_game_state(game);
    return true;
});

socket.on('player-list', function(player_list) {
    socket_player_list(player_list);
    return true;
});

////////////////////
// debug

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