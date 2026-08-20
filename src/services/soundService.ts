// Web Audio API Sound Synthesizer for low-resource stream sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthesizedSound(preset: string, volume: number = 0.5, deviceId?: string) {
  try {
    const ctx = getAudioContext();
    
    // Experimental: setSinkId for Web Audio
    if (deviceId && (ctx as any).setSinkId) {
      (ctx as any).setSinkId(deviceId).catch((e: any) => console.warn('[DroidOS Audio] setSinkId failed:', e));
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.3, now);
    masterGain.connect(ctx.destination);

    switch (preset) {
      case 'level_up': {
        // Arpeggio chords
        const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          noteGain.gain.setValueAtTime(0.01, now + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.4, now + idx * 0.08 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }

      case 'coin': {
        // High ping
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);

        noteGain.gain.setValueAtTime(0.5, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'fanfare': {
        const fanfareNotes = [392.0, 392.0, 392.0, 523.25];
        const times = [0, 0.12, 0.24, 0.38];
        const durations = [0.1, 0.1, 0.1, 0.4];

        fanfareNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + times[i]);

          noteGain.gain.setValueAtTime(0.2, now + times[i]);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + durations[i]);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + durations[i]);
        });
        break;
      }

      case 'airhorn': {
        const chord = [370, 372, 466, 554];
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          noteGain.gain.setValueAtTime(0.2, now);
          noteGain.gain.linearRampToValueAtTime(0.25, now + 0.15);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.5);
        });
        break;
      }

      case 'zap': {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

        noteGain.gain.setValueAtTime(0.4, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'bell': {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);

        noteGain.gain.setValueAtTime(0.5, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }

      case 'applause':
      default: {
        // Noise burst simulating clap
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.45);
        break;
      }
    }
  } catch (err) {
    console.warn('[DroidOS Sound] Audio play error:', err);
  }
}

export function playCustomAudioUrl(url: string, volume: number = 0.5, deviceId?: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(url);
      audio.volume = Math.min(1, Math.max(0, volume));
      
      // Experimental: setSinkId for HTMLAudioElement
      if (deviceId && (audio as any).setSinkId) {
        (audio as any).setSinkId(deviceId).catch((e: any) => console.warn('[DroidOS Audio] setSinkId failed:', e));
      }

      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      
      audio.play().catch((e) => {
        console.warn('[DroidOS Audio] Audio URL play failed:', e);
        resolve();
      });
      
      // Fallback: resolve after 10 seconds if it's stuck or very long
      setTimeout(() => resolve(), 10000);
    } catch (e) {
      console.warn('[DroidOS Audio] URL error:', e);
      resolve();
    }
  });
}
