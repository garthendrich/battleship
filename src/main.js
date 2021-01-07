"use strict";

let hasParityFilter = true;
let baseProbabilityMultiplier = 1.2;
let trackModeMultiplierIncreaser = 1.4;
let willDisplayProbability = false;

let user, ai;
let canStartNewGame = true;
let isTutorialMode = true;
let tutorialPart = 0;

const homeScreen = document.querySelector(".homescreen");
const playButton = document.querySelector(".play-button");
const tutorialButton = document.querySelector(".tutorial-button");

const tutorialPopups = document.querySelectorAll(".tutorial");

const sidebar = document.querySelector(".sidebar");
const shipMenuItems = document.querySelectorAll(".ship-menu__item");
const randomizeBoardButton = document.querySelector(".ship-menu__button--random");
const resetBoardButton = document.querySelector(".ship-menu__button--reset");
const finishGameSetupButton = document.querySelector(".finish-setup-button");

const userBoard = document.querySelector(".board--user");
const aiBoard = document.querySelector(".board--ai");

const inspectorSettings = document.querySelector(".inspector");
const gameOverModal = document.querySelector(".modal--game-over");
const gameOverModalDialogue = gameOverModal.querySelector(".modal__dialogue");
const playAgainButton = document.querySelector(".play-again-button");

playButton.addEventListener("click", startGameSetupHandler);
playAgainButton.addEventListener("click", startGameSetupHandler);
tutorialButton.addEventListener("click", () => {});

function showNextTutorialPopup() {
  if (tutorialPart === 0 || tutorialPart === 4) addElementState(document.body, "tutorial");

  const prevTutorialPopup = document.querySelector(`.tutorial--${tutorialPart - 1}`);
  prevTutorialPopup && hideElement(prevTutorialPopup);

  // setup tutorial
  if (tutorialPart === 3 || tutorialPart === 5) {
    if (tutorialPart === 5) tutorialPopups.forEach((popup) => popup.removeEventListener("click", showNextTutorialPopup));
    removeElementState(document.body, "tutorial");
    tutorialPart++;
    return;
  }

  const currTutorialPopup = document.querySelector(`.tutorial--${tutorialPart}`);
  showElement(currTutorialPopup);

  tutorialPart++;
}

function startGameSetupHandler() {
  if (!canStartNewGame) return;
  canStartNewGame = false;

  user = new User(".board--user");
  ai = new Ai(".board--ai");

  user.attachGameSetupHandlers();
  displayScreenForGameSetup();

  if (isTutorialMode) {
    tutorialPopups.forEach((popup) => popup.addEventListener("click", showNextTutorialPopup));
    showNextTutorialPopup();
  }
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
  if (tutorialPart > 0) showNextTutorialPopup();
});

function displayScreenForGameFight() {
  hideElement(sidebar);
  hideElement(finishGameSetupButton);
  showElement(aiBoard.parentElement);
  showElement(inspectorSettings);
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
  hideElement(inspectorSettings);

  canStartNewGame = true;

  return true;
}

function showGameOverModal(text) {
  gameOverModalDialogue.innerHTML = text;
  showElement(gameOverModal);
}
