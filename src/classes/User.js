class User extends UserSetup {
  constructor(board) {
    super(board);
  }

  canShootEnemyCell([row, column]) {
    return this._shotsTable[row][column] === 0;
  }
}
