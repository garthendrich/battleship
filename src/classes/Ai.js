class Ai extends Player {
  constructor(board) {
    super(board);
  }

  displayEnemyShot(shipHit, row, column) {
    super.displayEnemyShot(shipHit, row, column);

    const cell = this.tableEl.rows[row].cells[column];
    cell.classList.add("shot");

    if (this.shipInfo.length[shipHit] === 0) {
      const shipOrigin = this.shipInfo.origin[shipHit];
      const shipOriginCell = this.tableEl.rows[shipOrigin[0]].cells[shipOrigin[1]];
      this.selectedShip = shipHit;
      shipOriginCell.append(this.createShip({ wrecked: true }));
    }
  }
}
