$('#playername').submit(function(){
  socket.emit('addplayer', $('#p').val());
  $('#topbar').html($('#p').val());
  return false;
});
