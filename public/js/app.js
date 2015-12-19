var socket = io();

// status_messages
var status_message = function(player, msg) {
  var txt = '<b>' + player + '</b>: ' + msg;
  $("#messages").prepend($('<li>').html(txt));
};

socket.on('statusmessage', status_message);