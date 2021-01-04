// function displayAiShipTable() {
//   for (let row = 0; row < 10; row++)
//     for (let column = 0; column < 10; column++)
//       if (ai.shipPlacementTable[row][column]) document.querySelector(".board--ai").rows[row].cells[column].style.background = "#4a6fa5";
// }

function displayProbability() {
  const userBoard = document.querySelector(".board--user");
  for (let row = 0; row < 10; row++) {
    for (let column = 0; column < 10; column++) {
      if (ai.getShotsTable()[row][column] == "x") userBoard.rows[row].cells[column].style.background = "#B24B68";
      else if (ai.getShotsTable()[row][column] == 1) userBoard.rows[row].cells[column].style.background = "white";
      else if (ai.getProbabilityTable()[row][column] == 1) userBoard.rows[row].cells[column].style.background = "none";
      else {
        const opacity = ai.getProbabilityTable()[row][column] / Math.max(...ai.getProbabilityTable().flat());
        userBoard.rows[row].cells[column].style.background = `rgba(230, 111, 47, ${opacity})`;
      }
    }
  }
}

function displayPresumedShipAndProbIncrease(shipLength, orientation, [row, column], [segmentRow, segmentColumn]) {
  for (let row = 0; row < 10; row++) for (let column = 0; column < 10; column++) userBoard.rows[row].cells[column].style.background = "none";

  if (orientation === "h") for (let i = column; i < column + shipLength; i++) userBoard.rows[row].cells[i].style.background = "yellow";
  else for (let i = row; i < row + shipLength; i++) userBoard.rows[i].cells[column].style.background = "yellow";
  userBoard.rows[segmentRow].cells[segmentColumn].style.background = "orange";
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
        if (ai.getShotsTable()[row][column]) user.displayEnemyShot(user.getShipPlacementTable()[row][column], row, column);
        else userBoard.rows[row].cells[column].style.background = null;
      }
    }
  }
}
