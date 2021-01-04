class Player {
  constructor(boardName) {
    this.tableEl = document.querySelector(boardName);
    this.tableEl.innerHTML = `<tr>${"<td></td>".repeat(10)}</tr>`.repeat(10);

    this._shipPlacementTable = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this._shotsTable = Array(10)
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
  }

  runFuncBasedOnShipOrientation(ship, horizontalFunction, verticalFunction) {
    const orientation = this._shipInfo.orientation[ship];
    if (orientation === "h") return horizontalFunction();
    else if (orientation === "v") return verticalFunction();
  }

  getShipPlacementTable() {
    return this._shipPlacementTable;
  }

  getShotsTable() {
    return this._shotsTable;
  }

  shoot(enemyInstance, [row, column]) {
    const shipHit = enemyInstance.shipPlacementTable[row][column];
    if (shipHit) {
      enemyInstance.shipInfo.status[shipHit]--;
      enemyInstance.shipSegments--;
      this._shotsTable[row][column] = "x";
    } else {
      this._shotsTable[row][column] = 1;
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
