class PlayerSetup extends Player {
  constructor(board) {
    super(board);
  }

  _getGrabbedShipLength() {
    return this._shipInfo.length[this._grabbedShip];
  }

  // to avoid ship going outside board
  _adjustShipOriginToInsideBoard() {
    let [row, column] = this._newShipOrigin;
    this.runByGrabbedShipOrientation(
      () => {
        const shipFirstColumn = column;
        const shipLastColumn = column + this._getGrabbedShipLength() - 1;

        if (shipFirstColumn < 0) column = 0;
        else if (shipLastColumn > 9) column = 10 - this._getGrabbedShipLength();
        else column = shipFirstColumn;
      },
      () => {
        const shipFirstRow = row;
        const shipLastRow = row + this._getGrabbedShipLength() - 1;

        if (shipFirstRow < 0) row = 0;
        else if (shipLastRow > 9) row = 10 - this._getGrabbedShipLength();
        else row = shipFirstRow;
      }
    );

    this._newShipOrigin = [row, column];
  }

  // for rotate, to prevent overlapping with other ships
  _adjustShipOriginToAvailableSpace() {
    const [shipForwardDir, shipSidewayDir] = this.runByGrabbedShipOrientation(
      // 0: row, 1: column
      () => [1, 0],
      () => [0, 1]
    );

    let firstIndex = this._newShipOrigin[shipForwardDir];
    let highestIndex = 10 - this._getGrabbedShipLength();
    while (this._grabbedShipOverlapOtherShips()) {
      this._newShipOrigin[shipForwardDir]++;
      this._newShipOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index in shipForwardDir axis is checked, move to next line
      if (this._newShipOrigin[shipForwardDir] == firstIndex)
        this._newShipOrigin[shipSidewayDir] == 9 ? (this._newShipOrigin[shipSidewayDir] = 0) : this._newShipOrigin[shipSidewayDir]++;
    }
  }

  _grabbedShipOverlapOtherShips() {
    const [row, column] = this._newShipOrigin;
    return this.runByGrabbedShipOrientation(
      () => !this.shipPlacementTable[row].slice(column, column + this._getGrabbedShipLength()).every((cell) => cell == 0),
      () => {
        for (let i = row; i < row + this._getGrabbedShipLength(); i++) if (this.shipPlacementTable[i][column]) return true;
        return false;
      }
    );
  }

  _addGrabbedShipToOrigin([row, column]) {
    this.runByGrabbedShipOrientation(
      () => {
        for (let i = 0; i < this._getGrabbedShipLength(); i++) this.shipPlacementTable[row][column + i] = this._grabbedShip;
      },
      () => {
        for (let i = 0; i < this._getGrabbedShipLength(); i++) this.shipPlacementTable[row + i][column] = this._grabbedShip;
      }
    );
    this._shipInfo.origin[this._grabbedShip] = [row, column];
  }

  _createShip(params = {}) {
    const newShipObj = document.createElement("div");
    this.runByGrabbedShipOrientation(
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
        this._newShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this._adjustShipOriginToInsideBoard();
      } while (this._grabbedShipOverlapOtherShips());
      this._addGrabbedShipToOrigin(this._newShipOrigin);
    }
  }
}
