"use strict";

const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
const resetBoardButton = document.querySelector(".ship-menu__button--reset");

function attachGameSetupHandlers() {
  shipMenuItems.forEach((item) => item.addEventListener("mousedown", getShipInfoFromShipMenuItem));
  document.body.addEventListener("mousedown", bodyMouseDownHandler);
  document.body.addEventListener("mousemove", bodyMouseMoveHandler);
  document.body.addEventListener("mouseup", bodyMouseUpHandler);
  randomizeBoardButton.addEventListener("click", randomizeBoardButtonHandler);
  resetBoardButton.addEventListener("click", resetBoardButtonHandler);
}

function detachGameSetupHandlers() {
  shipMenuItems.forEach((item) => item.removeEventListener("mousedown", getShipInfoFromShipMenuItem));
  document.body.removeEventListener("mousedown", bodyMouseDownHandler);
  document.body.removeEventListener("mousemove", bodyMouseMoveHandler);
  document.body.removeEventListener("mouseup", bodyMouseUpHandler);
  randomizeBoardButton.removeEventListener("click", randomizeBoardButtonHandler);
  resetBoardButton.removeEventListener("click", resetBoardButtonHandler);
}

// ------------------------------------------------------------------------------------------

function getShipInfoFromShipMenuItem(e) {
  fixDraggedShipOutsideBody();

  const clickedShipAlreadyPlaced = e.target.classList.contains("ship-menu__item--placed");
  if (clickedShipAlreadyPlaced) return;

  user.selectedShip = e.target.id;
  user.shipSegmentIndexOnMousedown = user.getSelectedShipMiddleSegmentIndex();
}

function bodyMouseDownHandler(e) {
  const clickedOutsideUserBoard = !e.target.closest(".board--user");
  if (clickedOutsideUserBoard) return;

  fixDraggedShipOutsideBody();

  user.selectedShipElem = e.target.classList.contains("ship") ? e.target : null;
  if (user.selectedShipElem) {
    user.canMoveShip = true;
    user.selectedShip = user.selectedShipElem.id;
    user.shipSegmentIndexOnMousedown = user.getCurrentShipSegmentIndexUnderCursor(e);
    user.prevSelectedShipOrigin = user.shipInfo.origin[user.selectedShip];
  }
}

function fixDraggedShipOutsideBody() {
  const wasPrevSelectedShipDraggedOutsideBody = !!user.selectedShip;
  if (wasPrevSelectedShipDraggedOutsideBody) {
    const prevSelectedShipMenuItem = document.querySelector(`.ship-menu__item#${user.selectedShip}`);
    removeElementClassNameModifier(prevSelectedShipMenuItem, "ship-menu__item", "placed");
    user.selectedShip = null;
  }
}

function bodyMouseMoveHandler(e) {
  if (!user.canMoveShip) return;

  const shipDraggedToAnotherCell =
    e.target.id !== user.selectedShip || user.shipSegmentIndexOnMousedown != user.getCurrentShipSegmentIndexUnderCursor(e);
  if (shipDraggedToAnotherCell) {
    user.canMoveShip = false; // reset; pass only once
    user.removeSelectedShip();
    user.hideAllShipPopups();
  }
}

function bodyMouseUpHandler(e) {
  user.canMoveShip = false; // reset
  user.hideAllShipPopups();

  if (user.selectedShip) {
    const mouseUpOnSameShip = e.target.classList.contains("ship") && e.target.id == user.selectedShip;
    const mouseUpOnUserBoardCell = e.target.closest(".board--user") && e.target.nodeName == "TD";

    if (mouseUpOnSameShip) {
      const selectedShipPopup = e.target.firstChild;
      showElement(selectedShipPopup, "ship__popup");
    } else if (mouseUpOnUserBoardCell) {
      const cellRowUnderCursor = e.target.closest("tr").rowIndex;
      const cellColumnUnderCursor = e.target.cellIndex;

      user.newShipOrigin = user.runBySelectedShipOrientation(
        () => [cellRowUnderCursor, cellColumnUnderCursor - user.shipSegmentIndexOnMousedown],
        () => [cellRowUnderCursor - user.shipSegmentIndexOnMousedown, cellColumnUnderCursor]
      );

      user.adjustShipOriginToInsideBoard();

      if (!user.selectedShipOverlapOtherShips()) user.addSelectedShip(user.newShipOrigin);
      else if (user.prevSelectedShipOrigin) user.addSelectedShip(user.prevSelectedShipOrigin);
    } else if (user.prevSelectedShipOrigin) user.addSelectedShip(user.prevSelectedShipOrigin);
  }

  updateFinishSetupButtonVisibility();

  user.selectedShip = user.prevSelectedShipOrigin = user.shipSegmentIndexOnMousedown = null; // reset
}

function updateFinishSetupButtonVisibility() {
  if (user.allShipsPlaced()) showElement(finishGameSetupButton, "finish-setup-button");
  else hideElement(finishGameSetupButton, "finish-setup-button");
}

function randomizeBoardButtonHandler() {
  user.removePlacedShips();
  user.randomizeShips();
  user.hideAllShipPopups();

  updateFinishSetupButtonVisibility();

  user.selectedShip = null; // reset
}

function resetBoardButtonHandler() {
  user.removePlacedShips();

  updateFinishSetupButtonVisibility();

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

  updateFinishSetupButtonVisibility();
}
