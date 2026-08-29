// Web Audio API Sound Synthesizer for DroidOS
// Provides instant high-fidelity audio feedback without needing external mp3 dependencies

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public play(presetName: string) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      switch (presetName) {
        case 'airhorn':
          this.playAirhorn(now);
          break;
        case 'coin':
        case 'coins':
          this.playCoin(now);
          break;
        case 'level_up':
        case 'levelup':
          this.playLevelUp(now);
          break;
        case 'jackpot':
          this.playJackpot(now);
          break;
        case 'victory':
        case 'win':
          this.playVictory(now);
          break;
        case 'laser':
        case 'boss_attack':
          this.playLaser(now);
          break;
        case 'heist_alarm':
        case 'alarm':
          this.playAlarm(now);
          break;
        case 'xbox_chime':
        case 'xbox':
          this.playXboxChime(now);
          break;
        case 'ps_trophy':
        case 'playstation':
          this.playPlayStationTrophy(now);
          break;
        case 'steam_ding':
        case 'steam':
          this.playSteamDing(now);
          break;
        case 'fireball':
        case 'fireball_whoosh':
          this.playFireball(now);
          break;
        case 'cyber_glitch':
        case 'glitch':
          this.playCyberGlitch(now);
          break;
        case 'freeze_crack':
        case 'freeze':
          this.playFreezeCrack(now);
          break;
        case 'void_collapse':
        case 'void':
          this.playVoidCollapse(now);
          break;
        case 'boss_defeat':
        case 'boss_down':
          this.playBossDefeat(now);
          break;
        case 'shootout':
        case 'duel_shot':
          this.playShootout(now);
          break;
        case 'chime':
        case 'shoutout':
          this.playShoutoutChime(now);
          break;
        case 'slot_spin':
          this.playSlotSpin(now);
          break;
        case 'error':
        case 'lose':
          this.playErrorBuzz(now);
          break;
        default:
          this.playCoin(now);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  private playAirhorn(now: number) {
    if (!this.ctx) return;
    const freqs = [466.16, 466.16, 466.16, 370.0, 415.3, 466.16];
    const times = [0, 0.12, 0.24, 0.38, 0.52, 0.68];
    const durations = [0.08, 0.08, 0.1, 0.1, 0.1, 0.35];

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + times[i]);

      gain.gain.setValueAtTime(0, now + times[i]);
      gain.gain.linearRampToValueAtTime(0.35 * this.masterVolume, now + times[i] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + durations[i]);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + times[i]);
      osc.stop(now + times[i] + durations[i]);
    });
  }

  private playCoin(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  private playLevelUp(now: number) {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (idx === 3 ? 0.6 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + (idx === 3 ? 0.6 : 0.2));
    });
  }

  private playJackpot(now: number) {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.07;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2 * this.masterVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  private playVictory(now: number) {
    if (!this.ctx) return;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.4 },
      { f: 587.33, d: 0.2 },
      { f: 659.25, d: 0.6 }
    ];

    let accum = 0;
    melody.forEach(({ f, d }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + accum;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.35 * this.masterVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + d);
      accum += d * 0.85;
    });
  }

  private playLaser(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private playAlarm(now: number) {
    if (!this.ctx) return;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.18;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.linearRampToValueAtTime(440, t + 0.12);

      gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  private playShoutoutChime(now: number) {
    if (!this.ctx) return;
    const chords = [587.33, 739.99, 880.0, 1174.66]; // D Major
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.8);
    });
  }

  private playSlotSpin(now: number) {
    if (!this.ctx) return;
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + i * 40, t);

      gain.gain.setValueAtTime(0.12 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  private playErrorBuzz(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(100, now + 0.15);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Xbox Achievement Chime (Iconic snappy high double-tone)
  private playXboxChime(now: number) {
    if (!this.ctx) return;
    // Note 1: E6 (1318.51Hz) -> Note 2: B6 (1975.53Hz)
    const tones = [
      { freq: 1318.51, start: 0, dur: 0.12 },
      { freq: 1975.53, start: 0.09, dur: 0.75 }
    ];

    tones.forEach((t) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);

      gain.gain.setValueAtTime(0, now + t.start);
      gain.gain.linearRampToValueAtTime(0.35 * this.masterVolume, now + t.start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur);
    });
  }

  // PlayStation Trophy Chime (Sparkly metallic harmonic arpeggio)
  private playPlayStationTrophy(now: number) {
    if (!this.ctx) return;
    const freqs = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28 * this.masterVolume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // Steam Notification Ding
  private playSteamDing(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880.0, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760.0, now + 0.08); // A6

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Fireball Whoosh & Roar
  private playFireball(now: number) {
    if (!this.ctx) return;
    // Low frequency rumbling roar with frequency drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.4);
  }

  // Cyber Glitch Digital Sound
  private playCyberGlitch(now: number) {
    if (!this.ctx) return;
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(150 + Math.random() * 800, t);

      gain.gain.setValueAtTime(0.2 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  // Freeze Ice Cracking Sound
  private playFreezeCrack(now: number) {
    if (!this.ctx) return;
    const freqs = [2400, 3100, 1800, 3900, 2200];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.1);

      gain.gain.setValueAtTime(0.22 * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  // Void Collapse Singularity
  private playVoidCollapse(now: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.5);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.6);
  }

  // Boss Defeat Victory Fanfare
  private playBossDefeat(now: number) {
    if (!this.ctx) return;
    const fanfare = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.15, dur: 0.15 },
      { freq: 783.99, time: 0.3, dur: 0.15 },
      { freq: 1046.5, time: 0.45, dur: 0.8 }
    ];

    fanfare.forEach((f) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + f.time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f.freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35 * this.masterVolume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + f.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + f.dur);
    });
  }

  // Duel Standoff Shootout
  private playShootout(now: number) {
    if (!this.ctx) return;
    // Gunshot impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    gain.gain.setValueAtTime(0.5 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const soundSynth = new SoundSynthesizer();
