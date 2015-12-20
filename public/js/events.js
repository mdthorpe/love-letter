"use strict";

var join_as_event_listener = function() {
  socket.emit('addlistener', function (connected){
    if(connected === true){
        $("#events").prepend($('<li>')
            .html("<b>--- Event Listener Ready ---</b>"));
    }else
        $("#events").prepend($('<li>')
            .html("<b>--- Event Listener Failed to Connect ---</b>"));
    });
};

var add_event = function(msg) {
    var txt = '';
    var timestamp = moment().format("YYYY-MM-DD HH:MM:ss\.SSSZ");
    var source = 'unknown';

    if (msg.hasOwnProperty('timestamp')) {
        timestamp = msg.timestamp;
        delete msg.timestamp;
    }

    if (msg.hasOwnProperty('source')) {
        source = msg.source;
        delete msg.source;
    }

    txt = '[' + timestamp + '] ' +
          '[' + source + '] ' +
          JSON.stringify(msg);

    $("#events").prepend($('<li>').text(txt));
};

$( document ).ready(function() {
  join_as_event_listener(); 
  socket.on('event', add_event);
});