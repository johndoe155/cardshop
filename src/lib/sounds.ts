/**
 * Nemo's Card Shop — procedural sound design.
 *
 * 100% Web Audio, zero network. The old Howler layer hotlinked freesound
 * previews with preload:false and silently fell back to bare oscillator
 * beeps (square waves = buzzy arcade tones). Everything here is designed:
 * percussive hits are broadband noise transients through tuned bandpass
 * filters + resonant pitch-dropping thumps — the physics of a card slab
 * clicking into place — not single pure tones.
 *
 * Layer map (all routed through a shared compressor so nothing clips):
 *   hover     — faint airy tick, felt more than heard
 *   click     — mechanical switch: filtered snap + short tonal body
 *   slabClack — SIGNATURE: impact transient + 160→50Hz thump + case settle
 *   success   — detuned E-major-spaced chime, lowpassed, with air swell
 *   foil      — the one oscillator sweep worth keeping, now with shimmer
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let initialized = false;

export function initSounds() {
  if (initialized || typeof window === 'undefined') return;
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0.9;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;

    master.connect(comp);
    comp.connect(ctx.destination);

    // One shared white-noise buffer, reused by every percussive hit
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    initialized = true;
  } catch {
    ctx = null;
  }
}

function ready() {
  return !!(ctx && master && noiseBuffer);
}

/** Resume a suspended context (autoplay policy) on any scheduled sound. */
function wake() {
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

interface BurstOpts {
  freq: number;       // bandpass center
  q?: number;         // resonance
  vol?: number;
  decay?: number;     // seconds
  delay?: number;     // seconds from now
  highpass?: number;  // optional highpass pre-filter (shapes "air")
}

/** Filtered noise transient — the body of every physical "clack". */
function burst({ freq, q = 0.8, vol = 0.2, decay = 0.06, delay = 0, highpass }: BurstOpts) {
  if (!ready()) return;
  const t = ctx!.currentTime + delay;

  const noise = ctx!.createBufferSource();
  noise.buffer = noiseBuffer!;
  noise.playbackRate.value = 1;

  const band = ctx!.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = freq;
  band.Q.value = q;

  const gain = ctx!.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  noise.connect(band);
  if (highpass) {
    const hp = ctx!.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = highpass;
    band.connect(hp);
    hp.connect(gain);
  } else {
    band.connect(gain);
  }
  gain.connect(master!);

  noise.start(t);
  noise.stop(t + decay + 0.05);
}

interface ToneOpts {
  freq: number;
  slideTo?: number;
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  decay?: number;
  delay?: number;
  lowpass?: number;
  detune?: number; // cents — adds shimmer when paired with a second voice
}

/** Pure/tonal voice with proper attack ramp (no zero-crossing clicks). */
function tone({ freq, slideTo, type = 'sine', vol = 0.1, attack = 0.006, decay = 0.15, delay = 0, lowpass, detune }: ToneOpts) {
  if (!ready()) return;
  const t = ctx!.currentTime + delay;

  const osc = ctx!.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + decay * 0.8);
  if (detune) osc.detune.value = detune;

  const gain = ctx!.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  let tail: AudioNode = gain;
  if (lowpass) {
    const lp = ctx!.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lowpass;
    gain.connect(lp);
    tail = lp;
  }

  osc.connect(gain);
  tail.connect(master!);

  osc.start(t);
  osc.stop(t + decay + 0.1);
}

export const sounds = {
  hover: () => {
    if (!ready()) return;
    wake();
    // Airy micro-tick: a whisper of high bandpassed noise + faint tonal ghost
    burst({ freq: 6200, q: 1.2, vol: 0.02, decay: 0.03, highpass: 3000 });
    tone({ freq: 1560, vol: 0.012, decay: 0.05, lowpass: 4000 });
  },

  click: () => {
    if (!ready()) return;
    wake();
    // Mechanical switch: crisp filtered snap (not a square buzz) + tonal body
    burst({ freq: 2300, q: 0.9, vol: 0.14, decay: 0.035 });
    burst({ freq: 700, q: 1.4, vol: 0.08, decay: 0.05, delay: 0.004 });
    tone({ freq: 340, slideTo: 190, vol: 0.05, decay: 0.07, lowpass: 2400 });
  },

  slabClack: () => {
    if (!ready()) return;
    wake();
    // 1. Impact transient — broadband snap, like PETG hitting the anvil
    burst({ freq: 950, q: 0.7, vol: 0.3, decay: 0.055 });
    // 2. Resonant thump — mass arriving: pitch drops 160→50Hz
    tone({ freq: 160, slideTo: 50, type: 'sine', vol: 0.3, attack: 0.004, decay: 0.16 });
    // 3. Case settle — the smaller second click as the slab seats
    burst({ freq: 1500, q: 1.1, vol: 0.12, decay: 0.04, delay: 0.055 });
    tone({ freq: 90, vol: 0.06, decay: 0.1, delay: 0.055 });
  },

  success: () => {
    if (!ready()) return;
    wake();
    // Detuned chime (E5 / B5 / E6), staggered, lowpassed for warmth
    const chime = (freq: number, delay: number, vol: number, dur: number) => {
      tone({ freq, vol, decay: dur, delay, lowpass: 4200 });
      tone({ freq, vol: vol * 0.4, decay: dur, delay, lowpass: 4200, detune: 4 });
    };
    chime(659, 0, 0.09, 0.5);
    chime(988, 0.09, 0.09, 0.6);
    chime(1319, 0.18, 0.1, 0.9);
    // Air swell underneath — the "vault seal" breath
    burst({ freq: 5200, q: 0.6, vol: 0.03, decay: 0.5, highpass: 2500 });
  },

  foil: () => {
    if (!ready()) return;
    wake();
    // Shimmer sweep: sawtooth through a moving bandpass + noise air
    if (ready()) {
      const t = ctx!.currentTime;
      const osc = ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(2800, t + 0.4);

      const band = ctx!.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.setValueAtTime(1200, t);
      band.frequency.exponentialRampToValueAtTime(4200, t + 0.4);
      band.Q.value = 2.2;

      const gain = ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.03, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(band);
      band.connect(gain);
      gain.connect(master!);
      osc.start(t);
      osc.stop(t + 0.5);
    }
    burst({ freq: 7200, q: 0.5, vol: 0.018, decay: 0.35, highpass: 4000 });
  },
};
