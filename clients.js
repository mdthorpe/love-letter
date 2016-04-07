var Clients = {}
exports.Clients;

var isPlayer = function(uid) {
    if (Clients[uid]) {
        if (Clients[uid].hasOwnProperty('clientType')) {
            if (Clients[uid].clientType === "player") {
                return true;
            }
        }
    }
    return false;
}

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
            if (Clients[c].clientType === t) {
                r[c] = Clients[c];
            }
        }
    }
    return r;
}

exports.getBySocketId = function(socketId) {
    for (c in Clients) {
        if (Clients[c].hasOwnProperty('socketId')) {
            if (Clients[c].socketId === socketId) {
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
        var newClient = {};

        if (clientType === "player") {
            var newClient = {
                "uid": uid,
                "clientType": clientType,
                "connected": false,
                "hand": [],
                "winner": false,
                "outOfRound": false,
                "wins": 0,
                "protected": false,
            }
        } else {
            var newClient = {
                "uid": uid,
                "clientType": clientType,
                "connected": false
            }
        }
        Clients[uid] = newClient;
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

// Player only functions.. is this crazy?
exports.addCard = function(uid, card) {
    if (isPlayer(uid)) {
        Clients[uid].hand.push(card);
        return true;
    }
    return false;
}

// Player only functions.. is this crazy?
exports.removeCard = function(uid, card) {
    for (var c in Clients[uid].hand) {
        if (Clients[uid].hand[c] === card) {
            Clients[uid].hand.splice(c, 1);
        }
    }
    return false;
}

exports.hasCard = function(uid, card) {
    for (var c in Clients[uid].hand) {
        console.log("uid, card ", uid, card);
        if (Clients[uid].hand[c] === card) {
            return true;
        }
    }
    return false;
}

exports.getHand = function(uid) {
    if (isPlayer(uid))
        return Clients[uid].hand;
    return false;
}

exports.getPlayerName = function(uid) {
    if (isPlayer(uid))
        return Clients[uid].playerName;
    return false;
}