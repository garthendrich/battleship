/* 
Must include:
Saving and loading the current state of the game using files
File implementation for high scores
A smart AI opponent
 */

/*
  TODO
  * move ship
  * selected ship
  * rotate and delete ship
*/

/* 
  TODO - move ship
  * object for specific boat origins and orientation
  * ship point under cursor
*/

let shipsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));
let shotsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));

const shipInfo = {
  origin: {
    c: null,
    b: null,
    d: null,
    s: null,
    p: null,
  },
  orientation: {
    c: "h",
    b: "h",
    d: "h",
    s: "h",
    p: "h",
  },
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
    if (e.target.classList.value != "placed") draggedShip = i.id;
  })
);

// mouseup
let rowUnderCursor, columnUnderCursor;
document.body.addEventListener("mouseup", (e) => {
  const targetInBoard = ((e.target.closest("table") || 0).id || 0) == "board";
  if (!draggedShip || !targetInBoard) return (draggedShip = null);

  // get cell position
  rowUnderCursor = e.target.closest("tr").rowIndex;
  columnUnderCursor = e.target.cellIndex;

  if (isShipNotOverlap()) modifyShips();

  draggedShip = rowUnderCursor = columnUnderCursor = null;
});

let shipPointUnderCursor, cellOrigin;
function isShipNotOverlap() {
  let isShipNotPlaced = !shipInfo.origin[draggedShip];
  if (isShipNotPlaced) shipPointUnderCursor = 1;

  let notOverlap;
  if (shipInfo.orientation[draggedShip] == "h") {
    // set cell starting point
    columnUnderCursor + shipLength[draggedShip] - shipPointUnderCursor > 9 // does ship extend outside board
      ? (cellOrigin = 9 - (shipLength[draggedShip] - 1))
      : (cellOrigin = columnUnderCursor);

    // does ship overlap others
    notOverlap = !shipsTable[rowUnderCursor].slice(columnUnderCursor, columnUnderCursor + shipLength[draggedShip]).includes(1);
  }

  return notOverlap;
}

function modifyShips() {
  if (shipInfo.orientation[draggedShip] == "h") {
    for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[rowUnderCursor][cellOrigin + i] = 1;
  }

  shipInfo.origin[draggedShip] = cellOrigin;

  const shipObj = document.createElement("div");
  shipObj.classList.add("ship");
  shipObj.setAttribute("id", draggedShip + "Ship");

  let cellOriginObj;
  if (shipInfo.orientation[draggedShip] == "h") {
    cellOriginObj = document.querySelector(`#board tr:nth-child(${rowUnderCursor + 1}) td:nth-child(${cellOrigin + 1})`);
  }
  cellOriginObj.append(shipObj);

  menuShip = document.querySelector("#shipMenu #" + draggedShip);
  menuShip.classList.add("placed");

  console.table(shipsTable);
}
