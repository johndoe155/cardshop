import { Howl } from 'howler';

let hoverSound: Howl | null = null;
let clickSound: Howl | null = null;
let successSound: Howl | null = null;
let initialized = false;

function createBeep(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1): string {
  // Create data URI wav via Web Audio offline rendering would be complex
  // Instead we use Howler with empty src and rely on Web Audio synth fallback
  // For now return a tiny base64 silent wav and we'll synth via WebAudio
  return '';
}

// Web Audio synth fallback
let audioCtx: AudioContext | null = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function synthTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, slideTo?: number) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
  }
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function initSounds() {
  if (initialized || typeof window === 'undefined') return;
  
  // Try to init Howler with CDN sounds, fallback to synth
  try {
    hoverSound = new Howl({
      src: ['https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3'],
      volume: 0.15,
      preload: false,
    });
    clickSound = new Howl({
      src: ['https://cdn.freesound.org/previews/270/270303_5123851-lq.mp3'],
      volume: 0.25,
      preload: false,
    });
    successSound = new Howl({
      src: ['https://cdn.freesound.org/previews/270/270310_5123851-lq.mp3'],
      volume: 0.3,
      preload: false,
    });
  } catch {}
  
  initialized = true;
}

export const sounds = {
  hover: () => {
    try {
      if (hoverSound?.state() === 'loaded') hoverSound.play();
      else synthTone(800, 0.08, 'sine', 0.04);
    } catch { synthTone(800, 0.08, 'sine', 0.04); }
  },
  click: () => {
    try {
      if (clickSound?.state() === 'loaded') clickSound.play();
      else {
        synthTone(220, 0.12, 'square', 0.12);
        setTimeout(() => synthTone(440, 0.08, 'sine', 0.06), 40);
      }
    } catch {
      synthTone(220, 0.12, 'square', 0.12);
    }
  },
  success: () => {
    try {
      if (successSound?.state() === 'loaded') successSound.play();
      else {
        synthTone(440, 0.15, 'sine', 0.08);
        setTimeout(() => synthTone(660, 0.15, 'sine', 0.08), 80);
        setTimeout(() => synthTone(880, 0.3, 'sine', 0.1), 160);
      }
    } catch {
      synthTone(440, 0.15, 'sine', 0.08);
      setTimeout(() => synthTone(880, 0.3, 'sine', 0.1), 120);
    }
  },
  slabClack: () => {
    synthTone(80, 0.25, 'square', 0.18);
    setTimeout(() => synthTone(120, 0.1, 'triangle', 0.08), 30);
  },
  foil: () => {
    synthTone(1200, 0.4, 'sawtooth', 0.02, 2400);
  }
};
