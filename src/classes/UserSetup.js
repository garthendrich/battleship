class UserSetup extends PlayerSetup {
  constructor(board) {
    super(board);

    this._shipMenuItemHandler = this._shipMenuItemHandler.bind(this);
    this._bodyMouseDownHandler = this._bodyMouseDownHandler.bind(this);
    this._bodyMouseMoveHandler = this._bodyMouseMoveHandler.bind(this);
    this._bodyMouseUpHandler = this._bodyMouseUpHandler.bind(this);
    this._randomizeBoardButtonHandler = this._randomizeBoardButtonHandler.bind(this);
    this._resetBoardButtonHandler = this._resetBoardButtonHandler.bind(this);
    this._shipRotateButtonHandler = this._shipRotateButtonHandler.bind(this);
    this._shipRemoveButtonHandler = this._shipRemoveButtonHandler.bind(this);
  }

  attachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.addEventListener("mousedown", this._shipMenuItemHandler));
    document.body.addEventListener("mousedown", this._bodyMouseDownHandler);
    document.body.addEventListener("mousemove", this._bodyMouseMoveHandler);
    document.body.addEventListener("mouseup", this._bodyMouseUpHandler);
    randomizeBoardButton.addEventListener("click", this._randomizeBoardButtonHandler);
    resetBoardButton.addEventListener("click", this._resetBoardButtonHandler);
  }

  allShipsPlaced() {
    return !Object.values(this._shipInfo.origin).includes(null);
  }

  detachGameSetupHandlers() {
    shipMenuItems.forEach((item) => item.removeEventListener("mousedown", this._shipMenuItemHandler));
    document.body.removeEventListener("mousedown", this._bodyMouseDownHandler);
    document.body.removeEventListener("mousemove", this._bodyMouseMoveHandler);
    document.body.removeEventListener("mouseup", this._bodyMouseUpHandler);
    randomizeBoardButton.removeEventListener("click", this._randomizeBoardButtonHandler);
    resetBoardButton.removeEventListener("click", this._resetBoardButtonHandler);
  }

  _shipMenuItemHandler(e) {
    this._fixGrabbedShipOutsideBody();

    const clickedShipAlreadyPlaced = elementHasState(e.target, "placed");
    if (clickedShipAlreadyPlaced) return;

    this._grabbedShip = e.target.id;
    this._grabbedShipSegmentIndexUnderCursor = this._getGrabbedShipMiddleSegmentIndex();
  }

  _bodyMouseDownHandler(e) {
    const clickedOutsidethisBoard = !getElementAncestor(e.target, ".board--user");
    if (clickedOutsidethisBoard) return;

    this._fixGrabbedShipOutsideBody();

    const mouseDownOnShip = elementHasClassName(e.target, "ship");
    if (mouseDownOnShip) {
      this._grabbedShip = e.target.id;
      this._grabbedShipSegmentIndexUnderCursor = this._getGrabbedShipSegmentIndexUnderCursor(e);
      this._prevGrabbedShipOrigin = this._shipInfo.origin[this._grabbedShip];
      this._isHoldingAShip = true;
    }
  }

  _bodyMouseMoveHandler(e) {
    if (!this._isHoldingAShip) return;

    const shipGrabbedToAnotherCell =
      e.target.id !== this._grabbedShip || this._grabbedShipSegmentIndexUnderCursor !== this._getGrabbedShipSegmentIndexUnderCursor(e);
    if (shipGrabbedToAnotherCell) {
      this._isHoldingAShip = false; // reset; pass only once
      this._removeShip(this._grabbedShip);
      this._hideAllShipPopups();
    }
  }

  _bodyMouseUpHandler(e) {
    this._isHoldingAShip = false; // reset
    this._hideAllShipPopups();

    const shipJustClicked = this._grabbedShip && elementHasClassName(e.target, "ship") && e.target.id === this._grabbedShip;
    const shipDraggedOnUserBoardCell = this._grabbedShip && getElementAncestor(e.target, ".board--user") && e.target.nodeName === "TD";
    const shipDraggedOutsideUserBoardCell = this._grabbedShip && this._prevGrabbedShipOrigin;

    if (shipJustClicked) {
      const grabbedShipPopup = e.target.firstChild;
      showElement(grabbedShipPopup);
    } else if (shipDraggedOnUserBoardCell) {
      const cellRow = getElementAncestor(e.target, "tr").rowIndex;
      const cellColumn = e.target.cellIndex;

      this.runFuncBasedOnShipOrientation(
        this._grabbedShip,
        () => (this._grabbedShipNewOrigin = [cellRow, cellColumn - this._grabbedShipSegmentIndexUnderCursor]),
        () => (this._grabbedShipNewOrigin = [cellRow - this._grabbedShipSegmentIndexUnderCursor, cellColumn])
      );

      this._adjustGrabbedShipNewOriginToPlaceShipInsideBoard();

      if (!this._grabbedShipOverlapOtherShips()) this._addGrabbedShipToOrigin(this._grabbedShipNewOrigin);
      else if (this._prevGrabbedShipOrigin) this._addGrabbedShipToOrigin(this._prevGrabbedShipOrigin);
    } else if (shipDraggedOutsideUserBoardCell) this._addGrabbedShipToOrigin(this._prevGrabbedShipOrigin);

    this._updateFinishSetupButtonVisibility();

    this._grabbedShip = this._prevGrabbedShipOrigin = null; // reset
  }

  _randomizeBoardButtonHandler() {
    this._resetPlacedShips();
    this._randomizeShips();
    this._hideAllShipPopups();

    this._updateFinishSetupButtonVisibility();

    this._grabbedShip = null; // reset
  }

  _resetBoardButtonHandler() {
    this._resetPlacedShips();

    this._updateFinishSetupButtonVisibility();

    this._grabbedShip = null; // reset
  }

  _fixGrabbedShipOutsideBody() {
    const wasPrevGrabbedShipDraggedOutsideBody = this._grabbedShip;
    if (wasPrevGrabbedShipDraggedOutsideBody) {
      const prevGrabbedShipMenuItem = document.querySelector(`.ship-menu__item#${this._grabbedShip}`);
      removeElementState(prevGrabbedShipMenuItem, "placed");
    }
  }

  _getGrabbedShipMiddleSegmentIndex() {
    return Math.ceil(this._getShipLength(this._grabbedShip) / 2) - 1;
  }

  _getGrabbedShipSegmentIndexUnderCursor(e) {
    const grabbedShipElem = document.querySelector(`.ship#${this._grabbedShip}`);
    return this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => Math.ceil((e.clientX - grabbedShipElem.getBoundingClientRect().left) / grabbedShipElem.getBoundingClientRect().height) - 1,
      () => Math.ceil((e.clientY - grabbedShipElem.getBoundingClientRect().top) / grabbedShipElem.getBoundingClientRect().width) - 1
    );
  }

  _addGrabbedShipToOrigin([row, column]) {
    super._addGrabbedShipToOrigin([row, column]);

    const cellElem = document.querySelector(`.board--user`).rows[row].cells[column];
    cellElem.append(this._createShipWithPopup());

    const menuShipElem = document.querySelector(`.ship-menu__item#${this._grabbedShip}`);
    addElementState(menuShipElem, "placed");
  }

  _createShipWithPopup() {
    const newShipObj = super._createShip(this._grabbedShip);
    newShipObj.append(this._createShipPopup());
    return newShipObj;
  }

  _createShipPopup() {
    const rotateSVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.89,10.105C19.676,9.6,19.411,9.11,19.101,8.649l-1.658,1.119c0.238,0.352,0.441,0.727,0.604,1.115 c0.168,0.398,0.297,0.813,0.383,1.23c0.088,0.433,0.133,0.878,0.133,1.324s-0.045,0.893-0.133,1.324 c-0.086,0.418-0.214,0.831-0.384,1.231c-0.162,0.386-0.365,0.761-0.603,1.112c-0.234,0.347-0.505,0.674-0.803,0.973 c-0.297,0.297-0.624,0.566-0.973,0.802c-0.352,0.238-0.726,0.441-1.114,0.604c-0.395,0.167-0.809,0.296-1.229,0.383 c-0.864,0.175-1.786,0.175-2.646,0c-0.422-0.087-0.837-0.216-1.233-0.384c-0.387-0.163-0.761-0.366-1.113-0.604 c-0.347-0.233-0.673-0.503-0.971-0.8c-0.299-0.3-0.569-0.628-0.803-0.973c-0.237-0.351-0.44-0.726-0.605-1.115 c-0.167-0.396-0.295-0.809-0.382-1.23c-0.088-0.431-0.133-0.876-0.133-1.323c0-0.447,0.045-0.892,0.134-1.324 c0.086-0.42,0.214-0.834,0.381-1.23c0.165-0.39,0.369-0.765,0.605-1.114c0.234-0.347,0.504-0.674,0.802-0.972 C7.656,8.5,7.983,8.23,8.332,7.995c0.35-0.236,0.725-0.44,1.114-0.605c0.395-0.167,0.81-0.296,1.23-0.382 C10.783,6.986,10.892,6.976,11,6.959V10l5-4l-5-4v2.938C10.757,4.967,10.514,5,10.275,5.049c-0.55,0.113-1.092,0.281-1.608,0.5 c-0.509,0.215-0.999,0.481-1.455,0.79C6.758,6.645,6.332,6.996,5.945,7.383C5.557,7.771,5.206,8.197,4.9,8.649 c-0.309,0.457-0.574,0.946-0.79,1.455c-0.219,0.518-0.387,1.059-0.499,1.608c-0.116,0.563-0.174,1.144-0.174,1.726 c0,0.582,0.059,1.162,0.174,1.725c0.113,0.551,0.281,1.092,0.499,1.607c0.215,0.509,0.481,0.999,0.79,1.456 c0.305,0.45,0.656,0.876,1.045,1.268c0.389,0.388,0.814,0.739,1.265,1.043c0.459,0.311,0.949,0.577,1.456,0.79 c0.516,0.218,1.057,0.387,1.609,0.5C10.839,21.941,11.419,22,12,22c0.581,0,1.161-0.059,1.727-0.174 c0.551-0.114,1.092-0.282,1.604-0.499c0.507-0.213,0.998-0.479,1.457-0.79c0.453-0.306,0.879-0.657,1.268-1.046 c0.388-0.389,0.739-0.814,1.045-1.266c0.312-0.462,0.576-0.952,0.788-1.455c0.22-0.52,0.389-1.061,0.5-1.608 c0.115-0.563,0.174-1.144,0.174-1.725c0-0.58-0.059-1.161-0.174-1.725C20.277,11.166,20.108,10.625,19.89,10.105z"/></svg>';
    const removeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 11H19V13H5z"/></svg>';
    const parsedRotateSVG = new DOMParser().parseFromString(rotateSVG, "image/svg+xml").firstChild;
    const parsedRemoveSVG = new DOMParser().parseFromString(removeSVG, "image/svg+xml").firstChild;
    const rotateButton = document.createElement("div");
    const removeButton = document.createElement("div");
    rotateButton.className = "ship__button ship__button--rotate";
    removeButton.className = "ship__button ship__button--remove";
    rotateButton.append(parsedRotateSVG);
    removeButton.append(parsedRemoveSVG);
    rotateButton.addEventListener("click", this._shipRotateButtonHandler);
    removeButton.addEventListener("click", this._shipRemoveButtonHandler);

    const popupObj = document.createElement("div");
    popupObj.className = "ship__popup";
    popupObj.append(rotateButton, removeButton);
    return popupObj;
  }

  _shipRotateButtonHandler(e) {
    this._grabbedShip = getElementAncestor(e.target, ".ship").id;
    this._grabbedShipNewOrigin = this._shipInfo.origin[this._grabbedShip];

    this._removeShip(this._grabbedShip);
    this._changeGrabbedShipInfoToRotate();

    this._adjustGrabbedShipNewOriginToPlaceShipInsideBoard();
    this._adjustGrabbedShipNewOriginToPlaceShipUntoUnoccupiedCells();

    this._addGrabbedShipToOrigin(this._grabbedShipNewOrigin);

    this._grabbedShip = null; //reset
  }

  _shipRemoveButtonHandler(e) {
    const shipToRemove = getElementAncestor(e.target, ".ship").id;
    this._resetShip(shipToRemove);

    this._grabbedShip = null; //reset

    this._updateFinishSetupButtonVisibility();
  }

  _changeGrabbedShipInfoToRotate() {
    this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => {
        this._shipInfo.orientation[this._grabbedShip] = "v";

        this._grabbedShipNewOrigin[0] -= this._getGrabbedShipMiddleSegmentIndex();
        this._grabbedShipNewOrigin[1] += this._getGrabbedShipMiddleSegmentIndex();
      },
      () => {
        this._shipInfo.orientation[this._grabbedShip] = "h";

        this._grabbedShipNewOrigin[0] += this._getGrabbedShipMiddleSegmentIndex();
        this._grabbedShipNewOrigin[1] -= this._getGrabbedShipMiddleSegmentIndex();
      }
    );
  }

  _resetShip(ship) {
    this._removeShip(ship);

    this._shipInfo.orientation[ship] = "h";

    const menuShipElem = document.querySelector(`.ship-menu__item#${ship}`);
    removeElementState(menuShipElem, "placed");
  }

  _removeShip(ship) {
    // remove handlers to prevent memory leaks
    const rotateButton = document.querySelector(`.ship#${ship} .ship__button--rotate`);
    const removeButton = document.querySelector(`.ship#${ship} .ship__button--remove`);
    rotateButton.removeEventListener("click", this._shipRotateButtonHandler);
    removeButton.removeEventListener("click", this._shipRemoveButtonHandler);

    const shipElem = document.querySelector(`.ship#${ship}`);
    shipElem.remove();

    let [row, column] = this._shipInfo.origin[ship];
    this.runFuncBasedOnShipOrientation(
      ship,
      () => {
        for (let i = 0; i < this._getShipLength(ship); i++) this._shipPlacementTable[row][column + i] = 0;
      },
      () => {
        for (let i = 0; i < this._getShipLength(ship); i++) this._shipPlacementTable[row + i][column] = 0;
      }
    );

    this._shipInfo.origin[ship] = null;
  }

  _resetPlacedShips() {
    for (let ship of this._shipNames) {
      const isShipPlaced = this._shipInfo.origin[ship];
      if (isShipPlaced) this._resetShip(ship);
    }
  }

  _hideAllShipPopups() {
    const shipPopupElems = document.querySelectorAll(`.ship__popup`) || null;
    if (shipPopupElems.length) shipPopupElems.forEach((popup) => hideElement(popup));
  }

  _updateFinishSetupButtonVisibility() {
    if (this.allShipsPlaced()) showElement(finishGameSetupButton);
    else hideElement(finishGameSetupButton);
  }
}
