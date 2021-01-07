class User extends UserSetup {
  constructor(board) {
    super(board);
  }

  canShootEnemyCell([row, column]) {
    return this._shotsTable[row][column] === 0;
  }

  getSailingShips() {
    return this._shipNames.filter((shipName) => !this.isShipSunk(shipName));
  }
}
