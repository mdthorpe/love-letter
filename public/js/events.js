"use strict";

var clientType = "listener";

var add_event = function(msg) {
    var txt = '';
    var timestamp = moment().format("YYYY-MM-DD HH:MM:ss\.SSS");
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
          JSON.stringify(msg, undefined, 1);

    $(".events").prepend($('<li>').text(txt));
};

$( document ).ready(function() {
  socket.on('event', add_event);
});