class Player {
  constructor(boardName) {
    this._boardElem = document.querySelector(boardName);
    this._boardElem.innerHTML = `<tr>${`<td class="cell"></td>`.repeat(10)}</tr>`.repeat(10);

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

    this._shipNames = "cbdsp";
  }

  runFunctionByShipOrientation(orientation, horizontalFunction, verticalFunction) {
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
    const shipHit = enemyInstance.getShipOnCell([row, column]);
    if (shipHit) {
      enemyInstance.decrementShipStatus(shipHit);
      this._shotsTable[row][column] = "x";
    } else {
      this._shotsTable[row][column] = 1;
    }

    enemyInstance.displayEnemyShot(shipHit, [row, column]);
  }

  getShipOnCell([row, column]) {
    return this._shipPlacementTable[row][column];
  }

  decrementShipStatus(ship) {
    this._shipInfo.status[ship]--;
  }

  displayEnemyShot(shipHit, [row, column]) {
    const cell = this._boardElem.rows[row].cells[column];
    if (shipHit) cell.style.background = "#B24B68";
    else cell.style.background = "#ccc";
  }

  shipSunk(ship) {
    return this._shipInfo.status[ship] === 0;
  }

  hasSailingShips() {
    return Object.values(this._shipInfo.status).some((status) => status !== 0);
  }
}
