"use strict";

const shipMenuButtons = document.querySelectorAll(".ship-menu__item");
const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
const resetBoardButton = document.querySelector(".ship-menu__button--reset");

function attachGameSetupHandlers() {
  shipMenuButtons.forEach((button) => button.addEventListener("mousedown", shipMenuElHandler));
  document.body.addEventListener("mousedown", bodyMouseDownHandler);
  document.body.addEventListener("mousemove", bodyMouseMoveHandler);
  document.body.addEventListener("mouseup", bodyMouseUpHandler);
  randomizeBoardButton.addEventListener("click", randomizeBoardButtonHandler);
  resetBoardButton.addEventListener("click", removePlacedShips);
}

function detachGameSetupHandlers() {
  shipMenuButtons.forEach((button) => button.removeEventListener("mousedown", shipMenuElHandler));
  document.body.removeEventListener("mousedown", bodyMouseDownHandler);
  document.body.removeEventListener("mousemove", bodyMouseMoveHandler);
  document.body.removeEventListener("mouseup", bodyMouseUpHandler);
  randomizeBoardButton.removeEventListener("click", randomizeBoardButtonHandler);
  resetBoardButton.removeEventListener("click", removePlacedShips);
}

// ------------------------------------------------------------------------------------------

// mousedown on ship menu item
function shipMenuElHandler(e) {
  if (!e.target.classList.contains("ship-menu__item--placed")) {
    user.selectedShip = e.target.id;
    user.shipSegmentIndexOnMousedown = user.getSelectedShipMiddleSegmentIndex();
  }
}

function bodyMouseDownHandler(e) {
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
    user.shipSegmentIndexOnMousedown = user.getCurrentShipSegmentIndexUnderCursor(e);
    user.prevShipOrigin = user.shipInfo.origin[user.selectedShip];
  }
}

function bodyMouseMoveHandler(e) {
  // if mousedown on ship
  if (user.canMoveShip) {
    // if ship will be moved: if cursor outside selected ship || cursor outside cell where it started mousedown
    if (!(e.target.id == user.selectedShip) || user.shipSegmentIndexOnMousedown != user.getCurrentShipSegmentIndexUnderCursor(e)) {
      user.canMoveShip = false; // reset; pass only once
      user.removeSelectedShip();
      user.hideAllShipPopups();
    }
  }
}

function bodyMouseUpHandler(e) {
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

      user.newShipOrigin = user.runBySelectedShipOrientation(
        () => [rowUnderCursor, columnUnderCursor - user.shipSegmentIndexOnMousedown],
        () => [rowUnderCursor - user.shipSegmentIndexOnMousedown, columnUnderCursor]
      );

      user.adjustShipOriginToInsideBoard();

      if (!user.doesSelectedShipOverlapOthers()) user.addSelectedShip(user.newShipOrigin);
      else if (user.prevShipOrigin) user.addSelectedShip(user.prevShipOrigin);
    }
    // else if mouseup not on cell and has prevShipOrigin
    else if (user.prevShipOrigin) user.addSelectedShip(user.prevShipOrigin);
  }

  user.selectedShip = user.prevShipOrigin = user.shipSegmentIndexOnMousedown = null; // reset
}

function randomizeBoardButtonHandler() {
  removePlacedShips();
  user.randomizeShips();
  user.hideAllShipPopups();

  user.selectedShip = null; // reset
}

const shipNames = "cbdsp";
function removePlacedShips() {
  for (let ship of shipNames) {
    if (!user.shipInfo.origin[ship]) continue; // if not placed
    user.selectedShip = ship;
    user.selectedShipElem = document.querySelector(`.ship#${user.selectedShip}`);
    user.resetSelectedShip();
  }

  user.selectedShip = null; // reset
}

function rotateButtonHandler(e) {
  user.selectedShipElem = e.target.closest(".ship");
  user.selectedShip = user.selectedShipElem.id;
  user.newShipOrigin = user.shipInfo.origin[user.selectedShip];

  user.removeSelectedShip();
  user.rotateSelectedShip();

  user.adjustShipOriginToInsideBoard();
  user.adjustShipOriginToAvailableSpace();

  user.addSelectedShip(user.newShipOrigin);

  user.selectedShip = null; //reset
}

function removeButtonHandler(e) {
  user.selectedShipElem = e.target.closest(".ship");
  user.selectedShip = user.selectedShipElem.id;
  user.resetSelectedShip();

  user.selectedShip = null; //reset
}
