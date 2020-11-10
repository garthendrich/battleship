// Must include:
// Saving and loading the current state of the game using files
// File implementation for high scores
// A smart AI opponent

let ships = Array(10)
  .fill()
  .map(() => Array(10).fill(0));
let shots = Array(10)
  .fill()
  .map(() => Array(10).fill(0));

console.table(ships);
console.table(shots);
