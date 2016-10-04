var perfect = require('perfect');

var ranks = {
	"2": 2,
	"3": 3,
	"4": 5,
	"5": 7,
	"6": 11,
	"7": 13,
	"8": 17,
	"9": 19,
	"T": 23,
	"J": 29,
	"Q": 31,
	"K": 37,
	"A": 41
};

var suits = {
	"c": 1 << 27,
	"d": 1 << 28,
	"h": 1 << 29,
	"s": 1 << 30
};

function makeSets (input, size){
	var results = [], result, mask, i, total = Math.pow(2, input.length);
	for(mask = size; mask < total; mask++){
		result = [];
		i = input.length - 1; 
		do{
			if( (mask & (1 << i)) !== 0){
				result.push(input[i]);
			}
		}while(i--);
		if( result.length === size){
			results.push(result);
		}
	}

	return results; 
}

function Evaluator () {
	this.initLookup();
	return this;
};

Evaluator.prototype.calculateHandKey = function(hand) {
	var i = hand.reduce(function (val, card) {
		val.ranks *= ranks[card.rank];
		val.suits |= suits[card.suit];
		return val;
	}, {ranks: 1, suits: 0});
	return i.suits | i.ranks;
};

Evaluator.prototype.isFlush = function(handKey) {
	var i = handKey & 0x78000000;
	return 0 === (i & (i-1));
};

Evaluator.prototype.initLookup = function() {
	var ranksArray = Object.keys(ranks).reverse();

	var straights = [];

	for (var i = 0; i <= 9; i++) {
		var cards = ranksArray.slice(i, i+5);
		if (4 === cards.length) {
			cards.push('A');
		}
		straights.push(cards);
	};

	var straightsString = straights.map((el) => el.slice(0).sort().join(''));

	var nonPairs = makeSets(ranksArray.slice().reverse(), 5).filter(function (set) {
		return -1 === straightsString.indexOf(set.slice(0).sort().join(''));
	}).reverse();

	var quads = [];

	ranksArray.map(function (quadRank) {
		ranksArray.filter(function (otherRank) {
			return quadRank !== otherRank;
		}).map(function (otherRank) {
			quads.push([quadRank, quadRank, quadRank, quadRank, otherRank]);
		});
	});

	var boats = [];

	ranksArray.map(function (setRank) {
		ranksArray.filter(function (pairRank) {
			return setRank !== pairRank;
		}).map(function (pairRank) {
			boats.push([setRank, setRank, setRank, pairRank, pairRank]);
		});
	});

	var sets = [];

	ranksArray.map(function (setRank) {
		ranksArray.filter(function (otherRank1) {
			return setRank !== otherRank1;
		}).map(function (otherRank1) {
			ranksArray.filter(function (otherRank2) {
				return setRank !== otherRank2 && ranksArray.indexOf(otherRank1) < ranksArray.indexOf(otherRank2);
			}).map(function (otherRank2) {
				sets.push([setRank, setRank, setRank, otherRank1, otherRank2]);
			});
		});
	});

	var twoPairs = [];

	ranksArray.map(function (pairRank1) {
		ranksArray.filter(function (pairRank2) {
			return ranksArray.indexOf(pairRank1) < ranksArray.indexOf(pairRank2);
		}).map(function (pairRank2) {
			ranksArray.filter(function (otherRank) {
				return pairRank1 !== otherRank && pairRank2 !== otherRank;
			}).map(function (otherRank) {
				twoPairs.push([pairRank1, pairRank1, pairRank2, pairRank2, otherRank]);
			});
		});
	});

	var onePairs = [];

	ranksArray.map(function (pairRank) {
		ranksArray.filter(function (otherRank1) {
			return pairRank !== otherRank1;
		}).map(function (otherRank1) {
			ranksArray.filter(function (otherRank2) {
				return otherRank2 !== pairRank && ranksArray.indexOf(otherRank1) < ranksArray.indexOf(otherRank2);
			}).map(function (otherRank2) {
				ranksArray.filter(function (otherRank3) {
					return otherRank3 !== pairRank && ranksArray.indexOf(otherRank2) < ranksArray.indexOf(otherRank3);
				}).map(function (otherRank3) {
					onePairs.push([pairRank, pairRank, otherRank1, otherRank2, otherRank3]);
				});
			});
		});
	});

	var allRanks = 
	straights
	.concat(quads)
	.concat(boats)
	.concat(nonPairs)
	.concat(straights)
	.concat(sets)
	.concat(twoPairs)
	.concat(onePairs)
	.concat(nonPairs);

	function hasDuplicates(array) {
		var valuesSoFar = Object.create(null);
		for (var i = 0; i < array.length; ++i) {
			var value = array[i];
			if (value in valuesSoFar) {
				return true;
			}
			valuesSoFar[value] = true;
		}
		return false;
	}

	allRanks = allRanks.map(function (combination, i) {
		return {
			hasPair: hasDuplicates(combination),
			value: combination.reduce(function (cur, val) {
				return cur * ranks[val];
			}, 1),
			rank: i+1
		}
	});

	var nonFlushes = {};
	var flushes = {};

	allRanks.forEach(function (combination, i) {
		if (i > 1598 || combination.hasPair) {
			nonFlushes[combination.value] = combination.rank;
		} else {
			flushes[combination.value] = combination.rank;
		}
	});

	this.nonFlushes = perfect.create(nonFlushes);

	this.flushes = perfect.create(flushes);
};

Evaluator.prototype.getRelativeHandRank = function(key) {
	var type = this.isFlush(key) ? 'flushes' : 'nonFlushes';
	return perfect.lookup(this[type][0], this[type][1], (key & 0x7FFFFFF)+'');
};

module.exports = Evaluator;

module.exports.ranks = ranks;

module.exports.suits = suits;