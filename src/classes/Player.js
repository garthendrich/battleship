class Player {
  constructor(boardName) {
    this.tableEl = document.querySelector(boardName);
    this.tableEl.innerHTML = `<tr>${"<td></td>".repeat(10)}</tr>`.repeat(10);

    this.shipPlacementTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shotsTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));

    this._shipInfo = {
      origin: {
        c: null,
        b: null,
        d: null,
        s: null,
        p: null,
      },
      orientation: {
        c: "h",
        b: "h",
        d: "h",
        s: "h",
        p: "h",
      },
      length: {
        c: 5,
        b: 4,
        d: 3,
        s: 3,
        p: 2,
      },
      status: {
        c: 5,
        b: 4,
        d: 3,
        s: 3,
        p: 2,
      },
    };

    this.shipNames = "cbdsp";

    this._selectedShip;
    this._newShipOrigin;

    this.shipSegments = 17;
  }

  runBySelectedShipOrientation(h, v) {
    return this._shipInfo.orientation[this._selectedShip] == "h" ? h() : v();
  }

  // * game setup ----------------------------------------------------------------

  _getSelectedShipLength() {
    return this._shipInfo.length[this._selectedShip];
  }

  // to avoid ship going outside board
  _adjustShipOriginToInsideBoard() {
    let [row, column] = this._newShipOrigin;
    this.runBySelectedShipOrientation(
      () => {
        const shipFirstColumn = column;
        const shipLastColumn = column + this._getSelectedShipLength() - 1;

        if (shipFirstColumn < 0) column = 0;
        else if (shipLastColumn > 9) column = 10 - this._getSelectedShipLength();
        else column = shipFirstColumn;
      },
      () => {
        const shipFirstRow = row;
        const shipLastRow = row + this._getSelectedShipLength() - 1;

        if (shipFirstRow < 0) row = 0;
        else if (shipLastRow > 9) row = 10 - this._getSelectedShipLength();
        else row = shipFirstRow;
      }
    );

    this._newShipOrigin = [row, column];
  }

  // for rotate, to prevent overlapping with other ships
  _adjustShipOriginToAvailableSpace() {
    const [shipForwardDir, shipSidewayDir] = this.runBySelectedShipOrientation(
      // 0: row, 1: column
      () => [1, 0],
      () => [0, 1]
    );

    let firstIndex = this._newShipOrigin[shipForwardDir];
    let highestIndex = 10 - this._getSelectedShipLength();
    while (this._selectedShipOverlapOtherShips()) {
      this._newShipOrigin[shipForwardDir]++;
      this._newShipOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index in shipForwardDir axis is checked, move to next line
      if (this._newShipOrigin[shipForwardDir] == firstIndex)
        this._newShipOrigin[shipSidewayDir] == 9 ? (this._newShipOrigin[shipSidewayDir] = 0) : this._newShipOrigin[shipSidewayDir]++;
    }
  }

  _selectedShipOverlapOtherShips() {
    const [row, column] = this._newShipOrigin;
    return this.runBySelectedShipOrientation(
      () => !this.shipPlacementTable[row].slice(column, column + this._getSelectedShipLength()).every((cell) => cell == 0),
      () => {
        for (let i = row; i < row + this._getSelectedShipLength(); i++) if (this.shipPlacementTable[i][column]) return true;
        return false;
      }
    );
  }

  _addSelectedShipToOrigin([row, column]) {
    this.runBySelectedShipOrientation(
      () => {
        for (let i = 0; i < this._getSelectedShipLength(); i++) this.shipPlacementTable[row][column + i] = this._selectedShip;
      },
      () => {
        for (let i = 0; i < this._getSelectedShipLength(); i++) this.shipPlacementTable[row + i][column] = this._selectedShip;
      }
    );
    this._shipInfo.origin[this._selectedShip] = [row, column];
  }

  _createShip(params = {}) {
    const newShipObj = document.createElement("div");
    this.runBySelectedShipOrientation(
      () => newShipObj.classList.add("ship", "ship--hori"),
      () => newShipObj.classList.add("ship", "ship--vert")
    );
    if (params.sunk) newShipObj.classList.add("ship--sunk");
    newShipObj.id = this._selectedShip;
    return newShipObj;
  }

  _randomizeShips() {
    // randomize orientations
    for (let ship of this.shipNames) this._shipInfo.orientation[ship] = Math.floor(Math.random() * 2) ? "h" : "v";

    // randomize ship cell origins
    for (let i = 0; i < 5; i++) {
      do {
        this._selectedShip = this.shipNames[i];
        this._newShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this._adjustShipOriginToInsideBoard();
      } while (this._selectedShipOverlapOtherShips());
      this._addSelectedShipToOrigin(this._newShipOrigin);
    }
  }

  // * game fight ----------------------------------------------------------------

  shoot(enemyInstance, [row, column]) {
    const shipHit = enemyInstance.shipPlacementTable[row][column];
    if (shipHit) {
      enemyInstance.shipInfo.status[shipHit]--;
      enemyInstance.shipSegments--;
      this.shotsTable[row][column] = "x";
    } else {
      this.shotsTable[row][column] = 1;
    }

    enemyInstance.displayEnemyShot(shipHit, row, column);
  }

  displayEnemyShot(shipHit, row, column) {
    const cell = this.tableEl.rows[row].cells[column];
    if (shipHit) cell.style.background = "#B24B68";
    else cell.style.background = "white";
  }

  shipSunk(ship) {
    return this._shipInfo.status[ship] === 0;
  }

  hasShips() {
    return Object.values(this._shipInfo.status).some((status) => status !== 0);
  }
}
