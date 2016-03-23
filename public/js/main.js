"use strict";

/*jshint -W117 */
/*jshint -W079 */

var socket = io();
var clientUniqueID = "";

// status_messages
var status_message = function(source, msg) {
    var timestamp = moment().format("HH:MM:ss\.SSS");
    var txt = '[' + timestamp + '] ' + msg + '<div style="float:right; color: #999">' + source + '</div>';
    $("#messages ul").prepend($('<li>').html(txt));
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
            "clientType": ClientType
        }

        socket.emit('register', data, function(callback) {
            if (callback === true) {
                status_message('main/socket/connect', "Registered with game server as: " + clientUniqueID);
                if (typeof(restore_session) === typeof(Function)) {
                    restore_session();
                }
            }
        });
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