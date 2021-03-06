class Player {
  constructor(boardName) {
    this.boardElem = document.querySelector(boardName);
    this.boardElem.innerHTML = `<tr>${`<td class="cell"></td>`.repeat(10)}</tr>`.repeat(10);

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

    this._shipNames = ["c", "b", "d", "s", "p"];
  }

  runFunctionByShipOrientation(orientation, horizontalFunction, verticalFunction) {
    return orientation === "h" ? horizontalFunction() : verticalFunction();
  }

  getShipPlacementTable() {
    return this._shipPlacementTable;
  }

  getShotsTable() {
    return this._shotsTable;
  }

  getSailingShips() {
    return this._shipNames.filter((shipName) => !this.isShipSunk(shipName));
  }

  getNumSailingShips() {
    return this.getSailingShips().length;
  }

  shoot(enemyInstance, [row, column]) {
    const shipHit = enemyInstance.getShipOnShotCell([row, column]);
    if (shipHit) {
      enemyInstance.decrementShipStatus(shipHit);
      this._shotsTable[row][column] = "x";

      if (enemyInstance.isShipSunk(shipHit)) this._recordSunkenShip(enemyInstance.getSunkenShipInfo(shipHit));
    } else {
      this._shotsTable[row][column] = 1;
    }

    enemyInstance.updateEnemyShotsDisplay(this._shotsTable, shipHit);

    const cellTagLabel = enemyInstance.isShipSunk(shipHit) ? "sunk" : shipHit ? "hit" : "miss";
    const cellElem = enemyInstance.boardElem.rows[row].cells[column];
    cellElem.innerHTML += `<div class="cell__tag cell__tag--${cellTagLabel}"><h4>${cellTagLabel}</h4></div>`;
  }

  getShipOnShotCell([row, column]) {
    return this._shipPlacementTable[row][column];
  }

  decrementShipStatus(ship) {
    this._shipInfo.status[ship]--;
  }

  isShipSunk(ship) {
    return this._shipInfo.status[ship] === 0;
  }

  getSunkenShipInfo(ship) {
    if (!this.isShipSunk(ship)) return;

    return {
      name: ship,
      origin: this._shipInfo.origin[ship],
      orientation: this._shipInfo.orientation[ship],
      length: this._shipInfo.length[ship],
    };
  }

  updateEnemyShotsDisplay(shotsTable) {
    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        const cellShotInfo = shotsTable[row][column];
        const cellElem = this.boardElem.rows[row].cells[column];
        if (cellShotInfo === 0) continue;

        removeElementState(cellElem, "can-shoot");
        if (cellShotInfo === 1) addElementState(cellElem, "miss");
        else if (cellShotInfo === "x") addElementState(cellElem, "hit");
        else if (cellShotInfo === "o") addElementState(cellElem, "sunk");
      }
    }
  }

  _recordSunkenShip(shipInfo) {
    const [row, column] = shipInfo.origin;
    this.runFunctionByShipOrientation(
      shipInfo.orientation,
      () => {
        for (let i = 0; i < shipInfo.length; i++) this._shotsTable[row][column + i] = "o";
      },
      () => {
        for (let i = 0; i < shipInfo.length; i++) this._shotsTable[row + i][column] = "o";
      }
    );
  }
}
