class GameSetup {
  constructor() {
    this._attachGameSetupHandlers();
  }

  _attachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.addEventListener("mousedown", (e) => this._getShipInfoFromShipMenuItem(e)));
    document.body.addEventListener("mousedown", (e) => this._bodyMouseDownHandler(e));
    document.body.addEventListener("mousemove", (e) => this._bodyMouseMoveHandler(e));
    document.body.addEventListener("mouseup", (e) => this._bodyMouseUpHandler(e));
    randomizeBoardButton.addEventListener("click", () => this._randomizeBoardButtonHandler());
    resetBoardButton.addEventListener("click", () => this._resetBoardButtonHandler());
  }

  detachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.removeEventListener("mousedown", (e) => this._getShipInfoFromShipMenuItem(e)));
    document.body.removeEventListener("mousedown", (e) => this._bodyMouseDownHandler(e));
    document.body.removeEventListener("mousemove", (e) => this._bodyMouseMoveHandler(e));
    document.body.removeEventListener("mouseup", (e) => this._bodyMouseUpHandler(e));
    randomizeBoardButton.removeEventListener("click", () => this._randomizeBoardButtonHandler());
    resetBoardButton.removeEventListener("click", () => this._resetBoardButtonHandler());
  }

  _getShipInfoFromShipMenuItem(e) {
    this._fixDraggedShipOutsideBody();

    const clickedShipAlreadyPlaced = e.target.classList.contains("ship-menu__item--placed");
    if (clickedShipAlreadyPlaced) return;

    user.selectedShip = e.target.id;
    user.shipSegmentIndexOnMousedown = user.getSelectedShipMiddleSegmentIndex();
  }

  _bodyMouseDownHandler(e) {
    const clickedOutsideUserBoard = !e.target.closest(".board--user");
    if (clickedOutsideUserBoard) return;

    this._fixDraggedShipOutsideBody();

    user.selectedShipElem = e.target.classList.contains("ship") ? e.target : null;
    if (user.selectedShipElem) {
      user.canMoveShip = true;
      user.selectedShip = user.selectedShipElem.id;
      user.shipSegmentIndexOnMousedown = user.getCurrentShipSegmentIndexUnderCursor(e);
      user.prevSelectedShipOrigin = user.shipInfo.origin[user.selectedShip];
    }
  }

  _fixDraggedShipOutsideBody() {
    const wasPrevSelectedShipDraggedOutsideBody = !!user.selectedShip;
    if (wasPrevSelectedShipDraggedOutsideBody) {
      const prevSelectedShipMenuItem = document.querySelector(`.ship-menu__item#${user.selectedShip}`);
      removeElementClassNameModifier(prevSelectedShipMenuItem, "ship-menu__item", "placed");
      user.selectedShip = null;
    }
  }

  _bodyMouseMoveHandler(e) {
    if (!user.canMoveShip) return;

    const shipDraggedToAnotherCell =
      e.target.id !== user.selectedShip || user.shipSegmentIndexOnMousedown != user.getCurrentShipSegmentIndexUnderCursor(e);
    if (shipDraggedToAnotherCell) {
      user.canMoveShip = false; // reset; pass only once
      user.removeSelectedShip();
      user.hideAllShipPopups();
    }
  }

  _bodyMouseUpHandler(e) {
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

    this._updateFinishSetupButtonVisibility();

    user.selectedShip = user.prevSelectedShipOrigin = user.shipSegmentIndexOnMousedown = null; // reset
  }

  _randomizeBoardButtonHandler() {
    user.removePlacedShips();
    user.randomizeShips();
    user.hideAllShipPopups();

    this._updateFinishSetupButtonVisibility();

    user.selectedShip = null; // reset
  }

  _resetBoardButtonHandler() {
    user.removePlacedShips();

    this._updateFinishSetupButtonVisibility();

    user.selectedShip = null; // reset
  }

  _updateFinishSetupButtonVisibility() {
    if (user.allShipsPlaced()) showElement(finishGameSetupButton, "finish-setup-button");
    else hideElement(finishGameSetupButton, "finish-setup-button");
  }
}

function shipRotateButtonHandler(e) {
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

function shipRemoveButtonHandler(e) {
  user.selectedShipElem = e.target.closest(".ship");
  user.selectedShip = user.selectedShipElem.id;
  user.resetSelectedShip();

  user.selectedShip = null; //reset

  _updateFinishSetupButtonVisibility();
}
