class Ai extends PlayerSetup {
  constructor(board) {
    super(board);

    this._probabilityTable;
    this._trackMode = false;

    this.baseProbabilityMultiplier = 1.2;
    this.trackingProbabilityMultiplier = 1.8;
    this.showProbabilityDisplay = true;

    this._randomizeShips();
  }

  getProbabilityTable() {
    return this._probabilityTable;
  }

  autoShoot(userInstance) {
    const [row, column] = this._getRandomShootCoords();
    super.shoot(userInstance, [row, column]);

    const shipHit = userInstance.getShipOnCell([row, column]);

    if (shipHit && userInstance.shipSunk(shipHit)) {
      this._removeHitsOfSunkenShipInShotsTable(user.getSunkenShipInfo(shipHit));
      this._trackMode = false;
    } else if (shipHit) this._trackMode = true;

    this.updateProbabilityTable(userInstance.getShipsToSearch());
  }

  displayEnemyShot(shipHit, [row, column]) {
    super.displayEnemyShot(shipHit, [row, column]);

    const cell = this._tableElem.rows[row].cells[column];
    addElementState(cell, "shot");

    if (this.shipSunk(shipHit)) {
      const [shipOriginRow, shipOriginColumn] = this._shipInfo.origin[shipHit];
      const shipOriginCell = this._tableElem.rows[shipOriginRow].cells[shipOriginColumn];
      shipOriginCell.append(this._createShip(shipHit, { sunk: true }));
    }
  }

  updateProbabilityTable(shipsToSearch) {
    this._probabilityTable = Array(10)
      .fill()
      .map(() => Array(10).fill(1));

    for (let ship of shipsToSearch) {
      const shipLength = this._shipInfo.length[ship];
      this._addProbabilityForShipByOrientation(ship, "h");
      this._addProbabilityForShipByOrientation(ship, "v");
    }

    if (this.showProbabilityDisplay) displayProbability();
  }

  _removeHitsOfSunkenShipInShotsTable(sunkenShipInfo) {
    const [row, column] = sunkenShipInfo.origin;
    this.runFunctionByShipOrientation(
      sunkenShipInfo.orientation,
      () => {
        for (let i = 0; i < sunkenShipInfo.length; i++) this._shotsTable[row][column + i] = 1;
      },
      () => {
        for (let i = 0; i < sunkenShipInfo.length; i++) this._shotsTable[row + i][column] = 1;
      }
    );
  }

  _addProbabilityForShipByOrientation(ship, orientation) {
    const shipLength = this._shipInfo.length[ship];

    let maxRow = 9;
    let maxColumn = 9;
    this.runFunctionByShipOrientation(
      orientation,
      () => (maxColumn -= shipLength - 1),
      () => (maxRow -= shipLength - 1)
    );

    for (let row = 0; row <= maxRow; row++) {
      for (let column = 0; column <= maxColumn; column++) {
        if (this._presumedShipLocationOverlapMissOrSunkenShots(ship, [row, column], orientation)) continue;

        let multiplier = this.baseProbabilityMultiplier;
        const connectedHitShots = this._getConnectedHitShotsOnPresumedShipLocation(ship, [row, column], orientation);
        if (this._trackMode && connectedHitShots > 1) multiplier = this.trackingProbabilityMultiplier ** connectedHitShots;

        for (let segment = 0; segment < shipLength; segment++) {
          let [segmentRow, segmentColumn] = [row, column];
          if (orientation === "h") segmentColumn += segment;
          else if (orientation === "v") segmentRow += segment;

          if (this._trackMode && (this._shotsTable[segmentRow][segmentColumn] === "x" || !this.cellNearHit([segmentRow, segmentColumn]))) continue;
          this.increaseCellProbability([segmentRow, segmentColumn], multiplier);
        }
      }
    }
  }

  cellNearHit([row, column]) {
    // horizontally
    let columnFloor = column - 1 >= 0 ? column - 1 : 0;
    let columnCeil = column + 2 <= 10 ? column + 2 : 10;
    if (this._shotsTable[row].slice(columnFloor, columnCeil).some((cell) => cell === "x")) return true;

    // vertically
    let rowFloor = row - 1 >= 0 ? row - 1 : 0;
    let rowCeil = row + 2 <= 10 ? row + 2 : 10;
    for (let i = rowFloor; i < rowCeil; i++) if (this._shotsTable[i][column] === "x") return true;

    return false;
  }

  increaseCellProbability([row, column], multiplier) {
    this._probabilityTable[row][column] = Number((this._probabilityTable[row][column] * multiplier).toFixed(2));
  }

  _presumedShipLocationOverlapMissOrSunkenShots(ship, [row, column], orientation) {
    const shipLength = this._shipInfo.length[ship];
    return this.runFunctionByShipOrientation(
      orientation,
      () => this._shotsTable[row].slice(column, column + shipLength).some((cell) => cell === 1),
      () => {
        for (let i = row; i < row + shipLength; i++) if (this._shotsTable[i][column] === 1) return true;
        return false;
      }
    );
  }

  _getConnectedHitShotsOnPresumedShipLocation(ship, [row, column], orientation) {
    const shipLength = this._shipInfo.length[ship];
    return this.runFunctionByShipOrientation(
      orientation,
      () => this._shotsTable[row].slice(column, column + shipLength).filter((cell) => cell === "x").length,
      () => {
        let connectedHits = 0;
        for (let i = row; i < row + shipLength; i++) if (this._shotsTable[i][column] === "x") connectedHits++;
        return connectedHits;
      }
    );
  }

  _getRandomShootCoords() {
    // variables are multiplied by 1000 to fix floating point math errors

    const probabilityTotal = this._probabilityTable.flat().reduce((accum, curr) => {
      if (curr === 1) return accum; // 1 is the initial probability value
      return accum + curr * 1000;
    }, 0); // so value at _probabilityTable[0][0] will also be multiplied by 1000

    let random = Math.ceil(Math.random() * probabilityTotal);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this._probabilityTable[i][j] == 1) continue;
        random -= this._probabilityTable[i][j] * 1000;
        if (random <= 0) return [i, j];
      }
    }
  }
}
