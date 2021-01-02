// function displayAiShipTable() {
//   for (let row = 0; row < 10; row++)
//     for (let column = 0; column < 10; column++)
//       if (ai.shipPlacementTable[row][column]) document.querySelector(".board--ai").rows[row].cells[column].style.background = "#4a6fa5";
// }

const userBoard = document.querySelector(".board--user");
function displayProbability() {
  for (let row = 0; row < 10; row++) {
    for (let column = 0; column < 10; column++) {
      userBoard.rows[row].cells[column].style.background =
        ai.probabilityTable[row][column] == 0
          ? "none"
          : `rgba(163, 31, 26,${ai.probabilityTable[row][column] / Math.max(...ai.probabilityTable.flat())})`;
    }
  }
}

// inspector functions -------------------------

function setProbabilityMultiplier(multiplier) {
  if (multiplier < 1.01) {
    console.log("Multiplier must be greater than or equal to 1.01");
    return;
  }
  if (multiplier > 3) {
    console.log("Multiplier must be less than or equal to 3");
    return;
  }
  ai.probabilityMultiplier = multiplier;
  ai.updateProbabilityTable();
}

function toggleProbabilityDisplay() {
  ai.showProbabilityDisplay = !ai.showProbabilityDisplay;

  if (ai.showProbabilityDisplay) displayProbability();
  else {
    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        if (ai.shotsTable[row][column]) user.displayEnemyShot(user.shipPlacementTable[row][column], row, column);
        else userBoard.rows[row].cells[column].style.background = null;
      }
    }
  }
}
