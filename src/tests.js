function displayAiShipTable() {
  for (let row = 0; row < 10; row++)
    for (let column = 0; column < 10; column++)
      if (ai.shipPlacementTable[row][column])
        document.querySelector(`.board--ai tr:nth-child(${row + 1}) td:nth-child(${column + 1})`).style.background = "#4a6fa5";
}
