// mousedown on ship menu item
const menuShipElems = document.querySelectorAll(".ship-menu__item");
menuShipElems.forEach((elem) =>
  elem.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains(".ship-menu__item--placed")) user.selectedShip = elem.id;
  })
);

var selectedShipElem, canMoveShip, shipPointOnMousedown, prevShipOrigin;
document.body.addEventListener("mousedown", (e) => {
  // if mousedown outside board
  if (!e.target.closest(".board")) {
    hideAllShipPopups();
    return;
  }

  // if previous dragging did not mouseup on body, skip collecting new ship info
  if (user.selectedShip) return;

  // if mousedown on ship, collect ship info
  selectedShipElem = e.target.classList.contains("ship") ? e.target : null;
  if (selectedShipElem) {
    canMoveShip = true;
    user.selectedShip = selectedShipElem.id;
    shipPointOnMousedown = getCurrentShipPointUnderCursor(e);
    prevShipOrigin = user.shipOrigin[user.selectedShip];
  }
});

document.body.addEventListener("mousemove", (e) => {
  // if mousedown on ship
  if (canMoveShip) {
    // if ship will be moved -- if cursor outside selected ship || cursor outside cell where it started mousedown
    if (!(e.target.id == user.selectedShip) || shipPointOnMousedown != getCurrentShipPointUnderCursor(e)) {
      canMoveShip = false; // reset; pass only once
      removeSelectedShip();
      hideAllShipPopups();
    }
  }
});

document.body.addEventListener("mouseup", (e) => {
  canMoveShip = false; // reset
  hideAllShipPopups();

  if (user.selectedShip) {
    // if mouseup on same ship
    if (e.target.classList.contains("ship") && e.target.id == user.selectedShip) e.target.firstChild.style.display = null;
    // else if mouseup on cell
    else if (e.target.nodeName == "TD") {
      const rowUnderCursor = e.target.closest("tr").rowIndex;
      const columnUnderCursor = e.target.cellIndex;
      user.newShipOrigin = [rowUnderCursor, columnUnderCursor];
      user.adjustShipOriginToInsideBoard(shipPointOnMousedown);

      if (!user.doesSelectedShipOverlapOthers()) user.addSelectedShip();
      else if (prevShipOrigin) user.addSelectedShip(prevShipOrigin);
    } // else if mouseup not on cell
    else if (prevShipOrigin) user.addSelectedShip(prevShipOrigin);
  }

  user.selectedShip = prevShipOrigin = shipPointOnMousedown = null; // reset
});

function rotateButtonHandler(e) {
  selectedShipElem = e.target.closest(".ship");
  user.selectedShip = selectedShipElem.id;
  user.newShipOrigin = user.shipOrigin[user.selectedShip];

  removeSelectedShip();
  rotateSelectedShip();

  user.adjustShipOriginToInsideBoard();
  user.adjustShipOriginToAvailableSpace();

  user.addSelectedShip();

  user.selectedShip = null; //reset
}

function removeButtonHandler(e) {
  selectedShipElem = e.target.closest(".ship");
  user.selectedShip = selectedShipElem.id;
  removeSelectedShip();

  user.shipOrientation[user.selectedShip] = "h";

  const menuShipElem = document.querySelector(`.ship-menu__item#${user.selectedShip}`);
  menuShipElem.classList.remove("ship-menu__item--placed");

  user.selectedShip = null; //reset
}

const shipNames = "cbdsp";
const randomizeButton = document.querySelector(".ship-menu__button--random");
randomizeButton.addEventListener("click", () => {
  // remove all placed ships
  for (let ship of shipNames) {
    if (!user.shipOrigin[ship]) continue; // if not placed
    user.selectedShip = ship;
    selectedShipElem = document.querySelector(`.ship#${user.selectedShip}`);
    removeSelectedShip();
  }

  user.randomizeShips();

  hideAllShipPopups();

  user.selectedShip = null; // reset
});
