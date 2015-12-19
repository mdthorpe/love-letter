var socket = io();

// handle incomming messages
socket.on('statusmessage', function(player, msg) {
  var txt = '<b>' + player + '</b>: ' + msg;
  $("#messages").append($('<li>').html(txt));
});