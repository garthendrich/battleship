/*
 TODO:
 * home page
 * ai algorithm

 ** THINGS THAT MAY BE CONSIDERED:
 * current randomizer may be inefficient because of the posibility that occupied cells could be checked again
 * better adjust ship on rotate
 */

"use strict";

const user = new User(".board--user");
const ai = new Ai(".board--ai");

attachGameSetupHandlers();

const startGameButton = document.querySelector(".start-game");
startGameButton.addEventListener("click", () => {
  const shipOriginValues = Object.values(user.shipInfo.origin);
  const areAllShipsPlaced = !shipOriginValues.includes(null);

  if (areAllShipsPlaced) {
    document.querySelector(".ship-menu").classList.add("ship-menu--hidden");
    startGameButton.classList.add("start-game--hidden");

    detachGameSetupHandlers();
    startGameFight();
  }
});

const aiBoard = document.querySelector(".board--ai");

function startGameFight() {
  ai.randomizeShips();
  ai.updateProbabilityTable();
  aiBoard.classList.add("board--attack");
  aiBoard.addEventListener("click", userAttackTurnHandler);
  user.isTurn = true;
  document.querySelectorAll(".board--user .ship").forEach((ship) => (ship.style.zIndex = -1));
}

function userAttackTurnHandler(e) {
  if (!user.isTurn) return;
  user.isTurn = false;

  const row = e.target.closest("tr")?.rowIndex;
  const column = e.target.cellIndex;
  if (typeof row !== "undefined" && typeof column !== "undefined" && user.canShootEnemyCell(row, column)) {
    user.shoot(ai, [row, column]);

    ai.shoot(user);
  }
  user.isTurn = true;
}
