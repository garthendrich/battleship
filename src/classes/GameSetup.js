class GameSetup {
  constructor() {
    this._getShipInfoFromShipMenuItem = this._getShipInfoFromShipMenuItem.bind(this);
    this._bodyMouseDownHandler = this._bodyMouseDownHandler.bind(this);
    this._bodyMouseMoveHandler = this._bodyMouseMoveHandler.bind(this);
    this._bodyMouseUpHandler = this._bodyMouseUpHandler.bind(this);
    this._randomizeBoardButtonHandler = this._randomizeBoardButtonHandler.bind(this);
    this._resetBoardButtonHandler = this._resetBoardButtonHandler.bind(this);

    this._attachGameSetupHandlers();
  }

  _attachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.addEventListener("mousedown", this._getShipInfoFromShipMenuItem));
    document.body.addEventListener("mousedown", this._bodyMouseDownHandler);
    document.body.addEventListener("mousemove", this._bodyMouseMoveHandler);
    document.body.addEventListener("mouseup", this._bodyMouseUpHandler);
    randomizeBoardButton.addEventListener("click", this._randomizeBoardButtonHandler);
    resetBoardButton.addEventListener("click", this._resetBoardButtonHandler);
  }

  detachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.removeEventListener("mousedown", this._getShipInfoFromShipMenuItem));
    document.body.removeEventListener("mousedown", this._bodyMouseDownHandler);
    document.body.removeEventListener("mousemove", this._bodyMouseMoveHandler);
    document.body.removeEventListener("mouseup", this._bodyMouseUpHandler);
    randomizeBoardButton.removeEventListener("click", this._randomizeBoardButtonHandler);
    resetBoardButton.removeEventListener("click", this._resetBoardButtonHandler);
  }

  _getShipInfoFromShipMenuItem(e) {
    this._fixDraggedShipOutsideBody();

    const clickedShipAlreadyPlaced = elementHasClassNameModifier(e.target, "ship-menu__item", "placed");
    if (clickedShipAlreadyPlaced) return;

    user.selectedShip = e.target.id;
    user.shipSegmentIndexOnMousedown = user.getSelectedShipMiddleSegmentIndex();
  }

  _bodyMouseDownHandler(e) {
    const clickedOutsideUserBoard = !getElementAncestor(e.target, ".board--user");
    if (clickedOutsideUserBoard) return;

    this._fixDraggedShipOutsideBody();

    user.selectedShipElem = elementHasClassName(e.target, "ship") ? e.target : null;
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
      const mouseUpOnSameShip = elementHasClassName(e.target, "ship") && e.target.id == user.selectedShip;
      const mouseUpOnUserBoardCell = getElementAncestor(e.target, ".board--user") && e.target.nodeName == "TD";

      if (mouseUpOnSameShip) {
        const selectedShipPopup = e.target.firstChild;
        showElement(selectedShipPopup, "ship__popup");
      } else if (mouseUpOnUserBoardCell) {
        const cellRowUnderCursor = getElementAncestor(e.target, "tr").rowIndex;
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
