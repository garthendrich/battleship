class Player {
  constructor(board) {
    this.tableEl = document.querySelector(board);

    this.shipPlacementTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shotsTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));

    this.shipInfo = {
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
    };

    this.selectedShip;
    this.newShipOrigin;

    this.shipSegments = 17;
  }

  runBySelectedShipOrientation(h, v) {
    return this.shipInfo.orientation[this.selectedShip] == "h" ? h() : v();
  }

  getSelectedShipLength() {
    return this.shipInfo.length[this.selectedShip];
  }

  // to avoid ship going outside board
  adjustShipOriginToInsideBoard() {
    let [row, column] = this.newShipOrigin;
    this.runBySelectedShipOrientation(
      () => {
        const shipFirstColumn = column;
        const shipLastColumn = column + this.getSelectedShipLength() - 1;

        if (shipFirstColumn < 0) column = 0;
        else if (shipLastColumn > 9) column = 10 - this.getSelectedShipLength();
        else column = shipFirstColumn;
      },
      () => {
        const shipFirstRow = row;
        const shipLastRow = row + this.getSelectedShipLength() - 1;

        if (shipFirstRow < 0) row = 0;
        else if (shipLastRow > 9) row = 10 - this.getSelectedShipLength();
        else row = shipFirstRow;
      }
    );

    this.newShipOrigin = [row, column];
  }

  // for rotate, to prevent overlapping with other ships
  adjustShipOriginToAvailableSpace() {
    const [shipForwardDir, shipSidewayDir] = this.runBySelectedShipOrientation(
      // 0: row, 1: column
      () => [1, 0],
      () => [0, 1]
    );

    let firstIndex = this.newShipOrigin[shipForwardDir];
    let highestIndex = 10 - this.getSelectedShipLength();
    while (this.doesSelectedShipOverlapOthers()) {
      this.newShipOrigin[shipForwardDir]++;
      this.newShipOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index in shipForwardDir axis is checked, move to next line
      if (this.newShipOrigin[shipForwardDir] == firstIndex)
        this.newShipOrigin[shipSidewayDir] == 9 ? (this.newShipOrigin[shipSidewayDir] = 0) : this.newShipOrigin[shipSidewayDir]++;
    }
  }

  doesSelectedShipOverlapOthers() {
    const [row, column] = this.newShipOrigin;
    return this.runBySelectedShipOrientation(
      () => !this.shipPlacementTable[row].slice(column, column + this.getSelectedShipLength()).every((cell) => cell == 0),
      () => {
        for (let i = row; i < row + this.getSelectedShipLength(); i++) if (this.shipPlacementTable[i][column]) return true;
        return false;
      }
    );
  }

  addSelectedShip([row, column]) {
    this.runBySelectedShipOrientation(
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipPlacementTable[row][column + i] = this.selectedShip;
      },
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipPlacementTable[row + i][column] = this.selectedShip;
      }
    );
    this.shipInfo.origin[this.selectedShip] = [row, column];
  }

  createShip(params = {}) {
    const newShipObj = document.createElement("div");
    this.runBySelectedShipOrientation(
      () => newShipObj.classList.add("ship", "ship--hori"),
      () => newShipObj.classList.add("ship", "ship--vert")
    );
    if (params.wrecked) newShipObj.classList.add("ship--wrecked");
    newShipObj.id = this.selectedShip;
    return newShipObj;
  }

  randomizeShips() {
    // randomize orientations
    for (let ship of shipNames) this.shipInfo.orientation[ship] = Math.floor(Math.random() * 2) ? "h" : "v";

    // randomize ship cell origins
    for (let i = 0; i < 5; i++) {
      do {
        this.selectedShip = shipNames[i];
        this.newShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this.adjustShipOriginToInsideBoard();
      } while (this.doesSelectedShipOverlapOthers());
      this.addSelectedShip(this.newShipOrigin);
    }
  }

  shoot(enemyInstance, row, column) {
    const shipHit = enemyInstance.shipPlacementTable[row][column];
    if (shipHit) {
      enemyInstance.shipInfo.length[shipHit]--;
      enemyInstance.shipSegments--;
    }

    this.shotsTable[row][column] = 1;
    enemyInstance.displayEnemyShot(shipHit, row, column);
  }

  displayEnemyShot(shipHit, row, column) {
    const cell = this.tableEl.rows[row].cells[column];
    if (shipHit) cell.style.background = "#B24B68";
    else cell.style.background = "white";
  }
}
