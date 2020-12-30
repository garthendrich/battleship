/*
 TODO:
 * home page
 * user turns
 * ai algorithm
 * game proper

 ** THINGS THAT MAY BE CONSIDERED:
 * current randomizer may be inefficient because of the posibility that occupied cells could be checked again
 * better adjust ship on rotate
 */

"use strict";

const user = new User();
const ai = new Ai();

attachGameSetupHandlers();

const startGameButton = document.querySelector(".start-game");
startGameButton.addEventListener("click", () => {
  const shipOriginValues = Object.values(user.shipOrigin);
  const areAllShipsPlaced = !shipOriginValues.includes(null);

  if (areAllShipsPlaced) {
    document.querySelector(".ship-menu").classList.add("ship-menu--hidden");
    startGameButton.classList.add("start-game--hidden");

    detachGameSetupHandlers();
    startGameFight();
  }
});

function startGameFight() {
  ai.randomizeShips();
  displayAiShipTable();
}
