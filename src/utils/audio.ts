/**
 * Web Audio API Synthesizer
 * Zero external audio assets required - pure synthesized acoustic tones.
 */

let audioCtx: AudioContext | null = null;
let musicInterval: ReturnType<typeof setTimeout> | null = null;
let chargingOsc: OscillatorNode | null = null;
let chargingGain: GainNode | null = null;
let lastTypeSoundTime = 0;
let lastScratchSoundTime = 0;

export function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function playTone(freq: number, duration = 0.4, type: OscillatorType = "sine", gainLevel = 0.15) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Tone playback error", e);
  }
}

export function playChimeSound() {
  if (!audioCtx) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((note, idx) => {
    setTimeout(() => playTone(note, 0.6, "triangle", 0.12), idx * 100);
  });
}

/**
 * Aesthetic Realistic Page Turn Sound
 * Combination of filtered pink noise sweep (paper friction) + soft warm resonance chime.
 */
export function playPageTurnSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const duration = 0.38;
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate gentle filtered swoosh noise (paper curve and glide)
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Dynamic bandpass filter sweeping from high to low (page sliding over)
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration);
    filter.Q.setValueAtTime(2.2, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);

    // Warm wooden / parchment soft tap at the end of the page flip
    setTimeout(() => {
      if (!audioCtx) return;
      playTone(440, 0.25, "sine", 0.04);
      playTone(880, 0.3, "triangle", 0.02);
    }, 180);
  } catch (e) {
    console.error("Page turn audio error", e);
  }
}

export function playPaperSlideSound() {
  if (!audioCtx) return;
  try {
    const bufferSize = audioCtx.sampleRate * 0.25;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
    filter.Q.setValueAtTime(2.5, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    whiteNoise.start();
  } catch (e) {
    console.error("Paper slide audio error", e);
  }
}

export function startChargingSound() {
  if (!audioCtx) return;
  try {
    chargingOsc = audioCtx.createOscillator();
    chargingGain = audioCtx.createGain();

    chargingOsc.type = "triangle";
    chargingOsc.frequency.setValueAtTime(180, audioCtx.currentTime);

    chargingGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    chargingGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.3);

    chargingOsc.connect(chargingGain);
    chargingGain.connect(audioCtx.destination);

    chargingOsc.start();
  } catch (e) {
    console.error("Charge sound error", e);
  }
}

export function updateChargingSound(progress: number) {
  if (!chargingOsc || !chargingGain || !audioCtx) return;
  try {
    const targetFreq = 180 + progress * 420;
    chargingOsc.frequency.setValueAtTime(targetFreq, audioCtx.currentTime);
    const targetGain = 0.04 + progress * 0.09;
    chargingGain.gain.setValueAtTime(targetGain, audioCtx.currentTime);
  } catch (e) {
    console.error("Charge update error", e);
  }
}

export function stopChargingSound() {
  if (chargingGain && audioCtx) {
    try {
      chargingGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      setTimeout(() => {
        if (chargingOsc) {
          chargingOsc.stop();
          chargingOsc.disconnect();
          chargingOsc = null;
        }
        if (chargingGain) {
          chargingGain.disconnect();
          chargingGain = null;
        }
      }, 120);
    } catch {
      chargingOsc = null;
      chargingGain = null;
    }
  }
}

export function playWaxCrackSound() {
  if (!audioCtx) return;
  try {
    const bufferSize = audioCtx.sampleRate * 0.18;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();

    // Impact thump
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(130, audioCtx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
    subGain.gain.setValueAtTime(0.28, audioCtx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start();
    subOsc.stop(audioCtx.currentTime + 0.15);

    // Golden sparkle chime
    setTimeout(() => {
      playTone(880, 0.4, "triangle", 0.09);
      playTone(1320, 0.5, "sine", 0.06);
    }, 40);
  } catch (e) {
    console.error("Wax crack sound error", e);
  }
}

export function playScratchSound() {
  if (!audioCtx) return;
  const now = Date.now();
  if (now - lastScratchSoundTime < 60) return;
  lastScratchSoundTime = now;

  try {
    const bufferSize = audioCtx.sampleRate * 0.04;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2500 + Math.random() * 1500, audioCtx.currentTime);
    filter.Q.setValueAtTime(4, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (e) {
    console.error("Scratch sound error", e);
  }
}

export function playTriumphChime() {
  if (!audioCtx) return;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
  notes.forEach((note, idx) => {
    setTimeout(() => {
      playTone(note, 0.7, "triangle", 0.14);
      playTone(note * 1.5, 0.4, "sine", 0.06);
    }, idx * 80);
  });
}

export function playTypewriterClickSound(char: string) {
  if (!audioCtx) return;
  const now = Date.now();
  if (now - lastTypeSoundTime < 28) return;
  lastTypeSoundTime = now;

  try {
    const isSpace = char === " ";
    const isPunctuation = [".", "!", "?", ",", ";", ":", "—", "-"].includes(char);

    const bufferSize = audioCtx.sampleRate * (isSpace ? 0.022 : 0.014);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    const centerFreq = isSpace ? 1200 : (isPunctuation ? 2600 : 2100 + Math.random() * 700);
    filter.frequency.setValueAtTime(centerFreq, audioCtx.currentTime);
    filter.Q.setValueAtTime(isSpace ? 2.5 : 4, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    const peakGain = isSpace ? 0.04 : (isPunctuation ? 0.06 : 0.048);
    gain.gain.setValueAtTime(peakGain, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (isSpace ? 0.022 : 0.014));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (e) {
    console.error("Typewriter sound error", e);
  }
}

export function playMidnightGong() {
  if (!audioCtx) return;
  try {
    const bellFrequencies = [220, 440, 660, 880, 1100, 1540];
    bellFrequencies.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      const amp = 0.22 / (idx + 1);
      gain.gain.setValueAtTime(amp, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 3.2);
    });

    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((note, idx) => {
      setTimeout(() => {
        playTone(note, 0.8, "sine", 0.08);
      }, idx * 60);
    });
  } catch (e) {
    console.error("Midnight gong error", e);
  }
}

const HB_MELODY = [
  { note: 261.63, dur: 0.35 },
  { note: 261.63, dur: 0.35 },
  { note: 293.66, dur: 0.7 },
  { note: 261.63, dur: 0.7 },
  { note: 349.23, dur: 0.7 },
  { note: 329.63, dur: 1.2 },

  { note: 261.63, dur: 0.35 },
  { note: 261.63, dur: 0.35 },
  { note: 293.66, dur: 0.7 },
  { note: 261.63, dur: 0.7 },
  { note: 392.00, dur: 0.7 },
  { note: 349.23, dur: 1.2 },

  { note: 261.63, dur: 0.35 },
  { note: 261.63, dur: 0.35 },
  { note: 523.25, dur: 0.7 },
  { note: 440.00, dur: 0.7 },
  { note: 349.23, dur: 0.7 },
  { note: 329.63, dur: 0.7 },
  { note: 293.66, dur: 1.2 },

  { note: 466.16, dur: 0.35 },
  { note: 466.16, dur: 0.35 },
  { note: 440.00, dur: 0.7 },
  { note: 349.23, dur: 0.7 },
  { note: 392.00, dur: 0.7 },
  { note: 349.23, dur: 1.5 },
];

export function startMusicBox(onStep?: () => void) {
  if (musicInterval) clearTimeout(musicInterval);
  let step = 0;

  function playNextNote() {
    const item = HB_MELODY[step % HB_MELODY.length];
    playTone(item.note, item.dur * 1.5, "sine", 0.08);
    playTone(item.note * 2, item.dur * 0.8, "triangle", 0.03);

    if (onStep) onStep();
    step++;
    const nextDelay = item.dur * 650;
    musicInterval = setTimeout(playNextNote, nextDelay);
  }

  playNextNote();
}

export function stopMusicBox() {
  if (musicInterval) {
    clearTimeout(musicInterval);
    musicInterval = null;
  }
}

/**
 * Realistic Gift Box Wrapping Paper Tearing Sound
 * Generates tactile noise bursts with frequency modulation and crisp shredding texture.
 */
export function playTearPaperSound(step: number = 1) {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const duration = 0.28 + Math.random() * 0.12;
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Multi-grain crisp paper crunch/rip texture
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI);
      const grain = Math.random() > 0.4 ? (Math.random() * 2 - 1) : 0;
      data[i] = grain * envelope;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Sweeping bandpass filter to emulate paper tearing pitch
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    const startFreq = 2200 + step * 400;
    const endFreq = 900 + Math.random() * 300;
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noiseSource.start(now);

    // Add crisp snap transient
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(450 + step * 120, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

    snapGain.gain.setValueAtTime(0.12, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    snapOsc.connect(snapGain);
    snapGain.connect(audioCtx.destination);

    snapOsc.start(now);
    snapOsc.stop(now + 0.1);
  } catch (e) {
    console.error("Paper tear audio error", e);
  }
}

/**
 * Silky Ribbon Untying Sound
 */
export function playRibbonUntieSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const duration = 0.45;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(500, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // Chime sweep
    const chimeNotes = [784, 987.77, 1318.5];
    chimeNotes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.4, "triangle", 0.08);
      }, i * 70);
    });
  } catch (e) {
    console.error("Ribbon audio error", e);
  }
}

/**
 * Grand Fanfare & Explosion for Gift Box Opening
 */
export function playGiftBoxExplosionSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;

    // 1. Deep impact thud
    const bass = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bass.type = "sine";
    bass.frequency.setValueAtTime(180, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    bassGain.gain.setValueAtTime(0.25, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    bass.connect(bassGain);
    bassGain.connect(audioCtx.destination);

    bass.start(now);
    bass.stop(now + 0.45);

    // 2. Rising triumphant brass fanfare chords (Major triad arpeggio + resolution)
    const fanfareChords = [
      [523.25, 659.25, 783.99], // C5 Major
      [587.33, 739.99, 880.00], // D Major
      [659.25, 830.61, 987.77], // E Major
      [1046.5, 1318.5, 1567.98] // High C6 triumphant chord!
    ];

    fanfareChords.forEach((chord, stepIdx) => {
      setTimeout(() => {
        chord.forEach((freq) => {
          playTone(freq, stepIdx === fanfareChords.length - 1 ? 1.2 : 0.4, "triangle", 0.1);
        });
      }, stepIdx * 160);
    });
  } catch (e) {
    console.error("Gift explosion audio error", e);
  }
}

/**
 * Incorrect Password / Riddle Buzzer Sound
 */
export function playLockBuzzerSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Second buzz pulse
    setTimeout(() => {
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(130, t);
      osc2.frequency.linearRampToValueAtTime(100, t + 0.25);
      gain2.gain.setValueAtTime(0.2, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(t);
      osc2.stop(t + 0.25);
    }, 120);
  } catch (e) {
    console.error("Lock buzzer audio error", e);
  }
}

/**
 * Correct Password / Riddle Unlocked Mechanical Click & Chime
 */
export function playLockUnlockSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;

    // Heavy mechanical tumbler snap
    const click = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(800, now);
    click.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    click.connect(clickGain);
    clickGain.connect(audioCtx.destination);

    click.start(now);
    click.stop(now + 0.08);

    // Pleasant high melodic ascension
    const notes = [659.25, 783.99, 987.77, 1318.5]; // E5, G5, B5, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 0.5, "sine", 0.15);
      }, 80 + idx * 80);
    });
  } catch (e) {
    console.error("Lock unlock audio error", e);
  }
}

/**
 * Calming Tibetan Singing Bowl & Zen Ambient Resonance (Stressed Theme)
 */
export function playCalmZenChime() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const fundamental = 396; // Solfeggio 396Hz (liberating guilt/fear & tension release)
    const harmonics = [fundamental, fundamental * 1.5, fundamental * 2.01, fundamental * 2.76];

    harmonics.forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.12 / (idx + 1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(now);
      osc.stop(now + 2.8);
    });
  } catch (e) {
    console.error("Zen chime error", e);
  }
}

/**
 * Playful Comedic Boing & Silly Horn (Laugh Theme)
 */
export function playFunnyBoingSound() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;

    // Classic Cartoon Boing Pitch Sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Silly double pop
    setTimeout(() => {
      if (!audioCtx) return;
      playTone(987.77, 0.15, "triangle", 0.15);
      setTimeout(() => {
        playTone(1318.5, 0.25, "triangle", 0.2);
      }, 100);
    }, 220);
  } catch (e) {
    console.error("Funny boing error", e);
  }
}

/**
 * Theme-aware unseal audio trigger
 */
export function playThemeUnsealSound(theme: 'celebration' | 'stressed' | 'laugh' | 'custom') {
  switch (theme) {
    case 'stressed':
      playCalmZenChime();
      break;
    case 'laugh':
      playFunnyBoingSound();
      break;
    case 'celebration':
    default:
      playChimeSound();
      break;
  }
}



