var socket = io();

$('#playername').submit(function(){
  socket.emit('addplayer', $('#p').val());
  $('#topbar').html($('#p').val());
  return false;
});

// handle incomming messages
socket.on('statusmessage', function(player, msg) {
  var txt = player + ': ' + msg;
  $("#messages").append($('<li>').text(txt));
});