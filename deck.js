var cards = [{
    "name": "princess",
    "value": 8,
    //"count": 1,
    "count": 0,
}, {
    "name": "countess",
    "value": 7,
    //"count": 1,
    "count": 0,

}, {
    "name": "king",
    "value": 6,
    //"count": 1,
    "count": 0,

}, {
    "name": "prince",
    "value": 5,
    //"count": 2,
    "count": 0,

}, {
    "name": "handmaid",
    "value": 4,
    //"count": 2,
    "count": 8,

}, {
    "name": "baron",
    "value": 3,
    //"count": 2,
    "count": 0,

}, {
    "name": "priest",
    "value": 2,
    // "count": 2,
    "count": 0,

}, {
    "name": "guard",
    "value": 1,
    // "count": 5,
    "count": 0,
}]

function new_deck() {
    var deck = [];
    for (card in cards) {
        for (var i = 0; i < cards[card].count; i++) {
            deck.push(cards[card]["name"]);
        }
    }
    return deck;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

exports.new = function(init) {
    var deck = new_deck()
    deck = shuffle(deck);
    return deck;
};

exports.getCardByName = function(name) {
    for (c in cards) {
        if ( cards[c].name === name) {
            return cards[c];
        }
    }
    return 0;
}
