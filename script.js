// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countdown;
let timeLeft = 30; // seconds
let score = 0;
let badDropMaker; // Will store our timer that creates bad drops regularly
let dropSpeed = 4; // seconds, initial fall duration
let speedInterval;

let canX = 400; // Initial X position (center)
const canWidth = 100;

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeLeft = 30;
  score = 0;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = score;
  document.getElementById("game-over").style.display = "none";

  // Start countdown timer
  countdown = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  // Create bad drops at random intervals (between 0.5s and 2s)
  badDropMaker = setInterval(() => {
    const randomDelay = Math.random() * 1500 + 500; // 500ms to 2000ms
    setTimeout(createBadDrop, randomDelay);
  }, 1000);

  // Reset drop speed and start speed increase interval
  dropSpeed = 4;
  speedInterval = setInterval(() => {
    if (dropSpeed > 1) {
      dropSpeed -= 0.5;
    }
  }, 5000);

  // Show and center water can
  const can = document.getElementById("water-can");
  can.style.display = "block";
  canX = (document.getElementById("game-container").offsetWidth - canWidth) / 2;
  can.style.left = canX + "px";
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  clearInterval(badDropMaker); // Clear bad drop timer
  clearInterval(speedInterval); // Stop speed increase
  // Show Game Over message with score
  const msg = `Game Over!<br>You collected <b>${score}</b> drops.`;
  const gameOverDiv = document.getElementById("game-over");
  gameOverDiv.innerHTML = msg;
  gameOverDiv.style.display = "block";
  // Hide water can
  document.getElementById("water-can").style.display = "none";
  // Remove remaining drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  // Fun confetti effect
  showConfetti();
}

function showConfetti() {
  const container = document.getElementById("game-container");
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * container.offsetWidth + "px";
    confetti.style.top = "-20px";
    confetti.style.background = `hsl(${Math.random()*360},90%,60%)`;
    confetti.style.width = confetti.style.height = (8 + Math.random()*8) + "px";
    confetti.style.opacity = 0.8;
    confetti.style.position = "absolute";
    confetti.style.borderRadius = "2px";
    confetti.style.zIndex = 20;
    confetti.style.animation = `confettiFall 1.5s linear forwards`;
    confetti.style.animationDelay = (Math.random()*0.7) + "s";
    container.appendChild(confetti);
    confetti.addEventListener("animationend", () => confetti.remove());
  }
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = dropSpeed + "s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Check for collection by can
  drop.collectType = "good";
  drop.checkInterval = setInterval(() => {
    if (!gameRunning) return;
    if (isCollected(drop)) {
      score++;
      document.getElementById("score").textContent = score;
      drop.remove();
      clearInterval(drop.checkInterval);
    }
  }, 20);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
    clearInterval(drop.checkInterval);
  });
}

function createBadDrop() {
  if (!gameRunning) return;
  const drop = document.createElement("div");
  drop.className = "water-drop bad-drop";
  // Random size
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  // Random position
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  // Fall duration
  drop.style.animationDuration = dropSpeed + "s";
  document.getElementById("game-container").appendChild(drop);
  // Check for collection by can
  drop.collectType = "bad";
  drop.checkInterval = setInterval(() => {
    if (!gameRunning) return;
    if (isCollected(drop)) {
      score--;
      document.getElementById("score").textContent = score;
      drop.remove();
      clearInterval(drop.checkInterval);
    }
  }, 20);
  // Remove drops that reach the bottom
  drop.addEventListener("animationend", () => {
    drop.remove();
    clearInterval(drop.checkInterval);
  });
}

// Helper to check if drop overlaps with can center
function isCollected(drop) {
  const can = document.getElementById("water-can");
  const canRect = can.getBoundingClientRect();
  const dropRect = drop.getBoundingClientRect();
  // Center point of can
  const canCenterX = canRect.left + canRect.width / 2;
  const canCenterY = canRect.top + canRect.height / 2;
  // Check if drop overlaps can center
  return (
    dropRect.left <= canCenterX && dropRect.right >= canCenterX &&
    dropRect.top <= canCenterY && dropRect.bottom >= canCenterY
  );
}

// Move can with mouse
const gameContainer = document.getElementById("game-container");
gameContainer.addEventListener("mousemove", function(e) {
  const rect = gameContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - canWidth / 2;
  // Clamp within container
  x = Math.max(0, Math.min(x, gameContainer.offsetWidth - canWidth));
  const can = document.getElementById("water-can");
  can.style.left = x + "px";
});
