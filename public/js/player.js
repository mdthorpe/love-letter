"use strict";

var player_ready = false;

var add_player = function () {
    socket.emit('addplayer', $('#p').val(), function (connected) {
        if(connected === true){
          status_message("SYSTEM","Host Ready");
        }else
          status_message("SYSTEM","Host Failure");
        }); 

    $('#set-player-name').hide();
    return false;
};

var show_player_name = function () {
    $('#player-name').html($('#p').val()).show();
    return false;
};

var ask_player_ready = function () {
    $('#player-ready').show();
    return false;
};

var set_ready = function () {
    socket.emit('player-ready', function (callback) {
        if(callback === true){
          status_message("player","Player Ready");
        }else
          status_message("player","Failed to set Ready");
        });     

    $('#player-name')
        .addClass('player-is-ready');
    $('#player-ready :button')
        .addClass('disable-actions')
        .text('Waiting..');   
    return false;
};

$('#set-player-name').submit(function (){
    add_player();
    show_player_name();
    ask_player_ready();
    return false;
});
