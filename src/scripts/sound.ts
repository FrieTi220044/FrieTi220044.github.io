// Created only after a deliberate sound-button click; never plays automatically.
export class ArcadeSound {
  enabled = false;
  private context: AudioContext | null = null;
  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      return false;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.enabled = this.context.state === "running";
      if (this.enabled) this.play("click");
    } catch {
      this.enabled = false;
    }
    return this.enabled;
  }
  play(kind: "click" | "hit" | "score" | "end") {
    if (!this.enabled || !this.context || this.context.state !== "running")
      return;
    const oscillator = this.context.createOscillator(),
      gain = this.context.createGain(),
      now = this.context.currentTime;
    const duration = kind === "end" ? 0.22 : 0.065;
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(
      { click: 320, hit: 180, score: 660, end: 140 }[kind],
      now,
    );
    if (kind === "score")
      oscillator.frequency.exponentialRampToValueAtTime(990, now + duration);
    if (kind === "end")
      oscillator.frequency.exponentialRampToValueAtTime(60, now + duration);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
