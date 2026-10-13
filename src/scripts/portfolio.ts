import { Snake, type Direction } from "./snake";
import { PaddleGame } from "./paddle";
import { ArcadeSound } from "./sound";
type GameId = "snake" | "pong" | "breakout";
const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const board = $("#board"),
  canvas = $<HTMLCanvasElement>("#snake-canvas"),
  ctx = canvas.getContext("2d")!;
const overlay = $("#game-overlay"),
  title = $("#game-title"),
  message = $("#game-message"),
  start = $<HTMLButtonElement>("#start-game");
const pauseButton = $<HTMLButtonElement>("#pause-game"),
  status = $("#game-status"),
  score = $("#score"),
  bestLabel = $("#best");
const difficulty = $<HTMLSelectElement>("#difficulty"),
  arcade = $("#arcade"),
  shell = $(".console");
const sound = new ArcadeSound(),
  soundButton = $<HTMLButtonElement>("#sound-toggle");
const companion = $<HTMLButtonElement>("#companion"),
  caption = $("#companion-caption");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let companionTimer: ReturnType<typeof setTimeout> | undefined;
function react(mood: string, text: string) {
  companion.dataset.mood = mood;
  caption.textContent = text;
  clearTimeout(companionTimer);
  if (mood === "happy") {
    companionTimer = setTimeout(
      () =>
        react(
          state === "playing" ? "watching" : "idle",
          state === "playing" ? "Following along." : "Ready to watch.",
        ),
      1600,
    );
  }
}
companion.addEventListener("click", () => {
  sound.play("click");
  react("happy", "Hello there!");
});
soundButton.addEventListener("click", async () => {
  const enabled = await sound.toggle();
  soundButton.setAttribute("aria-pressed", String(enabled));
  soundButton.replaceChildren(
    document.createTextNode(enabled ? "Sound on ♪" : "Sound off ♪"),
  );
});
const speeds: Record<string, number> = { easy: 210, normal: 140, fast: 90 };
try {
  const saved = localStorage.getItem("snake-difficulty");
  if (saved && Object.hasOwn(speeds, saved)) difficulty.value = saved;
} catch {}
let active: GameId = "snake",
  game = new Snake(),
  paddle = new PaddleGame("pong");
let state: "ready" | "playing" | "paused" | "over" = "ready",
  frame = 0,
  lastTime = 0,
  accumulator = 0,
  best = 0;
const held = new Set<Direction>();
let touchAxis = 0;
const gameNames = { snake: "Snake", pong: "Pong", breakout: "Breakout" };
const hints = {
  snake: "ARROWS / WASD TO MOVE · SPACE TO PAUSE",
  pong: "← → / A D · DRAG TO MOVE · FIRST TO 7",
  breakout: "← → / A D · DRAG TO MOVE · CLEAR THE BRICKS",
};
function current() {
  return active === "snake" ? game : paddle;
}
function bestKey() {
  return difficulty.value === "normal"
    ? `${active}-best`
    : `${active}-best-${difficulty.value}`;
}
function loadBest() {
  best = 0;
  try {
    const saved = Number(localStorage.getItem(bestKey()));
    if (Number.isFinite(saved) && saved >= 0) best = Math.floor(saved);
  } catch {}
  bestLabel.textContent = String(best).padStart(2, "0");
}
const swatches = document.querySelectorAll<HTMLButtonElement>("[data-shell]");
function setShell(value: string) {
  const finish = ["lavender", "sage", "sand"].includes(value)
    ? value
    : "lavender";
  shell.dataset.finish = finish;
  swatches.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.shell === finish),
    ),
  );
}
try {
  setShell(localStorage.getItem("console-finish") || "lavender");
} catch {
  setShell("lavender");
}
swatches.forEach((button) =>
  button.addEventListener("click", () => {
    pause();
    setShell(button.dataset.shell!);
    sound.play("click");
    try {
      localStorage.setItem("console-finish", button.dataset.shell!);
    } catch {}
  }),
);
function draw() {
  ctx.fillStyle = "#a9ba8c";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "#94a77b";
  for (let x = 0; x < 20; x++)
    for (let y = 0; y < 20; y++) ctx.fillRect(x * 20 + 9, y * 20 + 9, 2, 2);
  let watchX = 0;
  if (active === "snake") {
    ctx.fillStyle = "#405a32";
    ctx.fillRect(game.food.x * 20 + 5, game.food.y * 20 + 5, 10, 10);
    ctx.fillStyle = "#dce7c4";
    ctx.fillRect(game.food.x * 20 + 7, game.food.y * 20 + 6, 3, 3);
    game.body.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? "#263d26" : "#4a6538";
      ctx.fillRect(part.x * 20 + 1, part.y * 20 + 1, 18, 18);
    });
    const head = game.body[0],
      x = head.x * 20,
      y = head.y * 20;
    ctx.fillStyle = "#d6e2ba";
    if (game.direction === "right" || game.direction === "left") {
      const eyeX = x + (game.direction === "right" ? 13 : 4);
      ctx.fillRect(eyeX, y + 4, 3, 3);
      ctx.fillRect(eyeX, y + 13, 3, 3);
    } else {
      const eyeY = y + (game.direction === "down" ? 13 : 4);
      ctx.fillRect(x + 4, eyeY, 3, 3);
      ctx.fillRect(x + 13, eyeY, 3, 3);
    }
    watchX = (head.x - 10) / 10;
  } else {
    ctx.fillStyle = "#263d26";
    ctx.fillRect(paddle.paddle - 40, 362, 80, 9);
    if (active === "pong") {
      ctx.fillRect(paddle.opponent - 40, 25, 80, 9);
      ctx.fillStyle = "#7c916a";
      for (let x = 5; x < 400; x += 20) ctx.fillRect(x, 198, 9, 3);
    } else {
      paddle.bricks.forEach((brick, i) => {
        if (brick.alive) {
          ctx.fillStyle = ["#2e482a", "#405b32", "#526d3e", "#64804b"][
            Math.floor(i / 7)
          ];
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.fillStyle = "#aec090";
          ctx.fillRect(brick.x + 3, brick.y + 3, brick.width - 6, 2);
        }
      });
    }
    ctx.fillStyle = "#263d26";
    ctx.fillRect(paddle.ball.x - 5, paddle.ball.y - 5, 10, 10);
    watchX = (paddle.ball.x - 200) / 200;
  }
  score.textContent = String(current().score).padStart(2, "0");
  $("#lives-value").textContent = String(paddle.lives);
  if (!reduced.matches)
    companion.style.setProperty(
      "--look",
      `${Math.max(-1, Math.min(1, watchX)) * 1.5}px`,
    );
}
function stop() {
  cancelAnimationFrame(frame);
  held.clear();
  touchAxis = 0;
}
function showOverlay(heading: string, copy: string, button: string) {
  overlay.hidden = false;
  title.textContent = heading;
  message.textContent = copy;
  start.textContent = button;
}
function fresh() {
  game = new Snake();
  paddle = new PaddleGame(
    active === "breakout" ? "breakout" : "pong",
    { easy: 0.8, normal: 1, fast: 1.3 }[difficulty.value] || 1,
  );
}
function reset() {
  stop();
  fresh();
  state = "ready";
  pauseButton.disabled = true;
  difficulty.disabled = false;
  pauseButton.firstChild!.textContent = "Pause ";
  status.textContent = "READY WHEN YOU ARE";
  showOverlay(
    "One quick game?",
    active === "snake"
      ? "The original time well wasted."
      : active === "pong"
        ? "Beat the other paddle. First to 7."
        : "Clear the bricks. Three lives.",
    `Play ${gameNames[active]} ↗`,
  );
  react("idle", "Ready to watch.");
  draw();
}
function finish() {
  stop();
  state = "over";
  pauseButton.disabled = true;
  difficulty.disabled = false;
  status.textContent = current().won ? "YOU WIN" : "GAME OVER";
  showOverlay(
    current().won ? "Nicely played!" : "Another round?",
    `Score ${current().score} · Best ${best}`,
    "Play again ↗",
  );
  sound.play(current().won ? "score" : "end");
  react(
    current().won ? "happy" : "sad",
    current().won ? "You did it!" : "One more try?",
  );
}
function update(dt: number) {
  const before = current().score,
    oldHits = paddle.hits,
    oldLives = paddle.lives;
  if (active === "snake") game.tick();
  else
    paddle.step(
      dt,
      touchAxis || Number(held.has("right")) - Number(held.has("left")),
    );
  if (current().score > before) {
    sound.play("score");
    react("happy", "Nice one!");
    score.classList.remove("score-pop");
    void score.offsetWidth;
    score.classList.add("score-pop");
  } else if (active !== "snake" && paddle.hits > oldHits) sound.play("hit");
  if (active !== "snake" && paddle.lives < oldLives) {
    sound.play("end");
    react("sad", "Still in the game.");
  }
  if (current().score > best) {
    best = current().score;
    bestLabel.textContent = String(best).padStart(2, "0");
    try {
      localStorage.setItem(bestKey(), String(best));
    } catch {}
  }
  if (current().over) finish();
}
function loop(time: number) {
  if (state !== "playing") return;
  accumulator += Math.min(time - lastTime, 50);
  lastTime = time;
  const interval = active === "snake" ? speeds[difficulty.value] : 1000 / 120;
  while (accumulator >= interval && state === "playing") {
    update(interval / 1000);
    accumulator -= interval;
  }
  draw();
  if (state === "playing") frame = requestAnimationFrame(loop);
}
function run() {
  stop();
  state = "playing";
  overlay.hidden = true;
  pauseButton.disabled = false;
  difficulty.disabled = true;
  pauseButton.firstChild!.textContent = "Pause ";
  status.textContent =
    active === "snake"
      ? "ARROWS / WASD · SPACE TO PAUSE"
      : "MOVE THE PADDLE · SPACE TO PAUSE";
  board.focus({ preventScroll: true });
  react("watching", "Following along.");
  lastTime = performance.now();
  accumulator = 0;
  frame = requestAnimationFrame(loop);
}
function pause() {
  if (state !== "playing") return;
  stop();
  state = "paused";
  pauseButton.firstChild!.textContent = "Resume ";
  status.textContent = "PAUSED";
  showOverlay("Take your time.", "Your game is right here.", "Resume ↗");
  react("idle", "No rush.");
}
start.addEventListener("click", () => {
  if (state !== "paused") fresh();
  sound.play("click");
  draw();
  run();
});
pauseButton.addEventListener("click", () => {
  sound.play("click");
  if (state === "playing") pause();
  else if (state === "paused") run();
});
$("#reset-game").addEventListener("click", () => {
  sound.play("click");
  reset();
});
difficulty.addEventListener("change", () => {
  loadBest();
  reset();
  try {
    localStorage.setItem("snake-difficulty", difficulty.value);
  } catch {}
});
const cartridges = document.querySelectorAll<HTMLButtonElement>("[data-game]");
cartridges.forEach((button) =>
  button.addEventListener("click", () => {
    if (active === button.dataset.game) return;
    active = button.dataset.game as GameId;
    cartridges.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    $("#console-game-name").textContent = gameNames[active].toUpperCase();
    $("#game-help").textContent = hints[active];
    $("#lives").hidden = active === "snake";
    board.setAttribute(
      "aria-label",
      `${gameNames[active]} game. ${active === "snake" ? "Use arrow keys or WASD." : "Use left/right arrows, A/D, or drag to move."} Space pauses.`,
    );
    canvas.setAttribute("aria-label", `${gameNames[active]} game board`);
    document
      .querySelectorAll<HTMLButtonElement>(
        '[data-direction="up"], [data-direction="down"]',
      )
      .forEach((b) => (b.disabled = active !== "snake"));
    loadBest();
    reset();
    sound.play("click");
    shell.classList.remove("cartridge-loaded");
    void shell.offsetWidth;
    shell.classList.add("cartridge-loaded");
  }),
);
const directions: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};
arcade.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.target instanceof HTMLSelectElement
  )
    return;
  const direction =
    directions[event.key] || directions[event.key.toLowerCase()];
  if (direction && state === "playing") {
    event.preventDefault();
    if (active === "snake") game.turn(direction);
    else held.add(direction);
  }
  if (event.code === "Space" && event.target === board) {
    event.preventDefault();
    if (state === "playing") pause();
    else if (state === "paused") run();
  }
});
window.addEventListener("keyup", (event) => {
  const direction =
    directions[event.key] || directions[event.key.toLowerCase()];
  if (direction) held.delete(direction);
});
document
  .querySelectorAll<HTMLButtonElement>("[data-direction]")
  .forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      if (active === "snake" || state !== "playing") return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      touchAxis = button.dataset.direction === "left" ? -1 : 1;
      board.focus({ preventScroll: true });
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(type, () => (touchAxis = 0));
    button.addEventListener("click", (event) => {
      if (state !== "playing") return;
      if (active === "snake") game.turn(button.dataset.direction as Direction);
      else if (event.detail === 0)
        paddle.target = Math.max(
          40,
          Math.min(
            360,
            paddle.target + (button.dataset.direction === "left" ? -28 : 28),
          ),
        );
      board.focus({ preventScroll: true });
    });
  });
let touchStart: { x: number; y: number } | null = null;
function paddlePointer(event: PointerEvent) {
  const rect = board.getBoundingClientRect();
  paddle.target = Math.max(
    40,
    Math.min(360, ((event.clientX - rect.left) / rect.width) * 400),
  );
}
board.addEventListener("pointerdown", (event) => {
  if (state !== "playing") return;
  if (active === "snake") {
    if (event.pointerType === "touch") {
      touchStart = { x: event.clientX, y: event.clientY };
      board.setPointerCapture(event.pointerId);
    }
  } else {
    event.preventDefault();
    board.setPointerCapture(event.pointerId);
    paddlePointer(event);
    board.focus({ preventScroll: true });
  }
});
board.addEventListener("pointermove", (event) => {
  if (
    active !== "snake" &&
    state === "playing" &&
    (event.pointerType === "mouse" || board.hasPointerCapture(event.pointerId))
  )
    paddlePointer(event);
});
board.addEventListener("pointerup", (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x,
    dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
  game.turn(
    Math.abs(dx) > Math.abs(dy)
      ? dx > 0
        ? "right"
        : "left"
      : dy > 0
        ? "down"
        : "up",
  );
});
board.addEventListener("pointercancel", () => (touchStart = null));
window.addEventListener("blur", pause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
arcade.addEventListener("focusout", (event) => {
  if (!arcade.contains(event.relatedTarget as Node | null)) pause();
});
new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) pause();
}).observe(board);
const contact = $<HTMLDialogElement>("#contact-dialog"),
  inspector = $<HTMLDialogElement>("#project-inspector");
document.querySelectorAll("[data-connect]").forEach((button) =>
  button.addEventListener("click", () => {
    pause();
    sound.play("click");
    contact.showModal();
  }),
);
$("#close-contact").addEventListener("click", () => contact.close());
document
  .querySelectorAll<HTMLButtonElement>("[data-copy-contact]")
  .forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyContact!;
      try {
        await navigator.clipboard.writeText(value);
        $("#contact-copy-status").textContent = "Discord username copied.";
      } catch {
        $("#contact-copy-status").textContent =
          `Couldn’t copy automatically. Select and copy the username: ${value}`;
      }
    });
  });
$("#close-inspector").addEventListener("click", () => inspector.close());
for (const dialog of [contact, inspector])
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });
const projectRows = document.querySelectorAll<HTMLElement>(
  "[data-project-index]",
);
let projectIndex = 0;
function setupScreenshotGallery() {
  const container = $("#inspector-content");
  const slides = container.querySelectorAll<HTMLElement>("[data-screenshot]");
  const controls = container.querySelector<HTMLElement>(".gallery-controls");
  if (!controls || slides.length < 2) return;
  controls.hidden = false;
  let selected = 0;
  const previous = controls.querySelector<HTMLButtonElement>(
    "[data-gallery-prev]",
  )!;
  const next = controls.querySelector<HTMLButtonElement>(
    "[data-gallery-next]",
  )!;
  const thumbnails = controls.querySelectorAll<HTMLButtonElement>(
    "[data-gallery-index]",
  );
  function select(index: number) {
    selected = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.hidden = i !== selected;
    });
    thumbnails.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === selected)),
    );
    previous.disabled = selected === 0;
    next.disabled = selected === slides.length - 1;
    controls!.querySelector("[data-gallery-count]")!.textContent =
      `${selected + 1} / ${slides.length}`;
  }
  previous.addEventListener("click", () => {
    select(selected - 1);
    if (previous.disabled) thumbnails[selected].focus({ preventScroll: true });
  });
  next.addEventListener("click", () => {
    select(selected + 1);
    if (next.disabled) thumbnails[selected].focus({ preventScroll: true });
  });
  thumbnails.forEach((button, i) =>
    button.addEventListener("click", () => select(i)),
  );
  select(0);
}
function showProject(index: number) {
  projectIndex = index;
  const template = $<HTMLTemplateElement>(`#project-template-${index}`);
  $("#inspector-content").replaceChildren(template.content.cloneNode(true));
  setupScreenshotGallery();
  $("#inspector-position").textContent = `${index + 1} / ${projectRows.length}`;
  $<HTMLButtonElement>("#previous-project").disabled = index === 0;
  $<HTMLButtonElement>("#next-project").disabled =
    index === projectRows.length - 1;
  inspector.scrollTop = 0;
}
projectRows.forEach((row, index) =>
  row.querySelector("summary")!.addEventListener("click", (event) => {
    event.preventDefault();
    pause();
    sound.play("click");
    showProject(index);
    inspector.showModal();
  }),
);
$("#previous-project").addEventListener("click", () => {
  if (projectIndex > 0) {
    showProject(projectIndex - 1);
    $("#close-inspector").focus();
    sound.play("click");
  }
});
$("#next-project").addEventListener("click", () => {
  if (projectIndex < projectRows.length - 1) {
    showProject(projectIndex + 1);
    $("#close-inspector").focus();
    sound.play("click");
  }
});
loadBest();
draw();
