"use strict";

/*jshint -W117 */
/*jshint -W079 */

var socket = io();
var clientUniqueID = "";

// status_messages
var status_message = function(player, msg) {
    var txt = '<b>' + player + '</b>: ' + msg;
    $("#messages").prepend($('<li>').html(txt));
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
        status_message('SYSTEM', 'Found clientUniqueID: ' + uuid);
    } else {
        uuid = generateUUID();
        sessionStorage.setItem('clientUniqueID', uuid)
        status_message('SYSTEM', 'Registering clientUniqueID: ' + uuid);
    }
    return uuid;
}

socket.on('status-message', status_message);

// Server States
//
socket.on('connect', function() {
    status_message('SYSTEM', 'Socket Connected');
    console.log("ClientType:", ClientType);
    clientUniqueID = registerConnection();
    if (clientUniqueID) {
        console.log("Registering with game server", clientUniqueID);
        socket.emit('register', {
            "clientUniqueID": clientUniqueID,
            "clientType": ClientType
        })
    }
});

socket.on('disconnect', function() {
    status_message('SYSTEM', 'disconnected, waiting for reconnect');
});

socket.on('reconnect', function() {
    status_message('SYSTEM', 'connection ok');
});

socket.on('reconnecting', function(nextRetry) {
    status_message('SYSTEM', 'trying to reconnect. nextRetry: ' + nextRetry);
});

socket.on('reconnect_failed', function() {
    status_message('SYSTEM', "Reconnect failed");
});