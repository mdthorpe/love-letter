"use strict";

var join_as_host = function() {
  socket.emit('addhost', function (connected){
    if(connected === true){
      status_message("SYSTEM","Host Ready");
    }else
      status_message("SYSTEM","Host Failure");
    } );
};

var update_player_list = function (players) {
  $("#players").html('');
  for (var player in players) {
    $("#players").append($('<li>').text(players[player]));
  }
};

// Host events
socket.on('player-list', update_player_list);

$( document ).ready(function() {
  join_as_host(); 
});