/*
 * Must include:
 * Saving and loading the current state of the game using files
 * File implementation for high scores
 * A smart AI opponent
 */

/*
  TODO
  * ship randomizer
  * class Player
  * class User (subclass)
  * class AI (subclass)
  * html two boards
*/

class Player {
  constructor() {
    this.shipsTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shotsTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shipInfo = {
      origin: {
        // [row, column]
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
      length: {
        c: 5,
        b: 4,
        d: 3,
        s: 3,
        p: 2,
      },
    };
  }
}

const user = new Player();

const runBySelectedShipOrientation = (h, v) => (user.shipInfo.orientation[selectedShip] == "h" ? h() : v());

var selectedShip;
// mousedown on ship menu item
const menuShipElems = document.querySelectorAll("#shipMenu ul li");
menuShipElems.forEach((elem) =>
  elem.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("placed")) selectedShip = elem.id[0];
  })
);

var willRotate, willRemove, selectedShipElem, canMoveShip, shipPointUnderCursorOnMousedown, prevShipCellOrigin;
document.body.addEventListener("mousedown", (e) => {
  // if mousedown outside board
  if (!e.target.closest("#board")) {
    hideAllShipPopups(); // reset
    return;
  }

  // if mousedown on rotate button
  if (e.target.closest(".rotate")) {
    willRotate = true;
    return;
  }

  // if mousedown on remove button
  if (e.target.closest(".remove")) {
    willRemove = true;
    return;
  }

  // if mousedown on ship, collect ship info
  selectedShipElem = (e.target.classList.contains("ship") && e.target) || null;
  if (selectedShipElem) {
    canMoveShip = true;
    selectedShip = selectedShipElem.id[0];
    shipPointUnderCursorOnMousedown = getCurrentShipPointUnderCursor(e);
    prevShipCellOrigin = user.shipInfo.origin[selectedShip];
  }
});

function hideAllShipPopups() {
  const shipPopupElems = document.querySelectorAll(`#board .ship .popup`) || null;
  if (shipPopupElems.length) shipPopupElems.forEach((popup) => (popup.style.display = "none"));
}

function getCurrentShipPointUnderCursor(e) {
  return runBySelectedShipOrientation(
    () =>
      Math.ceil((e.clientX - selectedShipElem.getBoundingClientRect().left) / selectedShipElem.getBoundingClientRect().height),
    () => Math.ceil((e.clientY - selectedShipElem.getBoundingClientRect().top) / selectedShipElem.getBoundingClientRect().width)
  );
}

document.body.addEventListener("mousemove", (e) => {
  // if mousedown on ship
  if (canMoveShip) {
    // willMoveShip: cursor outside selected ship || cursor outside cell where it started mousedown
    let willMoveShip = !(e.target.id[0] == selectedShip) || shipPointUnderCursorOnMousedown != getCurrentShipPointUnderCursor(e);
    if (willMoveShip) {
      canMoveShip = false; // reset; pass only once
      removeSelectedShip(); // reset
      hideAllShipPopups(); // reset
    }
  }
});

function removeSelectedShip() {
  selectedShipElem.remove();

  let [row, column] = user.shipInfo.origin[selectedShip];
  runBySelectedShipOrientation(
    () => {
      for (let i = 0; i < user.shipInfo.length[selectedShip]; i++) user.shipsTable[row][column + i] = 0;
    },
    () => {
      for (let i = 0; i < user.shipInfo.length[selectedShip]; i++) user.shipsTable[row + i][column] = 0;
    }
  );
}

document.body.addEventListener("mouseup", (e) => {
  canMoveShip = false; // reset
  hideAllShipPopups(); // reset

  // if clicked rotate button
  if (willRotate && e.target.closest(".rotate")) {
    selectedShipElem = e.target.closest(".ship");
    selectedShip = selectedShipElem.id[0];
    removeSelectedShip();

    shipCellOrigin = user.shipInfo.origin[selectedShip];
    rotateSelectedShip();

    adjustShipCellOriginToInsideBoard();
    adjustShipCellOriginToAvailableSpace();

    modifyShip(shipCellOrigin);

    selectedShip = null; //reset
    willRotate = false; // reset
    return;
  }

  // if clicked remove button
  if (willRemove && e.target.closest(".remove")) {
    selectedShipElem = e.target.closest(".ship");
    selectedShip = selectedShipElem.id[0];
    removeSelectedShip();

    user.shipInfo.orientation[selectedShip] = "h";

    const menuShipElem = document.querySelector(`#shipMenu #${selectedShip}Menu`);
    menuShipElem.classList.remove("placed");

    selectedShip = null; //reset
    willRemove = false; // reset
    return;
  }

  if (selectedShip) {
    // if clicked ship, show popup
    if (e.target.classList.contains("ship") && e.target.id[0] == selectedShip) e.target.firstChild.removeAttribute("style");
    // if dragged ship to cell
    else if (selectedShip && e.target.nodeName == "TD") {
      rowUnderCursor = e.target.closest("tr").rowIndex;
      columnUnderCursor = e.target.cellIndex;
      shipCellOrigin = [rowUnderCursor, columnUnderCursor];
      adjustShipCellOriginToInsideBoard(shipPointUnderCursorOnMousedown);

      if (!doesSelectedShipOverlapOthers()) modifyShip(shipCellOrigin);
      else if (prevShipCellOrigin) modifyShip(prevShipCellOrigin);
    } else if (prevShipCellOrigin) modifyShip(prevShipCellOrigin);
  }

  selectedShip = prevShipCellOrigin = null; // reset
  shipPointUnderCursorOnMousedown = undefined; // reset (undefined so default value of adjustShipCellOriginToInsideBoard() will work)
});

function rotateSelectedShip() {
  const lengthFromMiddleOfShip = Math.round(user.shipInfo.length[selectedShip] / 2) - 1;
  runBySelectedShipOrientation(
    () => {
      user.shipInfo.orientation[selectedShip] = "v";
      selectedShipElem.classList.add("vert");

      shipCellOrigin[1] += lengthFromMiddleOfShip;
      shipCellOrigin[0] -= lengthFromMiddleOfShip;
    },
    () => {
      user.shipInfo.orientation[selectedShip] = "h";
      selectedShipElem.classList.remove("vert");

      shipCellOrigin[0] += lengthFromMiddleOfShip;
      shipCellOrigin[1] -= lengthFromMiddleOfShip;
    }
  );
}

var shipCellOrigin;
// adjust ship cell origin to avoid ship outside board
function adjustShipCellOriginToInsideBoard(shipPoint = 1) {
  let [row, column] = shipCellOrigin;
  runBySelectedShipOrientation(
    () => {
      // adjust column
      let firstShipColumn = column - (shipPoint - 1);
      let lastShipColumn = column - shipPoint + user.shipInfo.length[selectedShip];

      if (lastShipColumn > 9) column = 9 - (user.shipInfo.length[selectedShip] - 1);
      else if (firstShipColumn < 0) column = 0;
      else column = firstShipColumn;
    },
    () => {
      // adjust row
      let firstShipRow = row - (shipPoint - 1);
      let lastShipRow = row - shipPoint + user.shipInfo.length[selectedShip];

      if (lastShipRow > 9) row = 9 - (user.shipInfo.length[selectedShip] - 1);
      else if (firstShipRow < 0) row = 0;
      else row = firstShipRow;
    }
  );

  shipCellOrigin = [row, column];
}

// adjust ship cell origin so ship would not overlap with other ships
function adjustShipCellOriginToAvailableSpace() {
  // 0: row, 1: column
  let cellForwards, cellSideways;
  runBySelectedShipOrientation(
    () => ([cellForwards, cellSideways] = [1, 0]),
    () => ([cellForwards, cellSideways] = [0, 1])
  );

  let cellChecksInOneLine = 9 - user.shipInfo.length[selectedShip];
  while (doesSelectedShipOverlapOthers()) {
    if (!cellChecksInOneLine) {
      shipCellOrigin[cellSideways] >= 9 ? (shipCellOrigin[cellSideways] = 0) : shipCellOrigin[cellSideways]++;
      cellChecksInOneLine = 9;
    }
    shipCellOrigin[cellForwards] >= 9 - (user.shipInfo.length[selectedShip] - 1)
      ? (shipCellOrigin[cellForwards] = 0)
      : shipCellOrigin[cellForwards]++;
    cellChecksInOneLine--;
  }
}

function doesSelectedShipOverlapOthers() {
  let [row, column] = shipCellOrigin;
  return runBySelectedShipOrientation(
    () => user.shipsTable[row].slice(column, column + user.shipInfo.length[selectedShip]).includes(1),
    () => {
      for (let i = row; i < row + user.shipInfo.length[selectedShip]; i++) if (user.shipsTable[i][column] == 1) return true;
      return false;
    }
  );
}

function modifyShip([row, column]) {
  runBySelectedShipOrientation(
    () => {
      for (let i = 0; i < user.shipInfo.length[selectedShip]; i++) user.shipsTable[row][column + i] = 1;
    },
    () => {
      for (let i = 0; i < user.shipInfo.length[selectedShip]; i++) user.shipsTable[row + i][column] = 1;
    }
  );
  user.shipInfo.origin[selectedShip] = [row, column];

  console.table(user.shipsTable);

  document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${column + 1})`).append(createShip());

  const menuShipElem = document.querySelector(`#shipMenu #${selectedShip}Menu`);
  menuShipElem.classList.add("placed");
}

function createShip() {
  const newShipObj = document.createElement("div");
  runBySelectedShipOrientation(
    () => newShipObj.classList.add("ship"),
    () => newShipObj.classList.add("ship", "vert")
  );
  newShipObj.id = selectedShip + "Ship";
  newShipObj.append(createShipPopup());
  return newShipObj;
}

const rotateSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.89,10.105C19.676,9.6,19.411,9.11,19.101,8.649l-1.658,1.119c0.238,0.352,0.441,0.727,0.604,1.115 c0.168,0.398,0.297,0.813,0.383,1.23c0.088,0.433,0.133,0.878,0.133,1.324s-0.045,0.893-0.133,1.324 c-0.086,0.418-0.214,0.831-0.384,1.231c-0.162,0.386-0.365,0.761-0.603,1.112c-0.234,0.347-0.505,0.674-0.803,0.973 c-0.297,0.297-0.624,0.566-0.973,0.802c-0.352,0.238-0.726,0.441-1.114,0.604c-0.395,0.167-0.809,0.296-1.229,0.383 c-0.864,0.175-1.786,0.175-2.646,0c-0.422-0.087-0.837-0.216-1.233-0.384c-0.387-0.163-0.761-0.366-1.113-0.604 c-0.347-0.233-0.673-0.503-0.971-0.8c-0.299-0.3-0.569-0.628-0.803-0.973c-0.237-0.351-0.44-0.726-0.605-1.115 c-0.167-0.396-0.295-0.809-0.382-1.23c-0.088-0.431-0.133-0.876-0.133-1.323c0-0.447,0.045-0.892,0.134-1.324 c0.086-0.42,0.214-0.834,0.381-1.23c0.165-0.39,0.369-0.765,0.605-1.114c0.234-0.347,0.504-0.674,0.802-0.972 C7.656,8.5,7.983,8.23,8.332,7.995c0.35-0.236,0.725-0.44,1.114-0.605c0.395-0.167,0.81-0.296,1.23-0.382 C10.783,6.986,10.892,6.976,11,6.959V10l5-4l-5-4v2.938C10.757,4.967,10.514,5,10.275,5.049c-0.55,0.113-1.092,0.281-1.608,0.5 c-0.509,0.215-0.999,0.481-1.455,0.79C6.758,6.645,6.332,6.996,5.945,7.383C5.557,7.771,5.206,8.197,4.9,8.649 c-0.309,0.457-0.574,0.946-0.79,1.455c-0.219,0.518-0.387,1.059-0.499,1.608c-0.116,0.563-0.174,1.144-0.174,1.726 c0,0.582,0.059,1.162,0.174,1.725c0.113,0.551,0.281,1.092,0.499,1.607c0.215,0.509,0.481,0.999,0.79,1.456 c0.305,0.45,0.656,0.876,1.045,1.268c0.389,0.388,0.814,0.739,1.265,1.043c0.459,0.311,0.949,0.577,1.456,0.79 c0.516,0.218,1.057,0.387,1.609,0.5C10.839,21.941,11.419,22,12,22c0.581,0,1.161-0.059,1.727-0.174 c0.551-0.114,1.092-0.282,1.604-0.499c0.507-0.213,0.998-0.479,1.457-0.79c0.453-0.306,0.879-0.657,1.268-1.046 c0.388-0.389,0.739-0.814,1.045-1.266c0.312-0.462,0.576-0.952,0.788-1.455c0.22-0.52,0.389-1.061,0.5-1.608 c0.115-0.563,0.174-1.144,0.174-1.725c0-0.58-0.059-1.161-0.174-1.725C20.277,11.166,20.108,10.625,19.89,10.105z"/></svg>';
const removeSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 11H19V13H5z"/></svg>';
function createShipPopup() {
  const parsedRotateSVG = new DOMParser().parseFromString(rotateSVG, "image/svg+xml").firstChild;
  const parsedRemoveSVG = new DOMParser().parseFromString(removeSVG, "image/svg+xml").firstChild;
  const rotateButton = document.createElement("div");
  const removeButton = document.createElement("div");
  rotateButton.className = "rotate";
  removeButton.className = "remove";
  rotateButton.append(parsedRotateSVG);
  removeButton.append(parsedRemoveSVG);
  const popupObj = document.createElement("div");
  popupObj.className = "popup";
  popupObj.append(rotateButton, removeButton);
  return popupObj;
}
