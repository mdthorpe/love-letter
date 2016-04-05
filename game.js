var Deck = require('./deck').init();

var Clients = require('./clients');
exports.Clients = Clients;

var gameState = {
    "numPlayers": 0,
    "inGame": false,
    "round": 0,
    "turn": 0,
    "gameCount": 0,
    "gameOver": false,
    "activePlayer": null,
    "turnOrder" : [],
}
exports.gameState = gameState;

var nextRound = function() {
    console.log("nextRound");
    gameState.round += 1;
    gameState.turnIndex = 0;

    var players = Clients.getByType("player");

    for ( var p in players ){
        players[p].isActive = false;
    }

    gameState.activePlayer = gameState.turnOrder[0];

}
exports.nextRound = nextRound;

var nextTurn = function() {
    // Is there only one left?
    if ( gameState.turnOrder.length == 1 ){
        console.log("Round is over");
    } else {
        gameState.turnOrder.push(gameState.turnOrder.shift());
        gameState.activePlayer = gameState.turnOrder[0];
    }
}
exports.nextTurn = nextTurn;

var newGame = function(numPlayers) {
    numPlayers = numPlayers || 1;
    gameState.deck = Deck;
    gameState.numPlayers = numPlayers;
    return this;
};
exports.newGame = newGame;

var getInGame = function() {
    return gameState.inGame;
}
exports.getInGame = getInGame;

var startGame = function() {
    console.log("startGame");
    gameState.inGame = true;
    setTurnOrder();
    nextRound();
}
exports.startGame = startGame;

var drawCard = function() {
    return gameState.deck.pop();
}
exports.drawCard = drawCard;


var setTurnOrder = function() {
    // set turn order
    var players = Clients.getByType('player');
    for (var p in players ){
        gameState.turnOrder.push(p);
    }
    console.log("turn order",gameState.turnOrder);
}
