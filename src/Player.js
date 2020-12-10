"use strict";

class Player {
  constructor() {
    this.shipsTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.shotsTable = Array(10)
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
    this.selectedShipOrigin;
  }

  runBySelectedShipOrientation(h, v) {
    return this.shipOrientation[this.selectedShip] == "h" ? h() : v();
  }

  getSelectedShipLength() {
    return this.shipLength[this.selectedShip];
  }

  // adjust ship cell origin to avoid ship outside board
  adjustShipCellOriginToInsideBoard(shipPoint) {
    const middleOfShip = Math.round(this.getSelectedShipLength() / 2);
    if (!shipPoint) shipPoint = middleOfShip;

    let [row, column] = this.selectedShipOrigin;
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

    this.selectedShipOrigin = [row, column];
  }

  // adjust ship cell origin so ship would not overlap with other ships
  adjustShipCellOriginToAvailableSpace() {
    let shipForwardDir, shipSidewayDir;
    this.runBySelectedShipOrientation(
      // 0: row, 1: column
      () => ([shipForwardDir, shipSidewayDir] = [1, 0]),
      () => ([shipForwardDir, shipSidewayDir] = [0, 1])
    );

    let firstIndex = this.selectedShipOrigin[shipForwardDir];
    let highestIndex = 10 - this.getSelectedShipLength();
    while (this.doesSelectedShipOverlapOthers()) {
      this.selectedShipOrigin[shipForwardDir]++;
      this.selectedShipOrigin[shipForwardDir] %= highestIndex + 1; // if ship extends outside board, reset back to 0

      // if every possible index is checked, move to next line
      if (this.selectedShipOrigin[shipForwardDir] == firstIndex)
        this.selectedShipOrigin[shipSidewayDir] == 9 ? (this.selectedShipOrigin[shipSidewayDir] = 0) : this.selectedShipOrigin[shipSidewayDir]++;
    }
  }

  doesSelectedShipOverlapOthers() {
    const [row, column] = this.selectedShipOrigin;
    return this.runBySelectedShipOrientation(
      () => this.shipsTable[row].slice(column, column + this.getSelectedShipLength()).includes(1),
      () => {
        for (let i = row; i < row + this.getSelectedShipLength(); i++) if (this.shipsTable[i][column] == 1) return true;
        return false;
      }
    );
  }

  addShipInDataTable([row, column]) {
    this.runBySelectedShipOrientation(
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipsTable[row][column + i] = 1;
      },
      () => {
        for (let i = 0; i < this.getSelectedShipLength(); i++) this.shipsTable[row + i][column] = 1;
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
        this.selectedShipOrigin = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        this.selectedShip = shipNames[i];
        this.adjustShipCellOriginToInsideBoard();
      } while (this.doesSelectedShipOverlapOthers());
      addShip();
    }
  }
}
