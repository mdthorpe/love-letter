var Clients = {}
exports.Clients;

exports.init = function(init) {
    return self;
}

exports.updateByUid = function(uid, prop, val) {
    Clients[uid][prop] = val;
    return true;
}

exports.getByUid = function(uid) {
    if (Clients[uid]) {
        return Clients[uid]
    } else {
        return false
    }
}

exports.getByType = function(t) {
	var r = {};
    for (c in Clients) {
        if (Clients[c].hasOwnProperty('clientType')) {
        	if (Clients[c].clientType == t){
        		r[c] = Clients[c];
        	}
        }
    }
    return r;
}

exports.getBySocketId = function(socketId) {
    for (c in Clients) {
        if (Clients[c].hasOwnProperty('socketId')) {
        	if (Clients[c].socketId === socketId){
	        	return Clients[c]
	        }
        }
    }
    return false;
}

exports.addClient = function(uid, clientType) {
    if (uid in Clients) {
        return Clients[uid]
    } else {
        Clients[uid] = {
        	"uid": uid,
        	"clientType" : clientType,
            "connected": false
        }
    }
    return false
}

exports.setConnected = function(uid, socketId) {
    Clients[uid].connected = true;
    Clients[uid].socketId = socketId;
}

exports.setDisconnected = function(uid) {
    Clients[uid].connected = false;
    Clients[uid].socketId = undefined;
}