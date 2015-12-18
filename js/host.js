var socket = io();

var host_status = function (msg) {
  $("#host-status").text(msg); 
};

var socket_status = function (msg) {
    $("#server-status").text(msg); 
}

var join_as_host = function() {
  socket.emit('addhost', host_status);
};

var status_message = function(player, msg) {
  var txt = player + ': ' + msg;
  $("#messages").append($('<li>').text(txt));
};

$( document ).ready(function() {
  join_as_host();
});

socket.on('statusmessage', status_message);


// Server States
socket.on('connect', function() {
  socket_status('connected');
} ); 

socket.on('disconnect', function() {
  socket_status('disconnected, waiting for reconnect');
} ); 

socket.on('reconnect', function() {
  socket_status('connection ok');
} ); 

socket.on('reconnecting', function(nextRetry) {
  socket_status('trying to reconnect. nextRetry: ' +nextRetry);
} ); 

socket.on('reconnect_failed', function() { 
  socket_status("Reconnect failed"); 
});

