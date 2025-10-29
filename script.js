
let gameRunning = false;
let dropMaker;
let countdown;
let timeLeft = 30;
let score = 0;
let badDropMaker; 
let dropSpeed = 4;
let speedInterval;

let canX = 400;
let canWidth = 100;


document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {

  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("game-over").style.display = "none";


  const difficulty = document.getElementById("difficulty").value;
  let dropInterval = 1000;
  let badDropInterval = 1000;
  let canSize = 100;
  switch (difficulty) {
    case "easy":
      dropSpeed = 5;
      timeLeft = 40;
      badDropInterval = null;
      canSize = 130;
      break;
    case "normal":
      dropSpeed = 4;
      timeLeft = 30;
      badDropInterval = 1000;
      canSize = 100;
      break;
    case "hard":
      dropSpeed = 2;
      timeLeft = 20;
      badDropInterval = 500;
      canSize = 70;
      dropInterval = 500; 
      break;
  }

  document.getElementById("time").textContent = timeLeft;
  const can = document.getElementById("water-can");
  can.style.width = canSize + "px";
  canWidth = canSize;

  
  countdown = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  
  dropMaker = setInterval(createDrop, dropInterval);

  if (badDropInterval) {
    badDropMaker = setInterval(() => {
      const randomDelay = Math.random() * badDropInterval + 300;
      setTimeout(createBadDrop, randomDelay);
    }, badDropInterval);
  }


  speedInterval = setInterval(() => {
    if (dropSpeed > 1) {
      dropSpeed -= 0.5;
    }
  }, 5000);


  can.style.display = "block";
  canX = (document.getElementById("game-container").offsetWidth - canWidth) / 2;
  can.style.left = canX + "px";
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  clearInterval(badDropMaker);
  clearInterval(speedInterval);
  const msg = `Game Over!<br>You collected <b>${score}</b> drops.`;
  const gameOverDiv = document.getElementById("game-over");
  const gameOverContent = document.getElementById("game-over-content");
  gameOverContent.innerHTML = msg;
  gameOverDiv.style.display = "flex";
  document.getElementById("restart-btn").onclick = function() {
    gameOverDiv.style.display = "none";
    startGame();
  };

  document.getElementById("water-can").style.display = "none";
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());

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

  const drop = document.createElement("div");
  drop.className = "water-drop";

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = dropSpeed + "s";

  const img = document.createElement("img");
  img.src = "img/water-drop-web.png";
  img.alt = "Good Water Drop";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.pointerEvents = "none";
  drop.appendChild(img);

  document.getElementById("game-container").appendChild(drop);

  drop.collectType = "good";
  drop.checkInterval = setInterval(() => {
    if (!gameRunning) return;
    if (isCollected(drop)) {
      score++;
      document.getElementById("score").textContent = score;
  const dropSound = new Audio('sounds/drop.mp3');
      dropSound.play();
      drop.remove();
      clearInterval(drop.checkInterval);
    }
  }, 20);


  drop.addEventListener("animationend", () => {
    drop.remove();
    clearInterval(drop.checkInterval);
  });
}

function createBadDrop() {
  if (!gameRunning) return;
  const drop = document.createElement("div");
  drop.className = "water-drop bad-drop";

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = dropSpeed + "s";

  const img = document.createElement("img");
  img.src = "img/bad-water-web.png";
  img.alt = "Bad Water Drop";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.pointerEvents = "none";
  drop.appendChild(img);

  document.getElementById("game-container").appendChild(drop);

  drop.collectType = "bad";
  drop.checkInterval = setInterval(() => {
    if (!gameRunning) return;
    if (isCollected(drop)) {
      const difficulty = document.getElementById("difficulty").value;
      if (difficulty === "hard") {
        score -= 2;
      } else {
        score--;
      }
      document.getElementById("score").textContent = score;
  const laughSound = new Audio('sounds/laugh.wav');
      laughSound.play();
      drop.remove();
      clearInterval(drop.checkInterval);
    }
  }, 20);

  drop.addEventListener("animationend", () => {
    drop.remove();
    clearInterval(drop.checkInterval);
  });
}


function isCollected(drop) {
  const can = document.getElementById("water-can");
  const canRect = can.getBoundingClientRect();
  const dropRect = drop.getBoundingClientRect();

  const canCenterX = canRect.left + canRect.width / 2;
  const canCenterY = canRect.top + canRect.height / 2;

  return (
    dropRect.left <= canCenterX && dropRect.right >= canCenterX &&
    dropRect.top <= canCenterY && dropRect.bottom >= canCenterY
  );
}


const gameContainer = document.getElementById("game-container");
gameContainer.addEventListener("mousemove", function(e) {
  const rect = gameContainer.getBoundingClientRect();
  let x = e.clientX - rect.left - canWidth / 2;

  x = Math.max(0, Math.min(x, gameContainer.offsetWidth - canWidth));
  const can = document.getElementById("water-can");
  can.style.left = x + "px";
});


gameContainer.addEventListener("touchmove", function(e) {
  if (e.touches.length > 0) {
    const rect = gameContainer.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left - canWidth / 2;
    x = Math.max(0, Math.min(x, gameContainer.offsetWidth - canWidth));
    const can = document.getElementById("water-can");
    can.style.left = x + "px";
    e.preventDefault();
  }
}, { passive: false });
