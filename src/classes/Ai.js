class Ai extends Player {
  constructor(board) {
    super(board);

    this.densityTable;
  }

  displayEnemyShot(shipHit, row, column) {
    super.displayEnemyShot(shipHit, row, column);

    const cell = this.tableEl.rows[row].cells[column];
    cell.classList.add("shot");

    if (this.shipInfo.length[shipHit] === 0) {
      const shipOrigin = this.shipInfo.origin[shipHit];
      const shipOriginCell = this.tableEl.rows[shipOrigin[0]].cells[shipOrigin[1]];
      this.selectedShip = shipHit;
      shipOriginCell.append(this.createShip({ wrecked: true }));
    }
  }

  updateDensityTable() {
    this.densityTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));

    for (let ship of shipNames) {
      const shipLength = this.shipInfo.length[ship];
      if (shipLength === 0) continue;

      for (let row = 0; row < 10; row++) {
        for (let column = 0; column <= 10 - this.shipInfo.length[ship]; column++) {
          if (this.doesShipOverlapShots(shipLength, "h", [row, column])) continue;
          for (let segment = 0; segment < this.shipInfo.length[ship]; segment++) this.densityTable[row][column + segment]++;
        }
      }

      for (let row = 0; row <= 10 - this.shipInfo.length[ship]; row++) {
        for (let column = 0; column < 10; column++) {
          if (this.doesShipOverlapShots(shipLength, "v", [row, column])) continue;
          for (let segment = 0; segment < this.shipInfo.length[ship]; segment++) this.densityTable[row + segment][column]++;
        }
      }
    }

    displayProbDensity();
  }

  doesShipOverlapShots(shipLength, orientation, [row, column]) {
    if (orientation == "h") return !this.shotsTable[row].slice(column, column + shipLength).every((cell) => cell == 0);
    else for (let i = row; i < row + shipLength; i++) if (this.shotsTable[i][column]) return true;
    return false;
  }
}
