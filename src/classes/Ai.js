class Ai extends Player {
  constructor(board) {
    super(board);

    this.probabilityTable;
    this.trackMode = false;

    this.probabilityMultiplier = 1.2;
    this.trackingProbabilityMultiplier = 1.5;
    this.showProbabilityDisplay = true;
  }

  // * game fight ----------------------------------------------------------------

  displayEnemyShot(shipHit, row, column) {
    super.displayEnemyShot(shipHit, row, column);

    const cell = this.tableEl.rows[row].cells[column];
    cell.classList.add("shot");

    if (this.shipSunk(shipHit)) {
      const shipOrigin = this.shipInfo.origin[shipHit];
      const shipOriginCell = this.tableEl.rows[shipOrigin[0]].cells[shipOrigin[1]];
      this.selectedShip = shipHit;
      shipOriginCell.append(this.createShip({ sunk: true }));
    }
  }

  shoot(userInstance) {
    const [row, column] = this.getRandomShootCoords();
    super.shoot(userInstance, [row, column]);

    const shipHit = userInstance.shipPlacementTable[row][column];

    if (userInstance.shipSunk(shipHit)) {
      const orientation = user.shipInfo.orientation[shipHit];
      const [sunkenOriginRow, sunkenOriginColumn] = user.shipInfo.origin[shipHit];
      if (orientation === "h") {
        for (let i = 0; i < user.shipInfo.length[shipHit]; i++) this.shotsTable[sunkenOriginRow][sunkenOriginColumn + i] = 1;
      } else if (orientation === "v") {
        for (let i = 0; i < user.shipInfo.length[shipHit]; i++) this.shotsTable[sunkenOriginRow + i][sunkenOriginColumn] = 1;
      }
    }

    if (shipHit) this.trackMode = this.getTrackModeState();

    this.updateProbabilityTable(userInstance);

    console.log(userInstance.shipInfo.status);
    console.table(this.shotsTable);
    console.table(this.probabilityTable);
  }

  getTrackModeState() {
    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        if (this.shotsTable[row][column] === "x") return true;
      }
    }
    return false;
  }

  updateProbabilityTable(userInstance) {
    this.probabilityTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));

    for (let ship of shipNames) {
      if (userInstance.shipSunk(ship)) continue;

      const shipLength = this.shipInfo.length[ship];
      this.addProbabilityForShip(shipLength, "h");
      this.addProbabilityForShip(shipLength, "v");
    }

    if (this.showProbabilityDisplay) displayProbability();
  }

  addProbabilityForShip(shipLength, orientation) {
    let maxRow = 9;
    let maxColumn = 9;
    if (orientation === "h") maxColumn -= shipLength - 1;
    else if (orientation === "v") maxRow -= shipLength - 1;

    for (let row = 0; row <= maxRow; row++) {
      for (let column = 0; column <= maxColumn; column++) {
        if (this.doesShipOverlapNonhitShots(shipLength, orientation, [row, column])) continue;

        let increaseProbTimes = 1;
        if (this.trackMode) {
          increaseProbTimes = this.getOverlappingHitShots(shipLength, orientation, [row, column]);
          if (increaseProbTimes === 0) continue;
        }

        for (let segment = 0; segment < shipLength; segment++) {
          let [segmentRow, segmentColumn] = [row, column];
          if (orientation === "h") segmentColumn += segment;
          else if (orientation === "v") segmentRow += segment;

          if (this.trackMode && (this.shotsTable[segmentRow][segmentColumn] === "x" || !this.cellNearHit([segmentRow, segmentColumn]))) continue;
          // if (this.trackMode) {
          //   displayPresumedShipAndProbIncrease(shipLength, orientation, [row, column], [segmentRow, segmentColumn]);
          //   debugger;
          // }
          this.increaseCellProbability(
            [segmentRow, segmentColumn],
            this.trackMode && increaseProbTimes > 1 ? this.trackingProbabilityMultiplier ** increaseProbTimes : 1
          );
        }
      }
    }
  }

  cellNearHit([row, column]) {
    // horizontally
    let columnFloor = column - 1 >= 0 ? column - 1 : 0;
    let columnCeil = column + 2 <= 10 ? column + 2 : 10;
    if (this.shotsTable[row].slice(columnFloor, columnCeil).some((cell) => cell === "x")) return true;

    // vertically
    let rowFloor = row - 1 >= 0 ? row - 1 : 0;
    let rowCeil = row + 2 <= 10 ? row + 2 : 10;
    for (let i = rowFloor; i < rowCeil; i++) if (this.shotsTable[i][column] === "x") return true;

    return false;
  }

  increaseCellProbability([row, column], times) {
    for (let i = 0; i < times; i++) {
      if (this.probabilityTable[row][column] === 0) this.probabilityTable[row][column] = 1;
      else this.probabilityTable[row][column] = Number((this.probabilityTable[row][column] * this.probabilityMultiplier).toFixed(2));
    }
  }

  doesShipOverlapNonhitShots(shipLength, orientation, [row, column]) {
    if (orientation == "h") return this.shotsTable[row].slice(column, column + shipLength).some((cell) => cell === 1);
    else if (orientation == "v") for (let i = row; i < row + shipLength; i++) if (this.shotsTable[i][column] === 1) return true;
    return false;
  }

  getOverlappingHitShots(shipLength, orientation, [row, column]) {
    let count = 0;
    if (orientation == "h") return this.shotsTable[row].slice(column, column + shipLength).filter((cell) => cell === "x").length;
    else if (orientation == "v") for (let i = row; i < row + shipLength; i++) if (this.shotsTable[i][column] === "x") count++;
    return count;
  }

  getRandomShootCoords() {
    // variables are multiplied by 1000 to fix floating point math errors

    const probabilityTotal = this.probabilityTable.flat().reduce((accum, curr) => {
      return accum + curr * 1000;
    }, 0); // so value at probabilityTable[0][0] will also be multiplied by 1000

    let random = Math.ceil(Math.random() * probabilityTotal);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        random -= this.probabilityTable[i][j] * 1000;
        if (random <= 0) return [i, j];
      }
    }
  }
}
