{
  const game = document.querySelector(".piti-game");
  const canvas = game.querySelector("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to start the Piti Pausa game.");

  const button = game.querySelector("button");
  const scoreDisplay = game.querySelector(".piti-game-score strong");
  const status = game.querySelector(".piti-game-status");
  const ground = 210;
  const player = { x: 90, width: 30, height: 40, lift: 0, velocity: 0 };
  const obstacleTypes = [
    { label: "PRODUCTION", width: 38, height: 40, message: "Production caught you." },
    { label: "RENDER", width: 34, height: 34, message: "The render is still not finished." },
    { label: "FEEDBACK", width: 38, height: 36, message: "Feedback: just one more change." }
  ];
  const obstacles = [];
  const projectiles = [];
  const movement = { left: false, right: false };
  let state = "ready";
  let score = 0;
  let obstacleIndex = 0;
  let nextObstacle = 0;
  let lastFrame = 0;
  let frame = 0;
  let runTime = 0;

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f4eddf";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#e3dcd0";
    context.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      context.beginPath();
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, ground);
      context.stroke();
    }
    for (let y = 0; y < ground; y += 40) {
      context.beginPath();
      context.moveTo(0, y + 0.5);
      context.lineTo(canvas.width, y + 0.5);
      context.stroke();
    }
    context.font = "bold 12px monospace";
    context.fillStyle = "#171717";
    context.fillText("PITI PAUSA / TAKE A BREAK", 20, 28);
    context.fillStyle = "#d9463b";
    context.font = "11px monospace";
    context.fillText("A BREAK... IF THEY LET YOU", 20, 46);
    context.fillStyle = "#171717";
    context.fillRect(560, 16, 215, 66);
    context.fillStyle = "#f4eddf";
    context.fillRect(562, 18, 211, 62);
    context.fillStyle = "#d9463b";
    context.fillRect(562, 18, 211, 17);
    context.fillStyle = "#f4eddf";
    context.font = "bold 9px monospace";
    context.fillText("BREAK_STATUS.EXE", 569, 30);
    context.fillStyle = "#171717";
    context.font = "10px monospace";
    context.fillText("LOOKING FOR A BREAK...", 570, 51);
    context.strokeStyle = "#171717";
    context.strokeRect(570.5, 59.5, 195, 11);
    context.fillStyle = "#d9463b";
    context.fillRect(573, 62, 190 * Math.min(runTime / 60, 1), 6);
    context.fillStyle = "#d3cec5";
    context.fillRect(0, ground + 2, canvas.width, canvas.height - ground - 2);
    context.fillStyle = "#c8c0b5";
    context.fillRect(0, ground + 8, canvas.width, 1);
    context.fillStyle = "#171717";
    context.fillRect(0, ground, canvas.width, 2);

    const y = ground - player.height - player.lift;
    const step = state === "playing" && player.lift === 0 && Math.floor(runTime * 8) % 2;
    // A tiny pixel-art artist with a pencil, framed by the existing hitbox.
    context.fillStyle = "#171717";
    context.fillRect(player.x + 5, y, 19, 17);
    context.fillRect(player.x + 3, y + 5, 5, 15);
    context.fillRect(player.x + 20, y + 5, 5, 15);
    context.fillStyle = "#d9a98e";
    context.fillRect(player.x + 9, y + 6, 12, 10);
    context.fillStyle = "#171717";
    context.fillRect(player.x + 17, y + 9, 2, 2);
    context.fillStyle = "#d9463b";
    context.fillRect(player.x + 6, y + 18, 19, 14);
    context.fillStyle = "#d9a98e";
    context.fillRect(player.x + 23, y + 20, 5, 4);
    context.fillStyle = "#171717";
    context.fillRect(player.x + 27, y + 15, 2, 12);
    context.fillRect(player.x + 7, y + 32, 7, step ? 5 : 8);
    context.fillRect(player.x + 18, y + 32, 7, step ? 8 : 5);

    obstacles.forEach((obstacle) => {
      const top = ground - obstacle.height;
      context.fillStyle = "#171717";
      context.font = "bold 10px monospace";
      context.textAlign = "center";
      context.fillText(obstacle.label, obstacle.x + obstacle.width / 2, top - 8);
      context.textAlign = "start";

      if (obstacle.label !== "PRODUCTION") {
        context.fillStyle = obstacle.label === "FEEDBACK" ? "#171717" : "#d9463b";
        context.fillRect(obstacle.x, top, obstacle.width, obstacle.height);
      }
      context.fillStyle = "#f4eddf";
      if (obstacle.label === "RENDER") {
        context.fillRect(obstacle.x + 4, top + 5, 26, 17);
        context.fillStyle = "#171717";
        context.fillRect(obstacle.x + 7, top + 17, 18, 2);
        context.fillStyle = "#d9463b";
        context.fillRect(obstacle.x + 7, top + 17, 11, 2);
        context.fillStyle = "#f4eddf";
        context.fillRect(obstacle.x + 13, top + 25, 8, 5);
      } else if (obstacle.label === "FEEDBACK") {
        context.fillRect(obstacle.x + 5, top + 6, 28, 19);
        context.fillRect(obstacle.x + 10, top + 25, 5, 4);
        context.fillStyle = "#d9463b";
        context.fillRect(obstacle.x + 9, top + 11, 20, 2);
        context.fillRect(obstacle.x + 9, top + 16, 15, 2);
        context.fillRect(obstacle.x + 9, top + 21, 18, 2);
      } else {
        context.fillStyle = "#171717";
        context.fillRect(obstacle.x + 10, top, 18, 15);
        context.fillStyle = "#d9a98e";
        context.fillRect(obstacle.x + 12, top + 5, 12, 9);
        context.fillStyle = "#171717";
        context.fillRect(obstacle.x + 14, top + 8, 2, 2);
        context.fillRect(obstacle.x + 8, top + 16, 22, 15);
        context.fillRect(obstacle.x + 1, top + 20, 9, 4);
        context.fillRect(obstacle.x + 10, top + 31, 7, 9);
        context.fillRect(obstacle.x + 22, top + 31, 7, 9);
        context.fillStyle = "#f4eddf";
        context.fillRect(obstacle.x + 18, top + 17, 3, 10);
      }
    });

    projectiles.forEach((projectile) => {
      context.fillStyle = "#d9463b";
      context.fillRect(projectile.x, ground - 14, 14, 10);
      context.fillStyle = "#f4eddf";
      context.fillRect(projectile.x + 4, ground - 12, 6, 2);
    });
  }

  function clearMovement() {
    movement.left = false;
    movement.right = false;
  }

  function endGame(obstacle) {
    state = "over";
    clearMovement();
    button.textContent = "PLAY AGAIN";
    status.textContent = `${obstacle.message} Score: ${score}.`;
    draw();
  }

  function update(time) {
    if (state !== "playing") return;
    const elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
    lastFrame = time;
    runTime += elapsed;
    const speed = Math.min(430, 250 + runTime * 4);
    player.x = Math.max(20, Math.min(canvas.width * 0.45, player.x +
      (Number(movement.right) - Number(movement.left)) * 220 * elapsed));
    player.lift += player.velocity * elapsed;
    player.velocity -= 1300 * elapsed;
    if (player.lift <= 0) {
      player.lift = 0;
      player.velocity = 0;
    }

    nextObstacle -= elapsed;
    if (nextObstacle <= 0) {
      obstacles.push({ ...obstacleTypes[obstacleIndex % obstacleTypes.length], x: canvas.width, passed: false });
      obstacleIndex++;
      nextObstacle = 1.6 + Math.random() * 0.6;
    }

    for (const obstacle of obstacles) {
      obstacle.x -= speed * elapsed;
      if (obstacle.label === "PRODUCTION" && !obstacle.fired &&
          obstacle.x <= player.x + 440 && obstacle.x > player.x + player.width) {
        obstacle.fired = true;
        projectiles.push({ x: obstacle.x - 14 });
      }
      if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
        obstacle.passed = true;
        scoreDisplay.textContent = String(++score);
      }
      if (obstacle.x < player.x + player.width - 4 &&
          obstacle.x + obstacle.width > player.x + 4 &&
          player.lift < obstacle.height - 4) {
        endGame(obstacle);
        return;
      }
    }
    for (const projectile of projectiles) {
      projectile.x -= (speed + 150) * elapsed;
      if (projectile.x < player.x + player.width - 4 &&
          projectile.x + 14 > player.x + 4 && player.lift < 14) {
        endGame({ message: "Production got you with a shot." });
        return;
      }
    }
    while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) obstacles.shift();
    while (projectiles.length && projectiles[0].x + 14 < 0) projectiles.shift();
    draw();
    frame = requestAnimationFrame(update);
  }

  function act() {
    if (state === "ready" || state === "over") {
      obstacles.length = 0;
      projectiles.length = 0;
      clearMovement();
      player.x = 90;
      player.lift = 0;
      player.velocity = 0;
      score = 0;
      obstacleIndex = 0;
      runTime = 0;
      scoreDisplay.textContent = "0";
      nextObstacle = 0.8;
    }
    if (state !== "playing") {
      state = "playing";
      lastFrame = 0;
      button.textContent = "JUMP";
      status.textContent = "Game on. Jump over the obstacles.";
      frame = requestAnimationFrame(update);
      return;
    }
    if (player.lift === 0) player.velocity = 470;
  }

  button.addEventListener("click", act);
  canvas.addEventListener("pointerdown", () => {
    canvas.focus();
    act();
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      event.preventDefault();
      movement[event.code === "ArrowLeft" ? "left" : "right"] = true;
    } else if ((event.code === "ArrowUp" || event.code === "Space") && !event.repeat) {
      event.preventDefault();
      act();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft") movement.left = false;
    if (event.code === "ArrowRight") movement.right = false;
  });
  game.addEventListener("focusout", (event) => {
    if (!game.contains(event.relatedTarget)) clearMovement();
  });
  window.addEventListener("blur", clearMovement);

  game.querySelectorAll("[data-direction]").forEach((control) => {
    const direction = control.dataset.direction;
    control.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      control.setPointerCapture(event.pointerId);
      movement[direction] = true;
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
      control.addEventListener(type, () => { movement[direction] = false; });
    });
  });

  function pause() {
    if (state !== "playing") return;
    state = "paused";
    cancelAnimationFrame(frame);
    clearMovement();
    button.textContent = "CONTINUE";
    status.textContent = "Game paused. Press continue to play.";
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  const visibilityObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) pause();
  });
  visibilityObserver.observe(game);

  draw();
}
