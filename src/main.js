/*
 * Must include:
 * Saving and loading the current state of the game using files
 * File implementation for high scores
 * A smart AI opponent
 */

/*
  TODO
  * highlighted ship
  * rotate and delete ship
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
var prevCellOrigin;
document.body.addEventListener("mousedown", (e) => {
  const shipToMove = e.target.closest(".ship") || 0;
  if (shipToMove) {
    draggedShip = shipToMove.id[0];

    // set shipPointUnderCursor if ship is already placed
    if (shipInfo.orientation[draggedShip] == "h") {
      let cursorPosFromShipOrigin = e.clientX - shipToMove.getBoundingClientRect().left;
      shipPointUnderCursor = Math.ceil(cursorPosFromShipOrigin / shipToMove.getBoundingClientRect().height);

      prevCellOrigin = shipInfo.origin[draggedShip];
    }

    removeShip(prevCellOrigin);
  }
});

function removeShip([row, column]) {
  const placedShip = document.querySelector(`#board #${draggedShip}Ship`);
  placedShip.remove();

  if (shipInfo.orientation[draggedShip] == "h") {
    for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[row][column + i] = 0;
  }
}

// release dragged ship
var rowUnderCursor, columnUnderCursor;
document.body.addEventListener("mouseup", (e) => {
  if (!draggedShip) return;

  const targetInBoard = ((e.target.closest("table") || 0).id || 0) == "board";
  if (!targetInBoard) {
    if (prevCellOrigin) modifyShips(prevCellOrigin);
    draggedShip = prevCellOrigin = null;
    return;
  }

  // get cell position
  rowUnderCursor = e.target.closest("tr").rowIndex;
  columnUnderCursor = e.target.cellIndex;

  getCellOrigin();

  isShipNotOverlap() && e.target.classList.value != "ship" ? modifyShips(cellOrigin) : modifyShips(prevCellOrigin);

  draggedShip = rowUnderCursor = columnUnderCursor = prevCellOrigin = null;
});

function getCellOrigin() {
  if (shipInfo.orientation[draggedShip] == "h") {
    let firstCell = columnUnderCursor - (shipPointUnderCursor - 1);
    let lastCell = columnUnderCursor + shipLength[draggedShip] - shipPointUnderCursor;
    if (lastCell > 9) {
      cellOrigin = [rowUnderCursor, 9 - (shipLength[draggedShip] - 1)];
    } else if (firstCell < 0) {
      cellOrigin = [rowUnderCursor, 0];
    } else {
      cellOrigin = [rowUnderCursor, firstCell];
    }
  }
}

var cellOrigin;
function isShipNotOverlap() {
  if (shipInfo.orientation[draggedShip] == "h") {
    return !shipsTable[rowUnderCursor].slice(cellOrigin[1], cellOrigin[1] + shipLength[draggedShip]).includes(1);
  }
}

function modifyShips([row, column]) {
  if (shipInfo.orientation[draggedShip] == "h") {
    for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[row][column + i] = 1;

    shipInfo.origin[draggedShip] = [row, column];
  }

  const shipObj = document.createElement("div");
  shipObj.classList.add("ship");
  shipObj.setAttribute("id", draggedShip + "Ship");

  let cellOriginObj;
  if (shipInfo.orientation[draggedShip] == "h") {
    cellOriginObj = document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${column + 1})`);
  }
  cellOriginObj.append(shipObj);

  menuShip = document.querySelector("#shipMenu #" + draggedShip);
  menuShip.classList.add("placed");

  console.table(shipsTable);
}
