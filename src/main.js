/* 
Must include:
Saving and loading the current state of the game using files
File implementation for high scores
A smart AI opponent
 */

let shipsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));
let shotsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));

const isPlaced = {
  c: 0,
  b: 0,
  d: 0,
  s: 0,
  p: 0,
};

const shipLength = {
  c: 5,
  b: 4,
  d: 3,
  s: 3,
  p: 2,
};

// set dragged ship on mousedown
let draggedShip;
const shipsLi = document.querySelectorAll("#shipMenu ul li");
shipsLi.forEach((i) =>
  i.addEventListener("mousedown", (e) => {
    draggedShip = i.id;
  })
);

// mouseup
let rowBelowCursor, columnBelowCursor;
document.body.addEventListener("mouseup", ({ target: cellBelowCursor }) => {
  const targetInBoard = ((cellBelowCursor.closest("table") || 0).id || 0) == "board";
  if (!draggedShip || !targetInBoard) return;

  // check cell position
  rowBelowCursor = cellBelowCursor.closest("tr").rowIndex;
  columnBelowCursor = cellBelowCursor.cellIndex;

  if (isModifyShipAllowed()) modifyShips(cellBelowCursor);

  draggedShip = rowBelowCursor = columnBelowCursor = null; // reset
});

function isModifyShipAllowed() {
  // is ship already placed - horizontal check
  let isShipOverlap = shipsTable[rowBelowCursor]
    .slice(columnBelowCursor, columnBelowCursor + shipLength[draggedShip])
    .includes(1);

  return !isPlaced[draggedShip] && !isShipOverlap;
}

function modifyShips(cell) {
  let startingPoint;

  // add ship horizontally
  shipLength[draggedShip] - 1 + columnBelowCursor > 9 // does ship extend outside board
    ? (startingPoint = 9 - (shipLength[draggedShip] - 1))
    : (startingPoint = columnBelowCursor);
  for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[rowBelowCursor][startingPoint + i] = 1;

  isPlaced[draggedShip] = 1;

  ship = document.createElement("div");
  ship.classList.add("ship");
  // ship.className += " ship"; // * Backup class adder
  ship.setAttribute("id", draggedShip + "Ship");
  cell.append(ship);

  console.table(shipsTable);
}
