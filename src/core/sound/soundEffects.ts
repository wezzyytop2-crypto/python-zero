// Lightweight procedural sound synthesizer using Web Audio API
// 100% offline, zero external mp3 files required!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Read mute preference from localStorage
    try {
      this.isMuted = localStorage.getItem('python_zero_sound_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('python_zero_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playTone(523.25, 0.1, 'sine', 0.15); // Friendly ding on unmute
    }
    return this.isMuted;
  }

  // Play a simple synthesized tone
  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.2, delay: number = 0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }

  // Duolingo-style cheerful major arpeggio when a task or quiz question is correct!
  public playSuccess(): void {
    if (this.isMuted) return;
    // C5, E5, G5, C6 in rapid succession
    this.playTone(523.25, 0.15, 'triangle', 0.22, 0.0);
    this.playTone(659.25, 0.15, 'triangle', 0.22, 0.08);
    this.playTone(783.99, 0.18, 'triangle', 0.24, 0.16);
    this.playTone(1046.50, 0.35, 'triangle', 0.28, 0.24);
  }

  // Gentle, soft boop on mistake (encouraging, not jarring)
  public playError(): void {
    if (this.isMuted) return;
    this.playTone(220.00, 0.18, 'sine', 0.2, 0.0);
    this.playTone(185.00, 0.22, 'sine', 0.22, 0.1);
  }

  // Grand celebratory fanfare on completing an entire lesson!
  public playLessonComplete(): void {
    if (this.isMuted) return;
    this.playTone(440.0, 0.15, 'triangle', 0.2, 0.0);
    this.playTone(554.37, 0.15, 'triangle', 0.2, 0.1);
    this.playTone(659.25, 0.15, 'triangle', 0.2, 0.2);
    this.playTone(880.0, 0.45, 'triangle', 0.3, 0.3);
  }

  // Click pop
  public playClick(): void {
    if (this.isMuted) return;
    this.playTone(800, 0.04, 'sine', 0.08, 0.0);
  }
}

export const soundManager = new SoundEngine();
