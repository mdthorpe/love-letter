$('#set-playername').submit(function(){
  socket.emit('addplayer', $('#p').val());
  $('#playername').html($('#p').val());
  $('#set-playername').hide();
  $('#playername').show();
  $('#playerready').show();
  return false;
});
