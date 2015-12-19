var socket = io();

var join_as_host = function() {
  socket.emit('addhost', function (connected){
    if(connected == true){
      status_message("SYSTEM","Host Ready");
    }else
      status_message("SYSTEM","Host Failure");
    }
)};

var status_message = function(player, msg) {
  var txt = player + ': ' + msg;
  $("#messages").prepend($('<li>').text(txt));
};

var update_player_list = function (players) {
  console.log(players);
  $("#players").html('');
  for (var player in players) {
    $("#players").append($('<li>').text(players[player]));
  }
}

$( document ).ready(function() {
  join_as_host();
});

// Host events
//
socket.on('statusmessage', status_message);
socket.on('playerlist', update_player_list);

// Server States
//
socket.on('connect', function() {
  status_message('SYSTEM','Socket Connected');
} ); 

socket.on('disconnect', function() {
  status_message('SYSTEM','disconnected, waiting for reconnect');
} ); 

socket.on('reconnect', function() {
  status_message('SYSTEM','connection ok');
} ); 

socket.on('reconnecting', function(nextRetry) {
  status_message('SYSTEM','trying to reconnect. nextRetry: ' +nextRetry);
} ); 

socket.on('reconnect_failed', function() { 
  status_message('SYSTEM',"Reconnect failed"); 
});

