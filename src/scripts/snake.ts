export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
const vectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
export class Snake {
  readonly size = 20;
  body: Point[] = [
    { x: 7, y: 10 },
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
  ];
  direction: Direction = "right";
  nextDirection: Direction = "right";
  food: Point;
  score = 0;
  over = false;
  won = false;
  private queued = false;
  constructor(private random: () => number = Math.random) {
    this.food = this.placeFood();
  }
  private placeFood(): Point {
    const free: Point[] = [];
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++)
        if (!this.body.some((p) => p.x === x && p.y === y)) free.push({ x, y });
    return (
      free[
        Math.min(free.length - 1, Math.floor(this.random() * free.length))
      ] || { x: -1, y: -1 }
    );
  }
  turn(direction: Direction) {
    if (this.queued || this.over) return;
    const current = vectors[this.direction],
      next = vectors[direction];
    if (current.x + next.x === 0 && current.y + next.y === 0) return;
    if (direction === this.direction) return;
    this.nextDirection = direction;
    this.queued = true;
  }
  tick() {
    if (this.over) return;
    this.direction = this.nextDirection;
    this.queued = false;
    const vector = vectors[this.direction],
      head = { x: this.body[0].x + vector.x, y: this.body[0].y + vector.y };
    const eating = head.x === this.food.x && head.y === this.food.y;
    const occupied = eating ? this.body : this.body.slice(0, -1);
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= this.size ||
      head.y >= this.size ||
      occupied.some((p) => p.x === head.x && p.y === head.y)
    ) {
      this.over = true;
      return;
    }
    this.body.unshift(head);
    if (eating) {
      this.score++;
      if (this.body.length === this.size * this.size) {
        this.won = true;
        this.over = true;
      } else this.food = this.placeFood();
    } else this.body.pop();
  }
}
