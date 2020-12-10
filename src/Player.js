"use strict";

class Player {
  constructor() {
    this.shipDataTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shotDataTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shipOrigin = {
      // [row, column]
      c: null,
      b: null,
      d: null,
      s: null,
      p: null,
    };
    this.shipOrientation = {
      c: "h",
      b: "h",
      d: "h",
      s: "h",
      p: "h",
    };
    this.shipLength = {
      c: 5,
      b: 4,
      d: 3,
      s: 3,
      p: 2,
    };

    this.selectedShip;
    this.newShipOrigin;
  }

  runBySelectedShipOrientation(h, v) {
    return this.shipOrientation[this.selectedShip] == "h" ? h() : v();
  }

  getSelectedShipLength() {
    return this.shipLength[this.selectedShip];
  }

  // to avoid ship going outside board
  adjustShipOriginToInsideBoard(shipPoint) {
    const middleOfShip = Math.round(this.getSelectedShipLength() / 2);
    if (!shipPoint) shipPoint = middleOfShip;

    let [row, column] = this.newShipOrigin;
    this.runBySelectedShipOrientation(
      () => {
        // adjust column
        const firstShipColumn = column - (shipPoint - 1);
        const lastShipColumn = column - shipPoint + this.getSelectedShipLength();

        if (lastShipColumn > 9) column = 9 - (this.getSelectedShipLength() - 1);
        else if (firstShipColumn < 0) column = 0;
        else column = firstShipColumn;
      },
      () => {
        // adjust row
        const firstShipRow = row - (shipPoint - 1);
        const lastShipRow = row - shipPoint + this.getSelectedShipLength();

        if (lastShipRow > 9) row = 9 - (this.getSelectedShipLength() - 1);
        else if (firstShipRow < 0) row = 0;
        else row = firstShipRow;
      }
    );

    this.newShipOrigin = [row, column];
  }

  // to prevent overlapping with other ships
  adjustShipOriginToAvailableSpace() {
    let shipForwardDir, shipSidewayDir;
    this.runBySelectedShipOrientation(
      // 0: row, 1: column
      () => ([shipForwardDir, shipSidewayDir] = [1, 0]),
      () => ([shipForwardDir, shipSidewayDir] = [0, 1])
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
      () => this.shipDataTable[row].slice(column, column + this.getSelectedShipLength()).includes(1),
      () => {
        for (let i = row; i < row + this.getSelectedShipLength(); i++) if (this.shipDataTable[i][column] == 1) return true;
        return false;
      }
    );
  }

  addShipToDataTable([row, column]) {
    this.runBySelectedShipOrientation(
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipDataTable[row][column + i] = 1;
      },
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipDataTable[row + i][column] = 1;
      }
    );
    this.shipOrigin[this.selectedShip] = [row, column];
  }

  randomizeShips() {
    // randomize orientations
    for (let ship of shipNames) this.shipOrientation[ship] = Math.floor(Math.random() * 2) ? "h" : "v";

    // randomize ship cell origins
    for (let i = 0; i < 5; i++) {
      do {
        this.newShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this.selectedShip = shipNames[i];
        this.adjustShipOriginToInsideBoard();
      } while (this.doesSelectedShipOverlapOthers());
      addShip();
    }
  }
}
