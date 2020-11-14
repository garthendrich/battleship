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

const runByShipOrientation = (h, v) => (shipInfo.orientation[draggedShip] == "h" ? h() : v());

// set dragged ship on mousedown - from ship menu
var draggedShip, shipPointUnderCursor;
const shipsLi = document.querySelectorAll("#shipMenu ul li");
shipsLi.forEach((elem) =>
  elem.addEventListener("mousedown", (e) => {
    if (e.target.classList.value != "placed") {
      draggedShip = elem.id;

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

    runByShipOrientation(
      () => {
        let cursorPosFromShipOrigin = e.clientX - shipToMove.getBoundingClientRect().left;
        shipPointUnderCursor = Math.ceil(cursorPosFromShipOrigin / shipToMove.getBoundingClientRect().height);

        prevCellOrigin = shipInfo.origin[draggedShip];
      },
      () => {
        // vertical
      }
    );

    removeShip(prevCellOrigin);
  }
});

function removeShip([row, column]) {
  const placedShip = document.querySelector(`#board #${draggedShip}Ship`);
  placedShip.remove();

  runByShipOrientation(
    () => {
      for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[row][column + i] = 0;
    },
    () => {}
  );
}

// release dragged ship
var rowUnderCursor, columnUnderCursor;
document.body.addEventListener("mouseup", (e) => {
  if (!draggedShip) return;

  const isTargetInBoard = ((e.target.closest("table") || 0).id || 0) == "board";
  const isTargetACell = e.target.classList.value != "ship";
  if (!isTargetInBoard || !isTargetACell) {
    if (prevCellOrigin) modifyShips(prevCellOrigin);
    draggedShip = prevCellOrigin = null;
    return;
  }

  // get cell position
  rowUnderCursor = e.target.closest("tr").rowIndex;
  columnUnderCursor = e.target.cellIndex;

  getCellOrigin();

  isShipNotOverlap() ? modifyShips(cellOrigin) : modifyShips(prevCellOrigin);

  draggedShip = rowUnderCursor = columnUnderCursor = prevCellOrigin = null;
});

var cellOrigin;
function getCellOrigin() {
  runByShipOrientation(
    () => {
      let firstCell = columnUnderCursor - (shipPointUnderCursor - 1);
      let lastCell = columnUnderCursor + shipLength[draggedShip] - shipPointUnderCursor;
      if (lastCell > 9) {
        cellOrigin = [rowUnderCursor, 9 - (shipLength[draggedShip] - 1)];
      } else if (firstCell < 0) {
        cellOrigin = [rowUnderCursor, 0];
      } else {
        cellOrigin = [rowUnderCursor, firstCell];
      }
    },
    () => {}
  );
}

function isShipNotOverlap() {
  return runByShipOrientation(
    () => !shipsTable[rowUnderCursor].slice(cellOrigin[1], cellOrigin[1] + shipLength[draggedShip]).includes(1),
    () => {}
  );
}

function modifyShips([row, column]) {
  runByShipOrientation(
    () => {
      for (let i = 0; i < shipLength[draggedShip]; i++) shipsTable[row][column + i] = 1;

      shipInfo.origin[draggedShip] = [row, column];
    },
    () => {}
  );

  console.table(shipsTable);

  const shipObj = document.createElement("div");
  shipObj.classList.add("ship");
  shipObj.setAttribute("id", draggedShip + "Ship");

  let cellOriginObj;
  runByShipOrientation(
    () => (cellOriginObj = document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${column + 1})`)),
    () => {}
  );
  cellOriginObj.append(shipObj);

  menuShip = document.querySelector("#shipMenu #" + draggedShip);
  menuShip.classList.add("placed");
}
