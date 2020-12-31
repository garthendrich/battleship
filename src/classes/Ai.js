class Ai extends Player {
  constructor(board) {
    super(board);

    this.densityTable;
    this.densityMultiplier = 1.2;
  }

  // * game fight ----------------------------------------------------------------

  displayEnemyShot(shipHit, row, column) {
    super.displayEnemyShot(shipHit, row, column);

    const cell = this.tableEl.rows[row].cells[column];
    cell.classList.add("shot");

    if (this.shipInfo.length[shipHit] === 0) {
      const shipOrigin = this.shipInfo.origin[shipHit];
      const shipOriginCell = this.tableEl.rows[shipOrigin[0]].cells[shipOrigin[1]];
      this.selectedShip = shipHit;
      shipOriginCell.append(this.createShip({ sunk: true }));
    }
  }

  shoot(userInstance) {
    super.shoot(userInstance, this.getRandomShootCoords());
    this.updateDensityTable();
  }

  updateDensityTable() {
    this.densityTable = Array(10)
      .fill()
      .map(() => Array(10).fill(1));

    for (let ship of shipNames) {
      const shipLength = this.shipInfo.length[ship];
      if (shipLength === 0) continue;

      this.addDensityForShip(shipLength, "h");
      this.addDensityForShip(shipLength, "v");
    }

    displayProbDensity();
  }

  addDensityForShip(shipLength, orientation) {
    let maxRow = 9;
    let maxColumn = 9;
    if (orientation === "h") maxColumn -= shipLength - 1;
    else if (orientation === "v") maxRow -= shipLength - 1;

    for (let row = 0; row <= maxRow; row++) {
      for (let column = 0; column <= maxColumn; column++) {
        if (this.doesShipOverlapShots(shipLength, orientation, [row, column])) continue;
        for (let segment = 0; segment < shipLength; segment++) {
          if (orientation === "h") this.increaseDensity(row, column + segment);
          else if (orientation === "v") this.increaseDensity(row + segment, column);
        }
      }
    }
  }

  increaseDensity(row, column) {
    this.densityTable[row][column] *= this.densityMultiplier;
  }

  doesShipOverlapShots(shipLength, orientation, [row, column]) {
    if (orientation == "h") return this.shotsTable[row].slice(column, column + shipLength).some((cell) => cell == 1);
    else for (let i = row; i < row + shipLength; i++) if (this.shotsTable[i][column]) return true;
    return false;
  }

  getRandomShootCoords() {
    const densityTotal = this.densityTable.flat().reduce((total, curr) => total + curr);
    let random = Math.ceil(Math.random() * densityTotal);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        random -= this.densityTable[i][j];
        if (random <= 0) return [i, j];
      }
    }
  }
}
