var Clients = {}

var updateByUID = function(uid, prop, val) {
    Clients[uid][prop] = val;
    return true;
}

exports.init = function(init) {
    return self;
}

exports.getByUID = function(uid) {
    if (Clients[uid]) {
        return Clients[uid]
    } else {
        return false
    }
}

exports.getBySocketId = function(socket_id) {
    for (c in Clients) {
        if (Clients[c].hasOwnProperty('socket_id')) {

        }
    }
    return false;
}

exports.addClient = function(uid, clientType) {
    if (uid in Clients) {
        return Clients[uid]
    } else {
        Clients[uid] = {
        	"client_type" : clientType,
            "connected": false
        }
    }
    return false
}

exports.setConnected = function(uid, socket_id) {
    Clients[uid].connected = true;
    Clients[uid].socket_id = socket_id;
}

exports.setDisconnected = function(uid) {
    Clients[uid].connected = false;
    Clients[uid].socket_id = null;
}