/*
 TODO:
  * pass ships to Player methods instead of basing off of selectedShip field
  * remove shipNames var
  * ai algorithm
    ! refactor
    * shoot algorithm: odd cells
  * inspector settings
  * user setup: highlight cells on ship hover

 ** THINGS THAT MAY BE CONSIDERED:
  * create class for ships
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
  hideElement(homeScreen);
  hideElement(endGameModal);
  showElement(shipMenu);
  shipMenuItems.forEach((item) => removeElementState(item, "placed"));
}

finishGameSetupButton.addEventListener("click", () => {
  if (!user.allShipsPlaced()) return;

  user.detachGameSetupHandlers();
  startGameFight();
  displayScreenForGameFight();
});

function displayScreenForGameFight() {
  hideElement(shipMenu);
  hideElement(finishGameSetupButton);
}

function startGameFight() {
  ai.updateProbabilityTable(user);
  document.querySelectorAll(".board--user .ship").forEach((ship) => (ship.style.zIndex = -1)); // ! change
  aiBoard.addEventListener("click", userAttackTurnHandler);
  user.isTurn = true;
  addElementState(aiBoard, "attack");
}

function userAttackTurnHandler(e) {
  if (!user.isTurn) return;
  user.isTurn = false;

  const clickedCellRow = getElementAncestor(e.target, "tr")?.rowIndex;
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
  showElement(endGameModal);
}
