/* 
Must include:
Saving and loading the current state of the game using files
File implementation for high scores
A smart AI opponent
 */

/*
  TODO
  * move ship
  * highlighted ship
  * rotate and delete ship

  ! fix bug: when moving a ship over another ship, ship disappears
  * possible solution: save last origin
*/

var shipsTable = Array(10)
  .fill()
  .map(() => Array(10).fill(0));
var shotsTable = Array(10)
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

// set dragged ship on mousedown - from ship menu
var draggedShip, shipPointUnderCursor;
const shipsLi = document.querySelectorAll("#shipMenu ul li");
shipsLi.forEach((i) =>
  i.addEventListener("mousedown", (e) => {
    if (e.target.classList.value != "placed") {
      draggedShip = i.id;

      // set shipPointUnderCursor if ship is not yet placed
      shipPointUnderCursor = 1;
    }
  })
);

// set dragged ship on mousedown - from board; already placed ship
document.body.addEventListener("mousedown", (e) => {
  const shipToMove = e.target.closest(".ship") || 0;
  if (shipToMove) {
    draggedShip = shipToMove.id[0];

    // set shipPointUnderCursor if ship is already placed
    if (shipInfo.orientation[draggedShip] == "h") {
      let cursorPosFromShipOrigin = e.clientX - shipToMove.getBoundingClientRect().left;
      shipPointUnderCursor = Math.ceil(cursorPosFromShipOrigin / shipToMove.getBoundingClientRect().height);
    }

    // if already placed, remove
    const placedShip = document.querySelector(`#board #${draggedShip}Ship`);
    if (placedShip) placedShip.remove();
  }
});

// release dragged ship
var rowUnderCursor, columnUnderCursor;
document.body.addEventListener("mouseup", (e) => {
  const targetInBoard = ((e.target.closest("table") || 0).id || 0) == "board";
  if (!draggedShip || !targetInBoard) return (draggedShip = null);

  // get cell position
  rowUnderCursor = e.target.closest("tr").rowIndex;
  columnUnderCursor = e.target.cellIndex;

  if (isShipNotOverlap()) modifyShips();

  draggedShip = rowUnderCursor = columnUnderCursor = null;
});

var cellOrigin;
function isShipNotOverlap() {
  let notOverlap;
  if (shipInfo.orientation[draggedShip] == "h") {
    // set cell origin
    let firstCell = columnUnderCursor - (shipPointUnderCursor - 1);
    let lastCell = columnUnderCursor + shipLength[draggedShip] - shipPointUnderCursor;
    if (lastCell > 9) {
      cellOrigin = 9 - (shipLength[draggedShip] - 1);
    } else if (firstCell < 0) {
      cellOrigin = 0;
    } else {
      cellOrigin = firstCell;
    }

    // does ship overlap others
    notOverlap = !shipsTable[rowUnderCursor].slice(columnUnderCursor, columnUnderCursor + shipLength[draggedShip]).includes(1);
  }

  return notOverlap;
}

function modifyShips() {
  if (shipInfo.orientation[draggedShip] == "h") {
    for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[rowUnderCursor][cellOrigin + i] = 1;
  }

  if (shipInfo.orientation[draggedShip] == "h") {
    shipInfo.origin[draggedShip] = [rowUnderCursor, cellOrigin];
  }

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

  // console.table(shipsTable);
}
