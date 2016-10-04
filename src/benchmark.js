var Evaluator = require('./index.js');
var e = new Evaluator();
var Combinatorics = require('js-combinatorics');

var r = Object.keys(Evaluator.ranks).map(function (rank) {
	return Evaluator.ranks[rank];
});
var s = Object.keys(Evaluator.suits).map(function (suit) {
	return Evaluator.suits[suit];
});

var cards = Combinatorics.cartesianProduct(r, s).toArray();

var hands = Combinatorics.bigCombination(cards, 5).toArray();

var hands = hands.map(function (combo) {
	return combo.reduce(function (val, card) {
		return val * card[0];
	}, 1) | combo.reduce(function (val, card) {
		return val | card[1];
	}, 0);
});

var start = Date.now();

hands.forEach(function (handValue) {
	e.getRelativeHandRank(handValue);
});

var duration = Date.now() - start;

console.log("HAND COUNT", hands.length)
console.log("TIME (ms)", duration);
console.log(Math.round(hands.length / duration) / 1000 +" million evaluations / sec");