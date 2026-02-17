// Snake game configuration
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const initialSpeedMs = 120;

let snake = [];
let direction = { x: 1, y: 0 };
let queuedDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let isRunning = false;
let gameLoopTimer = null;

/**
 * Shows exactly one screen by assigning the active class.
 */
function showScreen(screenToShow) {
  [startScreen, gameScreen, gameOverScreen].forEach((screen) => {
    screen.classList.toggle("active", screen === screenToShow);
  });
}

/**
 * Initializes or resets the game state.
 */
function resetGame() {
  snake = [
    { x: 5, y: 12 },
    { x: 4, y: 12 },
    { x: 3, y: 12 },
  ];
  direction = { x: 1, y: 0 };
  queuedDirection = { x: 1, y: 0 };
  score = 0;
  scoreElement.textContent = String(score);
  placeFood();
  draw();
}

/**
 * Starts the game loop after resetting state.
 */
function startGame() {
  clearInterval(gameLoopTimer);
  resetGame();
  isRunning = true;
  showScreen(gameScreen);

  gameLoopTimer = setInterval(() => {
    update();
    draw();
  }, initialSpeedMs);
}

/**
 * Ends gameplay and displays final score.
 */
function gameOver() {
  isRunning = false;
  clearInterval(gameLoopTimer);
  finalScoreElement.textContent = String(score);
  showScreen(gameOverScreen);
}

/**
 * Places food in an empty tile not occupied by the snake.
 */
function placeFood() {
  let nextFood;
  do {
    nextFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));

  food = nextFood;
}

/**
 * Updates snake position, handles food collection and collisions.
 */
function update() {
  direction = queuedDirection;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Collision with walls
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Collision with own body
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = String(score);
    placeFood();
  } else {
    snake.pop();
  }
}

/**
 * Draws the board, grid, snake, food, and in-canvas score text.
 */
function draw() {
  // Board background
  ctx.fillStyle = "#070b1f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }

  // Food
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

  // Snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#61f3ad" : "#42c68b";
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Score text inside canvas
  ctx.fillStyle = "#d7dcff";
  ctx.font = "bold 18px Arial";
  ctx.fillText(`Score: ${score}`, 12, 24);
}

/**
 * Updates queued direction while preventing 180-degree turns.
 */
function handleKeyInput(event) {
  if (!isRunning) {
    return;
  }

  const { key } = event;

  if (key === "ArrowUp" && direction.y !== 1) {
    queuedDirection = { x: 0, y: -1 };
  } else if (key === "ArrowDown" && direction.y !== -1) {
    queuedDirection = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" && direction.x !== 1) {
    queuedDirection = { x: -1, y: 0 };
  } else if (key === "ArrowRight" && direction.x !== -1) {
    queuedDirection = { x: 1, y: 0 };
  }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyInput);

showScreen(startScreen);
