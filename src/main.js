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
    if (e.target.className != "placed") {
      draggedShip = elem.id;

      shipPointUnderCursor = 1;
    }
  })
);

var shipToMove, isMoveShipAllowed;
document.body.addEventListener("mousedown", (e) => {
  shipToMove = e.target.closest(".ship") || 0;
  if (shipToMove) isMoveShipAllowed = true;

  // reset highlighted ship
  const prevHighlightedShipPopupObj = document.querySelector(`#board #${highlightedShip}Ship .popup`) || 0;
  if (prevHighlightedShipPopupObj) prevHighlightedShipPopupObj.style.display = "none";
  highlightedShip = null;
});

// set dragged ship on mousedown - from board; already placed ship
document.body.addEventListener("mousemove", (e) => {
  if (isMoveShipAllowed && e.target.className != "ship") {
    prepareShipToMove(e);

    isMoveShipAllowed = false; // check only once
  }
});

var prevCellOrigin;
function prepareShipToMove(e) {
  const isTargetPopup = e.target.closest(".popup") || 0;
  if (shipToMove && !isTargetPopup) {
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
}

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
var rowUnderCursor, columnUnderCursor, highlightedShip;
document.body.addEventListener("mouseup", (e) => {
  isMoveShipAllowed = false;

  if (e.target.className == "ship") {
    highlightedShip = e.target.id[0];
    e.target.firstChild.removeAttribute("style"); // show popup
  } else if (draggedShip && e.target.nodeName == "TD") {
    highlightedShip = draggedShip;

    rowUnderCursor = e.target.closest("tr").rowIndex;
    columnUnderCursor = e.target.cellIndex;

    getCellOrigin();

    isShipNotOverlap() ? modifyShips(cellOrigin) : modifyShips(prevCellOrigin);
  } else if (draggedShip && prevCellOrigin) modifyShips(prevCellOrigin);

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
  shipObj.className = "ship";
  shipObj.id = draggedShip + "Ship";
  shipObj.append(createShipPopup());

  runByShipOrientation(
    () => document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${column + 1})`).append(shipObj),
    () => {}
  );

  menuShip = document.querySelector("#shipMenu #" + draggedShip);
  menuShip.className = "placed";
}

function createShipPopup() {
  const rotateSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.89,10.105C19.676,9.6,19.411,9.11,19.101,8.649l-1.658,1.119c0.238,0.352,0.441,0.727,0.604,1.115 c0.168,0.398,0.297,0.813,0.383,1.23c0.088,0.433,0.133,0.878,0.133,1.324s-0.045,0.893-0.133,1.324 c-0.086,0.418-0.214,0.831-0.384,1.231c-0.162,0.386-0.365,0.761-0.603,1.112c-0.234,0.347-0.505,0.674-0.803,0.973 c-0.297,0.297-0.624,0.566-0.973,0.802c-0.352,0.238-0.726,0.441-1.114,0.604c-0.395,0.167-0.809,0.296-1.229,0.383 c-0.864,0.175-1.786,0.175-2.646,0c-0.422-0.087-0.837-0.216-1.233-0.384c-0.387-0.163-0.761-0.366-1.113-0.604 c-0.347-0.233-0.673-0.503-0.971-0.8c-0.299-0.3-0.569-0.628-0.803-0.973c-0.237-0.351-0.44-0.726-0.605-1.115 c-0.167-0.396-0.295-0.809-0.382-1.23c-0.088-0.431-0.133-0.876-0.133-1.323c0-0.447,0.045-0.892,0.134-1.324 c0.086-0.42,0.214-0.834,0.381-1.23c0.165-0.39,0.369-0.765,0.605-1.114c0.234-0.347,0.504-0.674,0.802-0.972 C7.656,8.5,7.983,8.23,8.332,7.995c0.35-0.236,0.725-0.44,1.114-0.605c0.395-0.167,0.81-0.296,1.23-0.382 C10.783,6.986,10.892,6.976,11,6.959V10l5-4l-5-4v2.938C10.757,4.967,10.514,5,10.275,5.049c-0.55,0.113-1.092,0.281-1.608,0.5 c-0.509,0.215-0.999,0.481-1.455,0.79C6.758,6.645,6.332,6.996,5.945,7.383C5.557,7.771,5.206,8.197,4.9,8.649 c-0.309,0.457-0.574,0.946-0.79,1.455c-0.219,0.518-0.387,1.059-0.499,1.608c-0.116,0.563-0.174,1.144-0.174,1.726 c0,0.582,0.059,1.162,0.174,1.725c0.113,0.551,0.281,1.092,0.499,1.607c0.215,0.509,0.481,0.999,0.79,1.456 c0.305,0.45,0.656,0.876,1.045,1.268c0.389,0.388,0.814,0.739,1.265,1.043c0.459,0.311,0.949,0.577,1.456,0.79 c0.516,0.218,1.057,0.387,1.609,0.5C10.839,21.941,11.419,22,12,22c0.581,0,1.161-0.059,1.727-0.174 c0.551-0.114,1.092-0.282,1.604-0.499c0.507-0.213,0.998-0.479,1.457-0.79c0.453-0.306,0.879-0.657,1.268-1.046 c0.388-0.389,0.739-0.814,1.045-1.266c0.312-0.462,0.576-0.952,0.788-1.455c0.22-0.52,0.389-1.061,0.5-1.608 c0.115-0.563,0.174-1.144,0.174-1.725c0-0.58-0.059-1.161-0.174-1.725C20.277,11.166,20.108,10.625,19.89,10.105z"/></svg>';
  const removeSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 11H19V13H5z"/></svg>';

  const parsedRotateSVG = new DOMParser().parseFromString(rotateSVG, "image/svg+xml").firstChild;
  const parsedRemoveSVG = new DOMParser().parseFromString(removeSVG, "image/svg+xml").firstChild;

  parsedRemoveSVG.id = "remove";

  const rotateButton = document.createElement("div");
  const removeButton = document.createElement("div");

  rotateButton.append(parsedRotateSVG);
  removeButton.append(parsedRemoveSVG);

  const ship = document.createElement("div");
  ship.className = "popup";
  ship.append(rotateButton, removeButton);
  return ship;
}
