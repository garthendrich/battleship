class User extends UserSetup {
  constructor(board) {
    super(board);
  }

  canShootEnemyCell([row, column]) {
    return this._shotsTable[row][column] === 0;
  }

  getShipsToSearch() {
    const shipsToSearch = [];
    for (let ship of this._shipNames) if (!this.isShipSunk(ship)) shipsToSearch.push(ship);
    return shipsToSearch;
  }
}
