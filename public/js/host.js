"use strict";

var join_as_host = function() {
  /*jshint -W117 */
  socket.emit('addhost', function (players){
    if(players){
      update_host_view(players);
      status_message("SYSTEM","Host Ready");
    }else
      status_message("SYSTEM","Host Failure");
    });
};

var update_player_list = function (players) {
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

var count_ready_players = function (players) {
  var counter= 0;
  for(var p in this){
    if(this[p].hasOwnProperty("ready") &&
       this[p].ready === true)++counter;
  }
  return counter;
};

var count_connected_players = function (players) {
  var counter= 0;
  for(var p in this){
    if(this.hasOwnProperty(p))++counter;
  }
  return counter;
}

var update_ready = function (players) {
  $("#ready-players").text(count_ready_players.call(players));
};

var update_connected = function (players) {
  $("#connected-players").text(count_connected_players.call(players));
};

var update_host_view = function (players) {
  update_player_list(players);
  update_connected(players);
  update_ready(players);
  if ( count_ready_players.call(players) === 
    parseInt($("#total-players").text()) ) { 
    status_message('HOST', 'All players ready'); 
    socket.emit('start-game');
  } 
}

// Host events
//
socket.on('player-list', function (players) {
  update_host_view(players);
  return false;
});

$( document ).ready(function() {
  join_as_host(); 
});