//var Listeners = require('./clients');
//var Players = require('./clients');
//var Hosts = require('./clients');
var Deck = require('./deck');

//exports.Listeners = Listeners;
//exports.Players = Players;
//exports.Hosts = Hosts;

var Clients = require('./clients');
exports.Clients = Clients;

var gameState = {
    "total_players": 0,
    "in_game": false,
    "round": 1,
    "turn": 1,
    "game_count": 1,
    "game_over": false,
    "winner": null,
    "active_player": null,
    "turn_phase": 0, // 0,draw 1,play 2,end
}
exports.gameState = gameState;

var nextRound = function() {
    gameState.round++;
}
exports.nextRound = nextRound;

var newGame = function(total_players) {
    total_players = total_players || 1;
    gameState.deck = Deck;
    gameState.total_players = total_players;
    return this;
};
exports.newGame = newGame;