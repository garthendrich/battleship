/*
 TODO:
  * replace shipInfo with array of ship instances
  * modify ship randomizer
  * inspector settings
  * animate on game fight start
  ! bug: ship popups sometimes peeks for a sec when randomizing board

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

const sidebar = document.querySelector(".sidebar");
const shipMenuItems = document.querySelectorAll(".ship-menu__item");
const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
const resetBoardButton = document.querySelector(".ship-menu__button--reset");
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

  user.attachGameSetupHandlers();
  displayScreenForGameSetup();
}

function displayScreenForGameSetup() {
  removeElementState(aiBoard, "attack");
  hideElement(aiBoard.parentElement);
  hideElement(homeScreen);
  hideElement(endGameModal);
  showElement(sidebar);
  shipMenuItems.forEach((item) => removeElementState(item, "taken"));
}

finishGameSetupButton.addEventListener("click", () => {
  if (!user.allShipsPlaced()) return;

  user.detachGameSetupHandlers();
  startGameFight();
  displayScreenForGameFight();
});

function displayScreenForGameFight() {
  showElement(aiBoard.parentElement);
  hideElement(sidebar);
  hideElement(finishGameSetupButton);
}

function startGameFight() {
  ai.updateProbabilityTable(user.getShipsToSearch());
  aiBoard.addEventListener("click", aiBoardClickHandler);
  addElementState(aiBoard, "attack");
}

function aiBoardClickHandler(e) {
  const cellRow = getElementAncestor(e.target, "tr")?.rowIndex;
  const cellColumn = e.target.cellIndex;

  const userClickedACell = typeof cellRow !== "undefined" && typeof cellColumn !== "undefined";
  if (userClickedACell && user.canShootEnemyCell([cellRow, cellColumn])) {
    user.shoot(ai, [cellRow, cellColumn]);
    ai.autoShoot(user);

    checkWinner();
  }
}

function checkWinner() {
  if (ai.hasSailingShips() && user.hasSailingShips()) return;

  if (!ai.hasSailingShips()) {
    showEndGameModal({ userWon: true });
  } else {
    showEndGameModal({ userWon: false });
  }

  aiBoard.removeEventListener("click", aiBoardClickHandler);
  canStartNewGame = true;
}

function showEndGameModal({ userWon }) {
  endGameModalDialogue.innerHTML = userWon ? "win" : "lose";
  showElement(endGameModal);
}
