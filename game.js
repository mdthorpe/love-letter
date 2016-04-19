var Deck = require('./deck');
exports.Deck = Deck;

var Clients = require('./clients');
exports.Clients = Clients;

var gameState = {
    "numPlayers": 0,
    "maxWins": 0,
    "inGame": false,
    "round": 0,
    "turn": 0,
    "gameOver": false,
    "activePlayer": null,
    "roundWinner": null,
    "gameWinner": null,
    "turnOrder": [],
    "startingTurnOrder": [],
}
exports.gameState = gameState;

var startRound = function() {
    gameState.round += 1;
    gameState.turnIndex = 0;
    gameState.roundWinner = null;
    gameState.deck = Deck.new();

    var players = Clients.getByType("player");

    for (var p in players) {
        players[p].isActive = false;
    }

    gameState.turnOrder = Array.from(gameState.startingTurnOrder);
    gameState.activePlayer = gameState.turnOrder[0];

}
exports.startRound = startRound;

var endRound = function() {
    var players = Clients.getByType("player");

    for (var p in players) {
        players[p].hand = [];
        players[p].protected = false;
        players[p].outOfRound = false;
    }
}
exports.endRound = endRound;


var nextTurn = function() {

    var winner = false;

    // Is there only one player left?
    if (gameState.turnOrder.length == 1) {
        winner = Clients.getByUid(gameState.turnOrder[0])
    }

    // if there are no cards in the deck. The player
    // with the highest card value wins.
    // 
    if (gameState.deck.length === 0) {
        winner = findWinner();
    }

    if (winner) {
        winner.wins += 1;
        Clients.updateByUid(winner.uid, 'wins', winner.wins);
        gameState.roundWinner = winner.uid;
        if (winner.wins === gameState.maxWins) {
            gameState.gameWinner = winner.uid;
        }
        return false
    } else {
        gameState.turnOrder.push(gameState.turnOrder.shift());
        gameState.activePlayer = gameState.turnOrder[0];
        Clients.updateByUid(gameState.turnOrder[0], 'protected', false);
        return true
    }
}
exports.nextTurn = nextTurn;

var findWinner = function() {
    
    var winner = false;
    var players = Clients.getByType("player");

    for (var p in players) {
        if (!players[p].outOfRound) {
            if (winner.hasOwnProperty('hand')) {
                if(winner.hand[0].value < players[p].hand[0].value){
                    winner = players[p];
                }
            } else {
                winner = players[p];
            }
        }
    }

    return winner;
}

var getInGame = function() {
    return gameState.inGame;
}
exports.getInGame = getInGame;

var startGame = function() {
    gameState.inGame = true;
    setTurnOrder();
}
exports.startGame = startGame;

var drawCard = function() {
    return gameState.deck.pop();
}
exports.drawCard = drawCard;

var removeFromRound = function(uid) {
    for (var t in gameState.turnOrder) {
        if (gameState.turnOrder[t] === uid) {
            gameState.turnOrder.splice(t, 1);
        }
    }
    console.log("removeFromRound:", gameState.turnOrder);
}
exports.removeFromRound = removeFromRound;

var setTurnOrder = function() {
    // set turn order
    var players = Clients.getByType('player');
    for (var p in players) {
        gameState.turnOrder.push(p);
        gameState.startingTurnOrder.push(p);
    }
    console.log("setTurnOrder:", gameState.turnOrder);
}

var newGame = function(numPlayers, maxWins) {
    numPlayers = numPlayers || 1;
    gameState.deck = Deck.new();
    gameState.numPlayers = numPlayers;
    gameState.maxWins = maxWins;
    return this;
};
exports.newGame = newGame;