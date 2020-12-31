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
  console.table(user.shipPlacementTable);
  console.table(ai.shipPlacementTable);
  aiBoard.classList.add("board--attack");
  aiBoard.addEventListener("click", attackAiBoardHandler);
}

function attackAiBoardHandler(e) {
  const row = e.target.closest("tr")?.rowIndex;
  const column = e.target.cellIndex;

  if (typeof row !== "undefined" && typeof column !== "undefined" && ai.cellNotShot(row, column)) ai.shoot(row, column);
}
