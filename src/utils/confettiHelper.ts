import confetti from 'canvas-confetti';
import { EnvelopeTheme } from '../types';

/**
 * Dynamic Confetti & Particle Blaster tailored to Envelope Themes
 */

// 1. Celebratory Confetti (Classic Joyous Burst)
export function triggerCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#e11d48', '#f59e0b', '#ec4899', '#fef08a', '#fb7185', '#d97706'],
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// 2. Calming / Zen Petal & Mist Drift for "Open When You're Stressed"
export function triggerStressedZenConfetti() {
  // Soft, slow, pastel floating blossoms & lavender flakes
  const duration = 2500;
  const end = Date.now() + duration;

  const colors = ['#99f6e4', '#a7f3d0', '#c4b5fd', '#bae6fd', '#fed7aa', '#fbcfe8'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.3 },
      colors,
      gravity: 0.4,
      drift: 0.2,
      scalar: 1.1,
      ticks: 200,
      shapes: ['circle'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.3 },
      colors,
      gravity: 0.4,
      drift: -0.2,
      scalar: 1.1,
      ticks: 200,
      shapes: ['circle'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// 3. Aggressive Chaotic Confetti Blasts with Emojis for "Open For A Laugh"
export function triggerChaoticLaughConfetti() {
  const emojiShapes = confetti.shapeFromText({ text: '😂', scalar: 2.2 });
  const partyShapes = confetti.shapeFromText({ text: '🎉', scalar: 2.0 });
  const sillyShapes = confetti.shapeFromText({ text: '🤪', scalar: 2.2 });
  const pizzaShapes = confetti.shapeFromText({ text: '🍕', scalar: 2.0 });
  const rocketShapes = confetti.shapeFromText({ text: '🚀', scalar: 2.0 });
  const flameShapes = confetti.shapeFromText({ text: '🔥', scalar: 2.0 });

  const customShapes = [emojiShapes, partyShapes, sillyShapes, pizzaShapes, rocketShapes, flameShapes];
  const neonColors = ['#facc15', '#f43f5e', '#a855f7', '#06b6d4', '#22c55e', '#ec4899', '#f97316'];

  // Left Cannon Mega Blast
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 90,
    origin: { x: 0, y: 0.7 },
    colors: neonColors,
    startVelocity: 65,
    scalar: 1.3,
    ticks: 150,
  });

  // Right Cannon Mega Blast
  confetti({
    particleCount: 70,
    angle: 120,
    spread: 90,
    origin: { x: 1, y: 0.7 },
    colors: neonColors,
    startVelocity: 65,
    scalar: 1.3,
    ticks: 150,
  });

  // Center Emoji Pop Extravaganza
  setTimeout(() => {
    confetti({
      particleCount: 45,
      spread: 120,
      origin: { x: 0.5, y: 0.55 },
      shapes: customShapes,
      scalar: 2.2,
      startVelocity: 45,
      gravity: 0.8,
      ticks: 120,
    });
  }, 150);

  // Rapid second wave of chaos!
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 160,
      origin: { x: 0.5, y: 0.75 },
      colors: neonColors,
      shapes: customShapes,
      scalar: 1.8,
      startVelocity: 55,
      ticks: 140,
    });
  }, 350);
}

/**
 * Universal theme-aware confetti runner
 */
export function triggerThemeConfetti(theme: EnvelopeTheme) {
  switch (theme) {
    case 'stressed':
      triggerStressedZenConfetti();
      break;
    case 'laugh':
      triggerChaoticLaughConfetti();
      break;
    case 'celebration':
    default:
      triggerCelebrationConfetti();
      break;
  }
}
