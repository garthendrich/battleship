"use strict";

// mousedown on ship menu item
const menuShipElems = document.querySelectorAll(".ship-menu__item");
menuShipElems.forEach((elem) =>
  elem.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("ship-menu__item--placed")) user.selectedShip = elem.id;
  })
);

document.body.addEventListener("mousedown", (e) => {
  // if mousedown outside board
  if (!e.target.closest(".board--user")) {
    user.hideAllShipPopups();
    return;
  }

  // if previous dragging did not mouseup on body, skip collecting new ship info
  if (user.selectedShip) return;

  // if mousedown on ship, collect ship info
  user.selectedShipElem = e.target.classList.contains("ship") ? e.target : null;
  if (user.selectedShipElem) {
    user.canMoveShip = true;
    user.selectedShip = user.selectedShipElem.id;
    user.shipPointOnMousedown = user.getCurrentShipPointUnderCursor(e);
    user.prevShipOrigin = user.shipOrigin[user.selectedShip];
  }
});

document.body.addEventListener("mousemove", (e) => {
  // if mousedown on ship
  if (user.canMoveShip) {
    // if ship will be moved -- if cursor outside selected ship || cursor outside cell where it started mousedown
    if (!(e.target.id == user.selectedShip) || user.shipPointOnMousedown != user.getCurrentShipPointUnderCursor(e)) {
      user.canMoveShip = false; // reset; pass only once
      user.removeSelectedShip();
      user.hideAllShipPopups();
    }
  }
});

document.body.addEventListener("mouseup", (e) => {
  user.canMoveShip = false; // reset
  user.hideAllShipPopups();

  if (user.selectedShip) {
    // if mouseup on same ship, show popup
    if (e.target.classList.contains("ship") && e.target.id == user.selectedShip) {
      const selectedShipPopup = e.target.firstChild;
      selectedShipPopup.classList.remove("ship__popup--hidden");
    }
    // else if mouseup on cell
    else if (e.target.closest(".board--user") && e.target.nodeName == "TD") {
      const rowUnderCursor = e.target.closest("tr").rowIndex;
      const columnUnderCursor = e.target.cellIndex;
      user.newShipOrigin = [rowUnderCursor, columnUnderCursor];
      user.adjustShipOriginToInsideBoard(user.shipPointOnMousedown);

      if (!user.doesSelectedShipOverlapOthers()) user.addShip();
      else if (user.prevShipOrigin) user.addShip(user.prevShipOrigin);
    }
    // else if mouseup not on cell and has user.prevShipOrigin
    else if (user.prevShipOrigin) user.addShip(user.prevShipOrigin);
  }

  user.selectedShip = user.prevShipOrigin = user.shipPointOnMousedown = null; // reset
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
    user.selectedShipElem = document.querySelector(`.ship#${user.selectedShip}`);
    user.resetSelectedShip();
  }

  user.selectedShip = null; // reset
}
