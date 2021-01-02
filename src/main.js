/*
 TODO:
 * home screen
 * user setup: highlight cells on ship hover
 * ai algorithm
    ! refactor
    * shoot algorithm: odd cells
  * finish game state
  * inspector settings

 ** THINGS THAT MAY BE CONSIDERED:
 * current randomizer may be inefficient: rechecks occupied cells
 * better adjust-ship-on-rotate
 */

"use strict";

let user, ai;
let canPlay = true;
const playButton = document.querySelector("#play");
const homeScreen = document.querySelector(".homescreen");
playButton.addEventListener("click", () => {
  if (!canPlay) return;
  canPlay = false;

  user = new User(".board--user");
  ai = new Ai(".board--ai");
  attachGameSetupHandlers();
  homeScreen.classList.add("homescreen--hidden");
});

const startGameButton = document.querySelector("#start-game");
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
  ai.updateProbabilityTable(user);
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
