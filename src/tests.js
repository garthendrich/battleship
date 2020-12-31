// function displayAiShipTable() {
//   for (let row = 0; row < 10; row++)
//     for (let column = 0; column < 10; column++)
//       if (ai.shipPlacementTable[row][column]) document.querySelector(".board--ai").rows[row].cells[column].style.background = "#4a6fa5";
// }

const userBoard = document.querySelector(".board--user");
function displayProbDensity() {
  for (let row = 0; row < 10; row++) {
    for (let column = 0; column < 10; column++) {
      userBoard.rows[row].cells[column].style.background =
        ai.densityTable[row][column] == 1 ? "red" : `rgba(0,0,0,${ai.densityTable[row][column] / Math.max(...ai.densityTable.flat())})`;
    }
  }
}

function toggleDensityDisplay() {
  ai.showDensityDisplay = !ai.showDensityDisplay;

  if (ai.showDensityDisplay) displayProbDensity();
  else {
    for (let row = 0; row < 10; row++) {
      for (let column = 0; column < 10; column++) {
        if (ai.shotsTable[row][column]) user.displayEnemyShot(user.shipPlacementTable[row][column], row, column);
        else userBoard.rows[row].cells[column].style.background = null;
      }
    }
  }
}
