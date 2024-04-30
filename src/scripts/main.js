import {
  getRandomIntInclusive,
  // generateRandomIntegers,
  // calculateExpressions,
  isTargetValueReached,
  // generateExpression,
  generateExpressionArray,
} from "./helper.js";
import * as grid from "./grid.js";

// Game values
grid.cellsArray;
grid.pathArray;
grid.newDirectionOrder;
grid.coords;
grid.rows;
grid.columns;
let checkZone = [];
// Generate game grid and expressions path
grid.generateGameGrid();

const gameLevelInput = document.getElementById("game-level");
const newGameButton = document.querySelector("#newGameBtn");
const expressionsZone = document.querySelector(".model__expressions");
const resultEl = document.querySelector(".model__result");
let startingValueEl = null;
let currentValueEl = null;
let targetValueContainerEl = null;
let targetValueEl = null;
// event listeners
newGameButton.addEventListener("click", startGame);

//Global variables
//let gameLevel = 0; // game level starts at 0 and ends at 10

// Main function of the game
function startGame() {
  grid.generatePath();
  // Declaration
  startingValueEl = document.querySelector(".starting-value");
  currentValueEl = document.querySelector(".current-value");
  targetValueContainerEl = document.querySelector(".target-value-container");
  targetValueEl = document.querySelector(".target-value");
  try {
    let gameLevel = parseInt(gameLevelInput.value);
    // console.log(gameLevel);
    let min, max, startingValue, maxValue, operatorString, numExpression;
    if (gameLevel === 0) {
      min = 1;
      max = 10;
      startingValue = getRandomIntInclusive(min, max);
      maxValue = max;
      operatorString = "+";
      numExpression = 1;
    } else {
      min = gameLevel;
      max = gameLevel * 5 - 1;
      startingValue = getRandomIntInclusive(min, max);
      maxValue = Math.ceil((startingValue + max) / 2);
      operatorString = "";
      numExpression =
        gameLevel < 6
          ? getRandomIntInclusive(gameLevel, gameLevel + 1)
          : getRandomIntInclusive(gameLevel - 1, gameLevel);
    }
    // console.log({ min, max, startingValue, maxValue, numExpression });
    startingValueEl.classList.add("show-starting-target-value");
    targetValueContainerEl.classList.add("show-starting-target-value");

    grid.pathArray.forEach((block) => {
      block.innerHTML = "";
      block.classList.remove("create-path");
      block.classList.remove("model__check");
      setTimeout(() => {
        block.classList.add("create-path");
      }, 20);
    });
    resultEl.innerHTML = "";

    const expressions = generateExpressionArray(
      startingValue,
      maxValue,
      operatorString,
      numExpression
    );

    const { expressionArray, targetValue } = expressions;
    currentValueEl.textContent = startingValue;
    startingValueEl.textContent = startingValue;
    targetValueEl.textContent = targetValue;

    expressionsZone.innerHTML = "";

    for (let i = 0; i < numExpression; i++) {
      let expDiv = document.createElement("div");
      expDiv.classList.add("expression");
      expDiv.id = `expression-${i + 1}`;
      expDiv.setAttribute("draggable", true);
      expDiv.textContent = `${expressionArray[i]}`;
      expressionsZone.appendChild(expDiv);
    }
    // Generate check zone

    const previousExpressions = new Set();
    previousExpressions.clear();
    function distributeExpressions() {
      let randomPosition = null;
      for (let i = 0; i < expressionArray.length; i++) {
        do {
          randomPosition = getRandomIntInclusive(1, grid.pathArray.length - 2);
        } while (previousExpressions.has(randomPosition));
        previousExpressions.add(randomPosition);
        grid.pathArray.forEach((block, index) => {
          if (previousExpressions.has(index)) {
            block.classList.add("model__check");
          }
        });
      }
    }
    distributeExpressions();
  } catch (error) {
    resultEl.textContent = "Error: " + error.message;
  }
  checkZone = document.querySelectorAll(".model__check ");
  dragDropExpression();
}

function dragDropExpression() {
  const draggableExpressionEls = document.getElementsByClassName("expression");
  for (const draggableExpEl of draggableExpressionEls) {
    draggableExpEl.addEventListener("dragstart", (e) => {
      // console.log(e.target);
      e.dataTransfer.setData("expId", e.target.id);
    });
  }

  checkZone.forEach((check) => {
    check.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
  });

  checkZone.forEach((check) => {
    check.addEventListener("drop", (e) => {
      e.preventDefault();
      const expId = e.dataTransfer.getData("expId");
      // console.log(expId);
      if (e.target.classList.contains("model__check")) {
        const draggableExpression = document.getElementById(expId);
        e.target.appendChild(draggableExpression);
      }
    });
  });

  checkZone.forEach((check) => {
    check.addEventListener("dragend", checkPlayGame);
  });
}

function checkPlayGame() {
  // alert("check button clicked");
  let expressions = [];
  for (const ex of checkZone) {
    ex.innerHTML ? expressions.push(ex.textContent) : "";
  }

  const startingValue = startingValueEl.textContent;
  const targetValue = Number(targetValueEl.textContent);
  const checkObject = isTargetValueReached(
    startingValue,
    targetValue,
    expressions
  );
  // console.log(checkObject);
  const { currentValue, targetReached } = checkObject;
  currentValueEl.textContent = !Number.isInteger(currentValue)
    ? currentValue.toFixed(2)
    : currentValue;
  if (targetReached && expressionsZone.children.length === 0) {
    resultEl.innerHTML = "GREAT! 🤩";
  } else if (!targetReached && expressionsZone.children.length === 0) {
    currentValueEl.classList.add("shake-horizontal");
    setTimeout(() => {
      currentValueEl.classList.remove("shake-horizontal");
    }, 800);
  }
}
