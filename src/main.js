/*
 TODO
 * ai algorithm
 */

"use strict";

const user = new User();

const startGameButton = document.querySelector(".start-game");
startGameButton.addEventListener("click", () => {
  const shipOriginValues = Object.values(user.shipOrigin);
  const areAllShipsPlaced = !shipOriginValues.includes(null);

  if (areAllShipsPlaced) {
    console.log("start game");
  }
});
