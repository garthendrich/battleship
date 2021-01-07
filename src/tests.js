// manual tests

function updateProbabilityDisplay() {
  if (!willDisplayProbability) return;

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
  elementHasState(inspectorContainer, "closed") ? removeElementState(inspectorContainer, "closed") : addElementState(inspectorContainer, "closed");
});

const probabilityDisplayToggler = document.querySelector(".inspector__switch--probability");
probabilityDisplayToggler.addEventListener("click", () => {
  willDisplayProbability = !willDisplayProbability;

  if (willDisplayProbability) {
    addElementState(probabilityDisplayToggler, "on");
    updateProbabilityDisplay();
  } else {
    removeElementState(probabilityDisplayToggler, "on");
    for (let row = 0; row < 10; row++) for (let column = 0; column < 10; column++) userBoard.rows[row].cells[column].style.background = null;
  }
});

const parityFilterToggler = document.querySelector(".inspector__switch--parity");
parityFilterToggler.addEventListener("click", () => {
  hasParityFilter = !hasParityFilter;

  hasParityFilter ? addElementState(parityFilterToggler, "on") : removeElementState(parityFilterToggler, "on");
  ai.updateProbabilityTable(user.getSailingShips());
  updateProbabilityDisplay();
});

const baseMultiplierInput = document.querySelector(".inspector__input[name='base']");
const multiplierIncreaserInput = document.querySelector(".inspector__input[name='increaser']");

baseMultiplierInput.addEventListener("input", () => updateMultiplier(baseMultiplierInput));
multiplierIncreaserInput.addEventListener("input", () => updateMultiplier(multiplierIncreaserInput));

function updateMultiplier(inputElem) {
  if (inputElem.name === "base") baseProbabilityMultiplier = Number(inputElem.value);
  else if (inputElem.name === "increaser") trackModeMultiplierIncreaser = Number(inputElem.value);

  ai.updateProbabilityTable(user.getSailingShips());
  updateProbabilityDisplay();
}

const resetBaseMultiplierButton = document.querySelector(".inspector__reset--base");
resetBaseMultiplierButton.addEventListener("click", () => {
  baseMultiplierInput.value = 1.2;
  updateMultiplier(baseMultiplierInput);
});

const resetTrackModeMultiplierIncreaserButton = document.querySelector(".inspector__reset--increaser");
resetBaseMultiplierButton.addEventListener("click", () => {
  multiplierIncreaserInput.value = 1.4;
  updateMultiplier(multiplierIncreaserInput);
});
