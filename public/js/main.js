"use strict";

/*jshint -W117 */
/*jshint -W079 */ 

var socket = io();

// status_messages
var status_message = function(player, msg) {
  var txt = '<b>' + player + '</b>: ' + msg;
  $("#messages").prepend($('<li>').html(txt));
};

socket.on('status-message', status_message);

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