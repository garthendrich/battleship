// Must include:
// Saving and loading the current state of the game using files
// File implementation for high scores
// A smart AI opponent

let shipsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));
let shotsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));

// set selected ship on mousedown
let selectedShip;
const shipsLi = document.querySelectorAll("#ships ul li");
shipsLi.forEach((i) =>
  i.addEventListener("mousedown", (e) => {
    selectedShip = i.id;
  })
);

// mouseup
let rowBelowCursor, columnBelowCursor;
document.body.addEventListener("mouseup", ({ target: cellBelowCursor }) => {
  // check cell position
  rowBelowCursor = cellBelowCursor.closest("tr").rowIndex;
  columnBelowCursor = cellBelowCursor.cellIndex;

  console.log(selectedShip, rowBelowCursor, columnBelowCursor);
  selectedShip = null; // reset
});
