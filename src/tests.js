// manual tests

function displayProbability() {
  const userBoard = document.querySelector(".board--user");
  for (let row = 0; row < 10; row++) {
    for (let column = 0; column < 10; column++) {
      let style = null;
      if (ai.getProbabilityTable()[row][column] > 1) {
        const opacity = ai.getProbabilityTable()[row][column] / Math.max(...ai.getProbabilityTable().flat());
        style = `rgba(242, 212, 48, ${opacity})`;
      }
      userBoard.rows[row].cells[column].style.background = style;
    }
  }
}

// function displayPresumedShipAndCurrentSegment(ship, [row, column], orientation, [segmentRow, segmentColumn]) {
//   const shipLength = user._shipInfo.length[ship];
//   for (let row = 0; row < 10; row++) for (let column = 0; column < 10; column++) userBoard.rows[row].cells[column].style.background = null;

//   user.runFunctionByShipOrientation(
//     orientation,
//     () => {
//       for (let i = column; i < column + shipLength; i++) userBoard.rows[row].cells[i].style.background = "yellow";
//     },
//     () => {
//       for (let i = row; i < row + shipLength; i++) userBoard.rows[i].cells[column].style.background = "yellow";
//     }
//   );

//   userBoard.rows[segmentRow].cells[segmentColumn].style.background = "orange";

//   for (let row = 0; row < 10; row++)
//     for (let column = 0; column < 10; column++)
//       if (ai.getShotsTable()[row][column] === "x") userBoard.rows[row].cells[column].style.boxShadow = "0 0 0 5px #B24B68 inset";
//       else if (ai.getShotsTable()[row][column] === 1) userBoard.rows[row].cells[column].style.background = "#ccc";
// }

// inspector functions -------------------------

const inspectorButton = document.querySelector(".inspector__button");
const inspectorContainer = document.querySelector(".inspector");
inspectorButton.addEventListener("click", () => {
  elementHasState(inspectorContainer, "hidden") ? showElement(inspectorContainer) : hideElement(inspectorContainer);
});

const probabilityDisplayToggler = document.querySelector(".inspector__switch--probability");
probabilityDisplayToggler.addEventListener("click", () => {
  ai.willDisplayProbability = !ai.willDisplayProbability;

  if (ai.willDisplayProbability) {
    addElementState(probabilityDisplayToggler, "on");
    displayProbability();
  } else {
    removeElementState(probabilityDisplayToggler, "on");
    for (let row = 0; row < 10; row++) for (let column = 0; column < 10; column++) userBoard.rows[row].cells[column].style.background = null;
  }
});

const parityFilterToggler = document.querySelector(".inspector__switch--parity");
parityFilterToggler.addEventListener("click", () => {
  elementHasState(parityFilterToggler, "on") ? removeElementState(parityFilterToggler, "on") : addElementState(parityFilterToggler, "on");
});

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
