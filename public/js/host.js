"use strict";

var join_as_host = function() {
  /*jshint -W117 */
  socket.emit('addhost', function (players){
    if(players){
      update_player_list(players);
      update_connected(players);
      update_ready(players);
      status_message("SYSTEM","Host Ready");
    }else
      status_message("SYSTEM","Host Failure");
    } );
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

var update_ready = function (players) {
  var count = function () {

    var counter= 0;
    for(var p in this){
      if(this[p].hasOwnProperty("ready") &&
         this[p].ready === true)++counter;
    }
    return counter;
  };
  $("#ready-players").text(count.call(players));
};

var update_connected = function (players) {
  var count = function (){
    var counter= 0;
    for(var p in this){
        if(this.hasOwnProperty(p))++counter;
    }
    return counter;
  };
  $("#connected-players").text(count.call(players));
};

// Host events
//
socket.on('player-list', function (players) {
  update_player_list(players);
  update_connected(players);
  update_ready(players);
  return false;
});

$( document ).ready(function() {
  join_as_host(); 
});