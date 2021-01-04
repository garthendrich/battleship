class PlayerSetup extends Player {
  constructor(board) {
    super(board);
  }

  _getDraggedShipLength() {
    return this._shipInfo.length[this._draggedShip];
  }

  // to avoid ship going outside board
  _adjustShipOriginToInsideBoard() {
    let [row, column] = this._newShipOrigin;
    this.runByDraggedShipOrientation(
      () => {
        const shipFirstColumn = column;
        const shipLastColumn = column + this._getDraggedShipLength() - 1;

        if (shipFirstColumn < 0) column = 0;
        else if (shipLastColumn > 9) column = 10 - this._getDraggedShipLength();
        else column = shipFirstColumn;
      },
      () => {
        const shipFirstRow = row;
        const shipLastRow = row + this._getDraggedShipLength() - 1;

        if (shipFirstRow < 0) row = 0;
        else if (shipLastRow > 9) row = 10 - this._getDraggedShipLength();
        else row = shipFirstRow;
      }
    );

    this._newShipOrigin = [row, column];
  }

  // for rotate, to prevent overlapping with other ships
  _adjustShipOriginToAvailableSpace() {
    const [shipForwardDir, shipSidewayDir] = this.runByDraggedShipOrientation(
      // 0: row, 1: column
      () => [1, 0],
      () => [0, 1]
    );

    let firstIndex = this._newShipOrigin[shipForwardDir];
    let highestIndex = 10 - this._getDraggedShipLength();
    while (this._draggedShipOverlapOtherShips()) {
      this._newShipOrigin[shipForwardDir]++;
      this._newShipOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index in shipForwardDir axis is checked, move to next line
      if (this._newShipOrigin[shipForwardDir] == firstIndex)
        this._newShipOrigin[shipSidewayDir] == 9 ? (this._newShipOrigin[shipSidewayDir] = 0) : this._newShipOrigin[shipSidewayDir]++;
    }
  }

  _draggedShipOverlapOtherShips() {
    const [row, column] = this._newShipOrigin;
    return this.runByDraggedShipOrientation(
      () => !this.shipPlacementTable[row].slice(column, column + this._getDraggedShipLength()).every((cell) => cell == 0),
      () => {
        for (let i = row; i < row + this._getDraggedShipLength(); i++) if (this.shipPlacementTable[i][column]) return true;
        return false;
      }
    );
  }

  _addDraggedShipToOrigin([row, column]) {
    this.runByDraggedShipOrientation(
      () => {
        for (let i = 0; i < this._getDraggedShipLength(); i++) this.shipPlacementTable[row][column + i] = this._draggedShip;
      },
      () => {
        for (let i = 0; i < this._getDraggedShipLength(); i++) this.shipPlacementTable[row + i][column] = this._draggedShip;
      }
    );
    this._shipInfo.origin[this._draggedShip] = [row, column];
  }

  _createShip(params = {}) {
    const newShipObj = document.createElement("div");
    this.runByDraggedShipOrientation(
      () => newShipObj.classList.add("ship", "ship--hori"),
      () => newShipObj.classList.add("ship", "ship--vert")
    );
    if (params.sunk) newShipObj.classList.add("ship--sunk");
    newShipObj.id = this._draggedShip;
    return newShipObj;
  }

  _randomizeShips() {
    // randomize orientations
    for (let ship of this.shipNames) this._shipInfo.orientation[ship] = Math.floor(Math.random() * 2) ? "h" : "v";

    // randomize ship cell origins
    for (let i = 0; i < 5; i++) {
      do {
        this._draggedShip = this.shipNames[i];
        this._newShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this._adjustShipOriginToInsideBoard();
      } while (this._draggedShipOverlapOtherShips());
      this._addDraggedShipToOrigin(this._newShipOrigin);
    }
  }
}
