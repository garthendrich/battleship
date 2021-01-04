class User extends UserSetup {
  constructor(board) {
    super(board);
  }

  canShootEnemyCell([row, column]) {
    return this._shotsTable[row][column] === 0;
  }

  getShipsToSearch() {
    const shipsToSearch = [];
    for (let ship of this._shipNames) {
      if (!this.shipSunk(ship)) shipsToSearch.push(ship);
    }
    return shipsToSearch;
  }

  getSunkenShipInfo(ship) {
    if (!this.shipSunk(ship)) return;

    return {
      name: ship,
      origin: this._shipInfo.origin[ship],
      orientation: this._shipInfo.orientation[ship],
      length: this._shipInfo.length[ship],
    };
  }
}
