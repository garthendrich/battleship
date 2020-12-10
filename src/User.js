class User extends Player {
  addSelectedShip(newShipOrigin = this.newShipOrigin) {
    super.addSelectedShip(newShipOrigin);

    const [row, column] = newShipOrigin;
    document.querySelector(`.board tr:nth-child(${row + 1}) td:nth-child(${column + 1})`).append(createShip());

    const menuShipElem = document.querySelector(`.ship-menu__item#${this.selectedShip}`);
    menuShipElem.classList.add("ship-menu__item--placed");

    console.table(this.shipDataTable);
  }
}
