# Poker hand evaluator

Check out src/benchmark.js for usage information. This implementation is not as fast as other solutions out there since the main focus was to minimize memory usage while still getting a decent performance.

Comparing https://github.com/chenosaurus/poker-evaluator, I get about a half the performance while using lookup tables < 1MB size compared to [124 MB](https://github.com/chenosaurus/poker-evaluator/blob/master/data/HandRanks.dat)
