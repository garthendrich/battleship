"use strict";

// mousedown on ship menu item
const menuShipElems = document.querySelectorAll(".ship-menu__item");
menuShipElems.forEach((elem) =>
  elem.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("ship-menu__item--placed")) user.selectedShip = elem.id;
  })
);

let selectedShipElem, canMoveShip, shipPointOnMousedown, prevShipOrigin;
document.body.addEventListener("mousedown", (e) => {
  // if mousedown outside board
  if (!e.target.closest(".board--user")) {
    user.hideAllShipPopups();
    return;
  }

  // if previous dragging did not mouseup on body, skip collecting new ship info
  if (user.selectedShip) return;

  // if mousedown on ship, collect ship info
  selectedShipElem = e.target.classList.contains("ship") ? e.target : null;
  if (selectedShipElem) {
    canMoveShip = true;
    user.selectedShip = selectedShipElem.id;
    shipPointOnMousedown = user.getCurrentShipPointUnderCursor(e);
    prevShipOrigin = user.shipOrigin[user.selectedShip];
  }
});

document.body.addEventListener("mousemove", (e) => {
  // if mousedown on ship
  if (canMoveShip) {
    // if ship will be moved -- if cursor outside selected ship || cursor outside cell where it started mousedown
    if (!(e.target.id == user.selectedShip) || shipPointOnMousedown != user.getCurrentShipPointUnderCursor(e)) {
      canMoveShip = false; // reset; pass only once
      user.removeSelectedShip();
      user.hideAllShipPopups();
    }
  }
});

document.body.addEventListener("mouseup", (e) => {
  canMoveShip = false; // reset
  user.hideAllShipPopups();

  if (user.selectedShip) {
    // if mouseup on same ship, show popup
    if (e.target.classList.contains("ship") && e.target.id == user.selectedShip) e.target.firstChild.style.display = null;
    // else if mouseup on cell
    else if (e.target.nodeName == "TD") {
      const rowUnderCursor = e.target.closest("tr").rowIndex;
      const columnUnderCursor = e.target.cellIndex;
      user.newShipOrigin = [rowUnderCursor, columnUnderCursor];
      user.adjustShipOriginToInsideBoard(shipPointOnMousedown);

      if (!user.doesSelectedShipOverlapOthers()) user.addShip();
      else if (prevShipOrigin) user.addShip(prevShipOrigin);
    }
    // else if mouseup not on cell and has prevShipOrigin
    else if (prevShipOrigin) user.addShip(prevShipOrigin);
  }

  user.selectedShip = prevShipOrigin = shipPointOnMousedown = null; // reset
});

const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
randomizeBoardButton.addEventListener("click", () => {
  removePlacedShips();
  user.randomizeShips();
  user.hideAllShipPopups();

  user.selectedShip = null; // reset
});

const resetBoardButton = document.querySelector(".ship-menu__button--reset");
resetBoardButton.addEventListener("click", removePlacedShips);

const shipNames = "cbdsp";
function removePlacedShips() {
  for (let ship of shipNames) {
    if (!user.shipOrigin[ship]) continue; // if not placed
    user.selectedShip = ship;
    selectedShipElem = document.querySelector(`.ship#${user.selectedShip}`);
    user.resetSelectedShip();
  }

  user.selectedShip = null; // reset
}
