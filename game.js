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
    "activePlayer": null
}
exports.gameState = gameState;

var nextRound = function() {
    console.log("nextRound");
    gameState.round = gameState.round + 1;

    var players = Clients.getByType("player");

    for ( p in players ){
        players[p].isActive = false;
        Clients.updateByUid(p,"isTurn",false);
    }

    for ( p in players ){
        console.log("Player: ", players[p]);
        // Make first player active
        if (players[p].outOfRound === false){
            gameState.activePlayer = p;
            players[p].isActive = true;
            Clients.updateByUid(p,"isTurn",true);
            break;
        }
    }
}
exports.nextRound = nextRound;

var nextTurn = function() {
    gameState.turn = gameState.turn + 1;
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
    nextRound();
    nextTurn();
}
exports.startGame = startGame;

var drawCard = function() {
    return gameState.deck.pop();
}
exports.drawCard = drawCard;