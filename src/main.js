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

// set dragged ship on mousedown
let draggedShip;
const shipsLi = document.querySelectorAll("#ships ul li");
shipsLi.forEach((i) =>
  i.addEventListener("mousedown", (e) => {
    draggedShip = i.id;
  })
);

// mouseup
let rowBelowCursor, columnBelowCursor;
document.body.addEventListener("mouseup", ({ target: cellBelowCursor }) => {
  // check cell position
  const targetInBoard = ((cellBelowCursor.closest("table") || 0).id || 0) == "board";
  if (draggedShip && targetInBoard) {
    rowBelowCursor = cellBelowCursor.closest("tr").rowIndex;
    columnBelowCursor = cellBelowCursor.cellIndex;
  } else {
    rowBelowCursor = columnBelowCursor = null;
  }

  console.log(draggedShip, rowBelowCursor, columnBelowCursor);
  draggedShip = null; // reset
});
