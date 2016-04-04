"use strict";

/*jshint -W117 */
/*jshint -W079 */

var socket = io();
var clientUniqueID = "";

// status_messages
var status_message = function(source, msg) {
    var timestamp = moment().format("HH:MM:ss\.SSS");
    var txt = '[' + timestamp + '] ' + msg + '<div class="message-source">' + source + '</div>';
    $("#messages-list").prepend($('<li>').html(txt));
};

// ID functions
//
var generateUUID = function() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

var registerConnection = function() {
    var uuid = sessionStorage.getItem('clientUniqueID')
    if (uuid) {
        status_message('main/registerConnection', 'Found clientUniqueID: ' + uuid);
    } else {
        uuid = generateUUID();
        sessionStorage.setItem('clientUniqueID', uuid)
        status_message('main/registerConnection', 'Registering clientUniqueID: ' + uuid);
    }
    return uuid;
}

socket.on('status-message', status_message);

// Server States
//

socket.on('connect', function() {
    status_message('main/socket/connect', 'Socket Connected. Attempting to register.');

    clientUniqueID = registerConnection();
    if (clientUniqueID) {
        var data = {
            "clientUniqueID": clientUniqueID,
            "clientType": clientType
        }

        socket.emit('register', data, function(callback) {
            if (callback === true) {
                status_message('main/socket/connect', "Registered with game server as: " + clientUniqueID);
                if (typeof(restore_session) === typeof(Function)) {
                    restore_session();
                }
            }
        });

        if (clientType === "host"){
        	socket.emit('send-game-state');
        	socket.emit('send-player-list');
        }
    }
});

socket.on('disconnect', function() {
    status_message('main/disconnet', 'disconnected, waiting for reconnect');
});

socket.on('reconnect', function() {
    status_message('main/reconnect', 'connection ok');
});

socket.on('reconnecting', function(nextRetry) {
    status_message('main/reconnecting', 'trying to reconnect. nextRetry: ' + nextRetry);
});

socket.on('reconnect_failed', function() {
    status_message('main/reconnect_failed', "Reconnect failed");
});

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});