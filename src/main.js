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

const gameOverModal = document.querySelector(".modal--game-over");
const gameOverModalDialogue = gameOverModal.querySelector(".modal__dialogue");
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
  hideElement(aiBoard.parentElement);
  hideElement(homeScreen);
  hideElement(gameOverModal);
  showElement(sidebar);
  showElement(finishGameSetupButton);
  shipMenuItems.forEach((item) => removeElementState(item, "taken"));
}

finishGameSetupButton.addEventListener("click", () => {
  if (!user.allShipsPlaced()) return;

  user.detachGameSetupHandlers();
  startGameFight();
  displayScreenForGameFight();
});

function displayScreenForGameFight() {
  hideElement(sidebar);
  hideElement(finishGameSetupButton);
  showElement(aiBoard.parentElement);
}

function startGameFight() {
  addLockedStateToUserShips();
  addHoverEffectToAiCells();
  ai.updateProbabilityTable(user.getSailingShips());
  aiBoard.addEventListener("click", aiBoardClickHandler);
}

function addLockedStateToUserShips() {
  const ships = userBoard.querySelectorAll(".ship");
  ships.forEach((ship) => addElementState(ship, "locked"));
}

function addHoverEffectToAiCells() {
  const cells = aiBoard.querySelectorAll(".cell");
  cells.forEach((cell) => addElementState(cell, "can-shoot"));
}

function aiBoardClickHandler(e) {
  const cellRow = getElementAncestor(e.target, "tr")?.rowIndex;
  const cellColumn = e.target.cellIndex;

  const userClickedACell = typeof cellRow !== "undefined" && typeof cellColumn !== "undefined";
  if (userClickedACell && user.canShootEnemyCell([cellRow, cellColumn])) {
    user.shoot(ai, [cellRow, cellColumn]);
    if (hasWinner()) return;
    ai.autoShoot(user);
    hasWinner();
  }
}

function hasWinner() {
  if (ai.getNumSailingShips() && user.getNumSailingShips()) return false;

  if (user.getNumSailingShips() === 0) showGameOverModal("Defeat");
  else if (user.getNumSailingShips() === 1) showGameOverModal("Clutch");
  else showGameOverModal("Victory");

  aiBoard.removeEventListener("click", aiBoardClickHandler);
  addElementState(finishGameSetupButton, "prohibited");
  canStartNewGame = true;

  return true;
}

function showGameOverModal(text) {
  gameOverModalDialogue.innerHTML = text;
  showElement(gameOverModal);
}
