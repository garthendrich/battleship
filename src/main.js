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
let canStartNewGame = true;

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
  if (!canStartNewGame) return;
  canStartNewGame = false;

  user = new User(".board--user");
  ai = new Ai(".board--ai");

  attachGameSetupHandlers();
  displayScreenForGameSetup();
}

function displayScreenForGameSetup() {
  removeElementClassNameModifier(aiBoard, "board", "attack");
  hideElement(homeScreen, "homescreen");
  hideElement(endGameModal, "modal");
  showElement(shipMenu, "ship-menu");
  shipMenuItems.forEach((item) => removeElementClassNameModifier(item, "ship-menu__item", "placed"));
}

finishGameSetupButton.addEventListener("click", () => {
  if (!user.allShipsPlaced()) return;

  detachGameSetupHandlers();
  startGameFight();
  displayScreenForGameFight();
});

function displayScreenForGameFight() {
  hideElement(shipMenu, "ship-menu");
  hideElement(finishGameSetupButton, "finish-setup-button");
}

function startGameFight() {
  ai.updateProbabilityTable(user);
  document.querySelectorAll(".board--user .ship").forEach((ship) => (ship.style.zIndex = -1)); // ! change
  aiBoard.addEventListener("click", userAttackTurnHandler);
  user.isTurn = true;
  addElementClassNameModifier(aiBoard, "board", "attack");
}

function userAttackTurnHandler(e) {
  if (!user.isTurn) return;
  user.isTurn = false;

  const clickedCellRow = e.target.closest("tr")?.rowIndex;
  const clickedCellcolumn = e.target.cellIndex;

  const clickedCellExists = typeof clickedCellRow !== "undefined" && typeof clickedCellcolumn !== "undefined";
  if (clickedCellExists && user.canShootEnemyCell([clickedCellRow, clickedCellcolumn])) {
    user.shoot(ai, [clickedCellRow, clickedCellcolumn]);
    ai.autoShoot(user);

    checkWinner();
  }

  user.isTurn = true;
}

function checkWinner() {
  if (ai.hasShips() && user.hasShips()) return;

  if (!ai.hasShips()) {
    showEndGameModal({ userWon: true });
  } else {
    showEndGameModal({ userWon: false });
  }

  aiBoard.removeEventListener("click", userAttackTurnHandler);
  canStartNewGame = true;
}

function showEndGameModal({ userWon }) {
  endGameModalDialogue.innerHTML = userWon ? "win" : "lose";
  showElement(endGameModal, "modal");
}
