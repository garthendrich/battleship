class PlayerSetup extends Player {
  constructor(board) {
    super(board);
  }

  _getShipLength(ship) {
    return this._shipInfo.length[ship];
  }

  _adjustGrabbedShipNewOriginToPlaceShipInsideBoard() {
    const [originRow, originColumn] = this._grabbedShipNewOrigin;

    this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => {
        const shipLastCellColumn = originColumn + this._getShipLength(this._grabbedShip) - 1;
        const isShipInsideBoard = originColumn >= 0 && shipLastCellColumn <= 9;
        if (isShipInsideBoard) return;

        const shipMostRightOrigin = 10 - this._getShipLength(this._grabbedShip);
        const newOriginColumn = shipLastCellColumn > 9 ? shipMostRightOrigin : 0;
        this._grabbedShipNewOrigin = [originRow, newOriginColumn];
      },
      () => {
        const shipLastCellRow = originRow + this._getShipLength(this._grabbedShip) - 1;
        const isShipInsideBoard = originRow >= 0 && shipLastCellRow <= 9;
        if (isShipInsideBoard) return;

        const shipMostBottomOrigin = 10 - this._getShipLength(this._grabbedShip);
        const newOriginRow = shipLastCellRow > 9 ? shipMostBottomOrigin : 0;
        this._grabbedShipNewOrigin = [newOriginRow, originColumn];
      }
    );
  }

  _adjustGrabbedShipNewOriginToPlaceShipUntoUnoccupiedCells() {
    const [shipForwardDir, shipSidewayDir] = this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      // 0: row, 1: column
      () => [1, 0],
      () => [0, 1]
    );

    let firstIndex = this._grabbedShipNewOrigin[shipForwardDir];
    let highestIndex = 10 - this._getShipLength(this._grabbedShip);
    while (this._grabbedShipOverlapOtherShips(this._grabbedShip, this._grabbedShipNewOrigin)) {
      this._grabbedShipNewOrigin[shipForwardDir]++;
      this._grabbedShipNewOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index in shipForwardDir axis is checked, move to next line
      if (this._grabbedShipNewOrigin[shipForwardDir] == firstIndex)
        this._grabbedShipNewOrigin[shipSidewayDir] == 9
          ? (this._grabbedShipNewOrigin[shipSidewayDir] = 0)
          : this._grabbedShipNewOrigin[shipSidewayDir]++;
    }
  }

  _grabbedShipOverlapOtherShips() {
    const [row, column] = this._grabbedShipNewOrigin;
    return this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => !this._shipPlacementTable[row].slice(column, column + this._getShipLength(this._grabbedShip)).every((cell) => cell == 0),
      () => {
        for (let i = row; i < row + this._getShipLength(this._grabbedShip); i++) if (this._shipPlacementTable[i][column]) return true;
        return false;
      }
    );
  }

  _addGrabbedShipToOrigin([row, column]) {
    this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => {
        for (let i = 0; i < this._getShipLength(this._grabbedShip); i++) this._shipPlacementTable[row][column + i] = this._grabbedShip;
      },
      () => {
        for (let i = 0; i < this._getShipLength(this._grabbedShip); i++) this._shipPlacementTable[row + i][column] = this._grabbedShip;
      }
    );
    this._shipInfo.origin[this._grabbedShip] = [row, column];
  }

  _createShip(params = {}) {
    const newShipObj = document.createElement("div");
    this.runFuncBasedOnShipOrientation(
      this._grabbedShip,
      () => newShipObj.classList.add("ship", "ship--hori"),
      () => newShipObj.classList.add("ship", "ship--vert")
    );
    if (params.sunk) newShipObj.classList.add("ship--sunk");
    newShipObj.id = this._grabbedShip;
    return newShipObj;
  }

  _randomizeShips() {
    // randomize orientations
    for (let ship of this.shipNames) this._shipInfo.orientation[ship] = Math.floor(Math.random() * 2) ? "h" : "v";

    // randomize ship cell origins
    for (let i = 0; i < 5; i++) {
      do {
        this._grabbedShip = this.shipNames[i];
        this._grabbedShipNewOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this._adjustGrabbedShipNewOriginToPlaceShipInsideBoard();
      } while (this._grabbedShipOverlapOtherShips());
      this._addGrabbedShipToOrigin(this._grabbedShipNewOrigin);
    }
  }
}
