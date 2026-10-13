import { Snake, type Direction } from "./snake";
const dialog = document.querySelector<HTMLDialogElement>("#contact-dialog")!;
document.querySelectorAll("[data-connect]").forEach((button) =>
  button.addEventListener("click", () => {
    pause();
    dialog.showModal();
  }),
);
document
  .querySelector("#close-contact")
  ?.addEventListener("click", () => dialog.close());
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
const board = document.querySelector<HTMLElement>("#board")!;
const canvas = document.querySelector<HTMLCanvasElement>("#snake-canvas")!;
const ctx = canvas.getContext("2d")!;
const overlay = document.querySelector<HTMLElement>("#game-overlay")!;
const title = document.querySelector<HTMLElement>("#game-title")!;
const message = document.querySelector<HTMLElement>("#game-message")!;
const start = document.querySelector<HTMLButtonElement>("#start-game")!;
const pauseButton = document.querySelector<HTMLButtonElement>("#pause-game")!;
const status = document.querySelector<HTMLElement>("#game-status")!;
const score = document.querySelector<HTMLElement>("#score")!;
const bestLabel = document.querySelector<HTMLElement>("#best")!;
let game = new Snake(),
  state: "ready" | "playing" | "paused" | "over" = "ready",
  timer: ReturnType<typeof setInterval> | undefined;
let best = 0;
try {
  const saved = Number(localStorage.getItem("snake-best"));
  if (Number.isFinite(saved) && saved >= 0) best = Math.floor(saved);
} catch {}
bestLabel.textContent = String(best).padStart(2, "0");
function draw() {
  ctx.fillStyle = "#a9ba8c";
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = "#94a77b";
  for (let x = 0; x < 20; x++)
    for (let y = 0; y < 20; y++) ctx.fillRect(x * 20 + 9, y * 20 + 9, 2, 2);
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
  score.textContent = String(game.score).padStart(2, "0");
}
function stopTimer() {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}
function showOverlay(heading: string, copy: string, button: string) {
  overlay.hidden = false;
  title.textContent = heading;
  message.textContent = copy;
  start.replaceChildren(document.createTextNode(button));
}
function run() {
  stopTimer();
  state = "playing";
  overlay.hidden = true;
  pauseButton.disabled = false;
  pauseButton.firstChild!.textContent = "Pause ";
  status.textContent = "ARROWS / WASD · SPACE TO PAUSE";
  board.focus({ preventScroll: true });
  timer = setInterval(() => {
    game.tick();
    draw();
    if (game.score > best) {
      best = game.score;
      bestLabel.textContent = String(best).padStart(2, "0");
      try {
        localStorage.setItem("snake-best", String(best));
      } catch {}
    }
    if (game.over) {
      stopTimer();
      state = "over";
      pauseButton.disabled = true;
      status.textContent = game.won ? "BOARD CLEARED" : "GAME OVER";
      showOverlay(
        game.won ? "You filled the board!" : "Another round?",
        `Score ${game.score} · Best ${best}`,
        "Play again ↗",
      );
    }
  }, 140);
}
function pause() {
  if (state !== "playing") return;
  stopTimer();
  state = "paused";
  pauseButton.firstChild!.textContent = "Resume ";
  status.textContent = "PAUSED";
  showOverlay("Take your time.", "Your game is right here.", "Resume ↗");
}
start.addEventListener("click", () => {
  if (state !== "paused") game = new Snake();
  draw();
  run();
});
pauseButton.addEventListener("click", () => {
  if (state === "playing") pause();
  else if (state === "paused") run();
});
document.querySelector("#reset-game")!.addEventListener("click", () => {
  stopTimer();
  game = new Snake();
  state = "ready";
  draw();
  pauseButton.disabled = true;
  pauseButton.firstChild!.textContent = "Pause ";
  status.textContent = "READY WHEN YOU ARE";
  showOverlay(
    "One quick game?",
    "The original time well wasted.",
    "Play Snake ↗",
  );
});
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
const arcade = document.querySelector<HTMLElement>("#arcade")!;
arcade.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const direction =
    directions[event.key] || directions[event.key.toLowerCase()];
  if (direction && state === "playing") {
    event.preventDefault();
    game.turn(direction);
  }
  if (event.code === "Space" && event.target === board) {
    event.preventDefault();
    if (state === "playing") pause();
    else if (state === "paused") run();
  }
});
document
  .querySelectorAll<HTMLButtonElement>("[data-direction]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      if (state === "playing") {
        game.turn(button.dataset.direction as Direction);
        board.focus({ preventScroll: true });
      }
    }),
  );
let touchStart: { x: number; y: number } | null = null;
board.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" && state === "playing") {
    touchStart = { x: event.clientX, y: event.clientY };
    board.setPointerCapture(event.pointerId);
  }
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
board.addEventListener("pointercancel", () => {
  touchStart = null;
});
window.addEventListener("blur", pause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
arcade.addEventListener("focusout", (event) => {
  if (!arcade.contains(event.relatedTarget as Node | null)) pause();
});
new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) pause();
  },
  { threshold: 0 },
).observe(board);
draw();
