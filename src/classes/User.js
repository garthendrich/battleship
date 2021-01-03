class User extends UserSetup {
  constructor(board) {
    super(board);

    this.isTurn = false;
  }

  canShootEnemyCell([row, column]) {
    return this.shotsTable[row][column] === 0;
  }
}
