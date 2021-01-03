/*
 TODO:
 * user setup: highlight cells on ship hover
 * ai algorithm
    ! refactor
    * shoot algorithm: odd cells
  * inspector settings

 ** THINGS THAT MAY BE CONSIDERED:
 * current randomizer may be inefficient: rechecks occupied cells
 * better adjust-ship-on-rotate
 */

"use strict";

let user, ai;
let canPlay = true;

const homeScreen = document.querySelector(".homescreen");
const playButton = document.querySelector(".play-button");

const userBoard = document.querySelector(".board--user");
const aiBoard = document.querySelector(".board--ai");

const shipMenu = document.querySelector(".ship-menu");
const shipMenuItems = document.querySelectorAll(".ship-menu__item");
const finishGameSetupButton = document.querySelector(".finish-setup-button");

const endGameModal = document.querySelector(".modal--end-game");
const endGameModalDialogue = endGameModal.querySelector(".modal__dialogue");
const playAgainButton = document.querySelector(".play-again-button");

playButton.addEventListener("click", startGameSetupHandler);
playAgainButton.addEventListener("click", startGameSetupHandler);

function startGameSetupHandler() {
  if (!canPlay) return;
  canPlay = false;

  user = new User(".board--user");
  ai = new Ai(".board--ai");

  attachGameSetupHandlers();

  homeScreen.classList.add("homescreen--hidden");
  endGameModal.classList.add("modal--hidden");
  aiBoard.classList.remove("board--attack");
  resetShipMenuDisplay();
}

function resetShipMenuDisplay() {
  shipMenu.classList.remove("ship-menu--hidden");
  shipMenuItems.forEach((item) => item.classList.remove("ship-menu__item--placed"));
}

function showEndGameModal({ userWon }) {
  endGameModalDialogue.innerHTML = userWon ? "win" : "lose";
  endGameModal.classList.remove("modal--hidden");
}

finishGameSetupButton.addEventListener("click", () => {
  if (user.allShipsPlaced()) {
    shipMenu.classList.add("ship-menu--hidden");
    finishGameSetupButton.classList.add("finish-setup-button--hidden");

    detachGameSetupHandlers();
    startGameFight();
  }
});

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

    checkWinner();
  }

  user.isTurn = true;
}

function checkWinner() {
  if (ai.hasShips() && user.hasShips()) return;

  if (!ai.hasShips()) {
    showEndGameModal({ userWon: true });
  } else if (!user.hasShips()) {
    showEndGameModal({ userWon: false });
  }

  aiBoard.removeEventListener("click", userAttackTurnHandler);
  canPlay = true;
}
