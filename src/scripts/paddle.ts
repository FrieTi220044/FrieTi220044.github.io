export type PaddleMode = "pong" | "breakout";
export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export class PaddleGame {
  ball = { x: 200, y: 260, vx: 90, vy: -150 };
  paddle = 200;
  opponent = 200;
  target = 200;
  score = 0;
  lives = 3;
  over = false;
  won = false;
  hits = 0;
  bricks: Brick[] = [];
  constructor(
    public mode: PaddleMode,
    public speed = 1,
  ) {
    if (mode === "breakout")
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 7; col++)
          this.bricks.push({
            x: 13 + col * 54,
            y: 40 + row * 24,
            width: 48,
            height: 17,
            alive: true,
          });
  }
  private serve() {
    this.ball = {
      x: 200,
      y: 260,
      vx: this.score % 2 === 0 ? 90 : -90,
      vy: -150,
    };
  }
  private bounce(paddle: number, up: boolean) {
    const offset = clamp((this.ball.x - paddle) / 40, -1, 1);
    this.ball.vx = offset * 170;
    this.ball.vy =
      (up ? -1 : 1) * Math.sqrt(210 * 210 - this.ball.vx * this.ball.vx);
    this.hits++;
  }
  step(dt: number, axis = 0) {
    if (this.over) return;
    dt = clamp(dt, 0, 1 / 30);
    if (axis) this.target = clamp(this.paddle + axis * 340 * dt, 40, 360);
    this.paddle = clamp(this.target, 40, 360);
    const previous = { x: this.ball.x, y: this.ball.y };
    this.ball.x += this.ball.vx * dt * this.speed;
    this.ball.y += this.ball.vy * dt * this.speed;
    if (this.ball.x < 6) {
      this.ball.x = 6;
      this.ball.vx = Math.abs(this.ball.vx);
      this.hits++;
    }
    if (this.ball.x > 394) {
      this.ball.x = 394;
      this.ball.vx = -Math.abs(this.ball.vx);
      this.hits++;
    }
    if (
      this.ball.vy > 0 &&
      previous.y <= 356 &&
      this.ball.y >= 356 &&
      Math.abs(this.ball.x - this.paddle) <= 46
    ) {
      this.ball.y = 356;
      this.bounce(this.paddle, true);
    }
    if (this.mode === "pong") {
      this.opponent = clamp(
        this.opponent + clamp(this.ball.x - this.opponent, -115 * dt, 115 * dt),
        40,
        360,
      );
      if (
        this.ball.vy < 0 &&
        previous.y >= 40 &&
        this.ball.y <= 40 &&
        Math.abs(this.ball.x - this.opponent) <= 46
      ) {
        this.ball.y = 40;
        this.bounce(this.opponent, false);
      }
      if (this.ball.y < -6) {
        this.score++;
        this.serve();
        if (this.score >= 7) {
          this.over = true;
          this.won = true;
        }
        return;
      }
    } else {
      if (this.ball.y < 6) {
        this.ball.y = 6;
        this.ball.vy = Math.abs(this.ball.vy);
        this.hits++;
      }
      for (const brick of this.bricks) {
        if (
          !brick.alive ||
          this.ball.x + 6 < brick.x ||
          this.ball.x - 6 > brick.x + brick.width ||
          this.ball.y + 6 < brick.y ||
          this.ball.y - 6 > brick.y + brick.height
        )
          continue;
        brick.alive = false;
        this.score++;
        this.hits++;
        if (
          previous.y + 6 <= brick.y ||
          previous.y - 6 >= brick.y + brick.height
        )
          this.ball.vy *= -1;
        else this.ball.vx *= -1;
        if (this.bricks.every((b) => !b.alive)) {
          this.over = true;
          this.won = true;
        }
        break;
      }
    }
    if (this.ball.y > 406) {
      this.lives--;
      if (this.lives === 0) this.over = true;
      else this.serve();
    }
  }
}
