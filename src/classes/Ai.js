class Ai extends PlayerSetup {
  constructor(board) {
    super(board);

    this._probabilityTable;
    this._isTrackMode = false;

    this._randomizeShips();
  }

  getProbabilityTable() {
    return this._probabilityTable;
  }

  autoShoot(userInstance) {
    const [row, column] = this._getRandomShootCoords();
    super.shoot(userInstance, [row, column]);

    this._updateTrackModeState();

    this.updateProbabilityTable(userInstance.getSailingShips());
  }

  updateEnemyShotsDisplay(shotsTable, shipHit = null) {
    super.updateEnemyShotsDisplay(shotsTable);

    if (shipHit && this.isShipSunk(shipHit)) {
      const [shipOriginRow, shipOriginColumn] = this._shipInfo.origin[shipHit];
      const shipOriginCell = this.boardElem.rows[shipOriginRow].cells[shipOriginColumn];
      shipOriginCell.append(this._createShipElem(shipHit, { sunk: true }));
    }
  }

  updateProbabilityTable(shipsToSearch) {
    this._probabilityTable = Array(10)
      .fill()
      .map(() => Array(10).fill(1));

    this.shortestShipToSearch = shipsToSearch[shipsToSearch.length - 1];

    for (let ship of shipsToSearch) {
      this._addProbabilityForShipByOrientation(ship, "h");
      this._addProbabilityForShipByOrientation(ship, "v");
    }

    updateProbabilityDisplay();
  }

  _updateTrackModeState() {
    this._isTrackMode = this._shotsTable.flat().includes("x");

    addElementState(multiplierIncreaserInput.parentNode, "inactive");
    let hits = 0;
    for (let shot of this._shotsTable.flat()) {
      if (shot === "x") hits++;
      if (hits > 1) {
        removeElementState(multiplierIncreaserInput.parentNode, "inactive");
        break;
      }
    }
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

        let multiplier = baseProbabilityMultiplier;
        if (this._isTrackMode) {
          const connectedHits = this._getConnectedHitsOnPresumedShipLocation(ship, [row, column], orientation);
          if (connectedHits === 0) continue;
          if (connectedHits > 1) {
            const multiplierIncreaser = trackModeMultiplierIncreaser * connectedHits - 1;
            multiplier = baseProbabilityMultiplier * multiplierIncreaser;
          }
        }

        for (let segment = 0; segment < shipLength; segment++) {
          const [segmentRow, segmentColumn] = this._getSegmentCell([row, column], segment, orientation);

          const segmentCellNearHit = this._isCellNearHit([segmentRow, segmentColumn]);
          const segmentCellIsHit = this._shotsTable[segmentRow][segmentColumn] === "x";
          if (this._isTrackMode && (segmentCellIsHit || !segmentCellNearHit)) continue;

          if (!this._isTrackMode && hasParityFilter && !this._cellPassesParityFilter([segmentRow, segmentColumn])) continue;
          this.increaseCellProbability([segmentRow, segmentColumn], multiplier);
        }
      }
    }
  }

  _presumedShipLocationOverlapMissOrSunkenShots(ship, [row, column], orientation) {
    const shipLength = this._shipInfo.length[ship];
    return this.runFunctionByShipOrientation(
      orientation,
      () => {
        const presumedShipLocationShots = this._shotsTable[row].slice(column, column + shipLength);
        return presumedShipLocationShots.includes(1) || presumedShipLocationShots.includes("o");
      },
      () => {
        for (let i = row; i < row + shipLength; i++) if (this._shotsTable[i][column] === 1 || this._shotsTable[i][column] === "o") return true;
        return false;
      }
    );
  }

  _getConnectedHitsOnPresumedShipLocation(ship, [row, column], orientation) {
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

  _getSegmentCell([row, column], segment, orientation) {
    return this.runFunctionByShipOrientation(
      orientation,
      () => [row, column + segment],
      () => [row + segment, column]
    );
  }

  _isCellNearHit([row, column]) {
    // horizontally
    let columnFloor = column - 1 >= 0 ? column - 1 : 0;
    let columnCeil = column + 2 <= 10 ? column + 2 : 10;
    if (this._shotsTable[row].slice(columnFloor, columnCeil).includes("x")) return true;

    // vertically
    let rowFloor = row - 1 >= 0 ? row - 1 : 0;
    let rowCeil = row + 2 <= 10 ? row + 2 : 10;
    for (let i = rowFloor; i < rowCeil; i++) if (this._shotsTable[i][column] === "x") return true;
    return false;
  }

  _cellPassesParityFilter([row, column]) {
    return (row - column) % this._shipInfo.length[this.shortestShipToSearch] === 0;
  }

  increaseCellProbability([row, column], multiplier) {
    this._probabilityTable[row][column] = Number((this._probabilityTable[row][column] * multiplier).toFixed(2));
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
        if (this._probabilityTable[i][j] === 1) continue;
        random -= this._probabilityTable[i][j] * 1000;
        if (random <= 0) return [i, j];
      }
    }
  }
}
