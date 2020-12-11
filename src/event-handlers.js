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

const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
randomizeBoardButton.addEventListener("click", () => {
  removePlacedShips();

  user.randomizeShips();

  hideAllShipPopups();

  user.selectedShip = null; // reset
});

const resetBoardButton = document.querySelector(".ship-menu__button--reset");
resetBoardButton.addEventListener("click", removePlacedShips);