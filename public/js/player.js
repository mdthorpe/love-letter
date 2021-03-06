"use strict";

var clientType = "player"

var playerName = sessionStorage.getItem('playerName');
var playerCards = sessionStorage.getItem('playerCards');

var targetPlayer = false;
var targetCard = false;

//var outOfRound = false;

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

var countess_state = function() {
    var has_countess = false;
    var has_kingOrPrince = false;

    var cards = $(".card");

    if (cards.length === 2) {
        for (var c = 0; c < 2; c += 1) {
            if($(cards[c]).attr('data-face') === 'countess'){
                has_countess = true;
            }
            if($(cards[c]).attr('data-face') === 'king'){
                has_kingOrPrince = true;
            }
            if($(cards[c]).attr('data-face') === 'prince'){
                has_kingOrPrince = true;
            }
        }
    }

    if (has_kingOrPrince === true && has_countess === true) {
        return true;
    }

    return false;
}

var draw_card = function() {
    status_message("player/draw_card", "Drawing a card")
    if ($(".card").length < 2) {
        socket.emit('draw-card', clientUniqueID, function(callback) {
            if (callback["success"] === true) {
                status_message("player/draw_card", "Drew card: " + callback["card"]);
                show_card(callback["card"]);
                var play_countess = countess_state();
                if (play_countess === true) {
                    status_message("player/draw_card", "Countess rule in effect");
                    if ($(".card[data-pos='top']").attr('data-face') !== 'countess'){
                        flip_cards();
                    }
                    $('.box').unbind('click');
                    $(".banners .banner").html("Must Play Countess");
                    $(".banners").attr("data-anim", "showBanner").fadeIn();
                    setTimeout(function() {
                        $(".banners").attr("data-anim", "hideBanner").fadeOut();
                    }, 2000);
                }
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

        if ((cardFace === "guard") 
            || (cardFace === "priest") 
            || (cardFace === "baron") 
            || (cardFace === "king")) {
            if (!targetPlayer) {
                $(".target-players").attr('data-anim', 'flipdown');
                return true
            }
        }
        if (cardFace === "prince") {
            if (!targetPlayer) {
                $(".all-players").attr('data-anim', 'flipdown');
                return true
            }
        }
        if (cardFace === "guard") {
            if (!targetCard) {
                $(".target-cards").attr('data-anim', 'flipdown');
                return true;
            }
        }


        var action = {
            "card": cardFace,
            "targetPlayerUid": targetPlayer,
            "targetCard": targetCard
        }

        socket.emit('play-card', clientUniqueID, action, function(callback) {
            if (callback["success"] === true) {

                targetPlayer = '';
                targetCard = '';

                // Disable card swapping
                $('.box').unbind('click');

                // Player card
                $(".card[data-pos='top']")
                    .attr('data-anim', 'playcard')
                    .attr('data-pos', 'played');

                $(".card[data-pos='bottom']")
                    .attr('data-anim', 'slidemiddle')
            }

            setTimeout(function() {
                $(".card[data-pos='played']").remove();
                $(".card[data-pos='bottom']")
                    .attr('data-pos', 'middle')
            }, 500);
        })

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
            play_card(false, false);
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

var socket_game_state = function(game, player_list) {
    var cards_in_hand = 0;

    if (player_list[clientUniqueID].hasOwnProperty('hand')) {
        cards_in_hand = player_list[clientUniqueID].hand.length;
    }

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

    var playerState = player_list[clientUniqueID];

    if (playerState.outOfRound) {
        status_message('socket_player_list', "I am out of the round.");
        setTimeout(function() {
            $(".banners .banner").html("Out of Round");
            $(".card[data-pos='middle']").attr('data-face', 'back');
            $(".card[data-pos='middle']").attr('data-anim', 'flipOver');
            $(".banners").attr("data-anim", "showBanner").fadeIn();
        }, 2000);
        return true;
    }

    // Update target player list
    var target_player_divs = ''
    target_player_divs += '<div class="target-instruction">Pick an Opponent</div>';

    var all_player_divs = ''
    all_player_divs += '<div class="target-instruction">Pick a Player</div>';

    for (var p in player_list) {
        if (p !== clientUniqueID && !player_list[p].outOfRound) {
            var t = '<div data-player="' + player_list[p].uid + '" class="target-player">' + player_list[p].playerName + '</div>';
            target_player_divs += t;
        }
        if (!player_list[p].outOfRound) {
            var t = '<div data-player="' + player_list[p].uid + '" class="target-player">' + player_list[p].playerName + '</div>';
            all_player_divs += t;
        }
    }
    $(".target-players").html(target_player_divs);
    $(".all-players").html(all_player_divs);

    $('.target-player').click(function() {
        $('.target-players').attr("data-anim", "pressed");
        $('.all-players').attr("data-anim", "pressed");
        targetPlayer = $(this).attr('data-player');
        play_card();
    })

}

var socket_show_hand = function(targetData) {
    $('.opponent-card').attr('data-face', targetData.hand[0]);
    $('.opponent-card').attr('data-anim', 'showopponent');
    setTimeout(function() {
        $('.opponent-card').attr('data-anim', 'none');
    }, 4000);
}

var socket_end_round = function() {
    $(".cards").html("");
    $(".banners").hide();
}

var socket_reload_hand = function() {
    get_hand();
}

var get_hand = function() {
    status_message("player/get_hand", "Retrieving hand from server")
    socket.emit('get-hand', clientUniqueID, function(callback) {
        if (callback["success"] === true) {
            $('.cards').html("");
            var hand = callback["hand"];
            for (var c in hand) {
                show_card(hand[c]);
            }
        }
    });
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
    get_hand()
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

socket.on('game-state', function(game, player_list) {
    socket_game_state(game, player_list);
    return true;
});

socket.on('player-list', function(player_list) {
    socket_player_list(player_list);
    return true;
});

socket.on('end-round', function(player_list) {
    socket_end_round();
    return true;
});

socket.on('show-hand', function(targetData) {
    socket_show_hand(targetData);
});

socket.on('reload-hand', function() {
    socket_reload_hand();
});

////////////////////
// buttons

$('.target-card').click(function() {
    $('.target-cards').attr("data-anim", "pressed");
    targetCard = $(this).attr('data-card');
    play_card()
})

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

$('.debug-get-hand').click(function() {
    get_hand();
})




// forms

$('.ask-player-name').submit(function() {
    playerName = $(".ask-player-name input").val()
    set_player_name();
    return false;
});


$(window).load(function() {});