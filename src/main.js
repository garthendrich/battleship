/*
 TODO
 * home page
 * ai algorithm
 * game proper
 */

"use strict";

const user = new User();
const ai = new Ai();

const startGameButton = document.querySelector(".start-game");
startGameButton.addEventListener("click", () => {
  const shipOriginValues = Object.values(user.shipOrigin);
  const areAllShipsPlaced = !shipOriginValues.includes(null);

  if (areAllShipsPlaced) {
    document.querySelector(".ship-menu").classList.add("ship-menu--hidden");
    startGameButton.classList.add("start-game--hidden");

    startGameFight();
  }
});

function startGameFight() {
  ai.randomizeShips();
  displayAiShipTable();
}
