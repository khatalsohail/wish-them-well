import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  initAudio,
  startChargingSound,
  updateChargingSound,
  stopChargingSound,
  playWaxCrackSound,
} from '../utils/audio';
import { Sparkles } from 'lucide-react';

interface WaxSealProps {
  isBroken: boolean;
  onBreak: () => void;
}

const RING_CIRCUMFERENCE = 238.76;

export const WaxSeal: React.FC<WaxSealProps> = ({ isBroken, onBreak }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isCracking, setIsCracking] = useState(false);
  const [progressOffset, setProgressOffset] = useState(RING_CIRCUMFERENCE);
  const [promptText, setPromptText] = useState('HOLD TO BREAK');

  const pressStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const triggerBreak = () => {
    if (isBroken) return;
    pressStartRef.current = null;
    stopChargingSound();
    setIsPressing(false);
    setIsCracking(true);

    playWaxCrackSound();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 20, 80]);
      } catch {
        // ignore
      }
    }

    try {
      confetti({
        particleCount: 32,
        spread: 70,
        origin: { x: 0.5, y: 0.48 },
        colors: ['#e11d48', '#991b1b', '#f59e0b', '#fbbf24', '#fef08a'],
        scalar: 0.7,
        gravity: 1.3,
        ticks: 80,
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onBreak();
    }, 320);
  };

  const handleStart = (e: React.PointerEvent | React.TouchEvent) => {
    if (isBroken) return;
    initAudio();
    startChargingSound();

    pressStartRef.current = Date.now();
    setIsPressing(true);
    setPromptText('CHARGING...');

    const clientX =
      'clientX' in e
        ? e.clientX
        : e.touches && e.touches[0]
        ? e.touches[0].clientX
        : 0;
    const clientY =
      'clientY' in e
        ? e.clientY
        : e.touches && e.touches[0]
        ? e.touches[0].clientY
        : 0;
    dragStartRef.current = { x: clientX, y: clientY };

    const chargeStep = () => {
      if (!pressStartRef.current || isBroken) return;
      const elapsed = Date.now() - pressStartRef.current;
      const targetDuration = 800; // 0.8s hold
      const progress = Math.min(elapsed / targetDuration, 1);

      setProgressOffset(RING_CIRCUMFERENCE * (1 - progress));
      updateChargingSound(progress);

      if (progress >= 1) {
        triggerBreak();
      } else {
        animFrameRef.current = requestAnimationFrame(chargeStep);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(chargeStep);
  };

  const handleMove = (e: React.PointerEvent | React.TouchEvent) => {
    if (!pressStartRef.current || !dragStartRef.current || isBroken) return;
    const clientX =
      'clientX' in e
        ? e.clientX
        : e.touches && e.touches[0]
        ? e.touches[0].clientX
        : 0;
    const clientY =
      'clientY' in e
        ? e.clientY
        : e.touches && e.touches[0]
        ? e.touches[0].clientY
        : 0;

    const dist = Math.hypot(
      clientX - dragStartRef.current.x,
      clientY - dragStartRef.current.y
    );

    if (dist > 35) {
      triggerBreak();
    }
  };

  const handleEnd = () => {
    if (isBroken) return;
    pressStartRef.current = null;
    dragStartRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    stopChargingSound();
    setIsPressing(false);
    setPromptText('HOLD TO BREAK');
    setProgressOffset(RING_CIRCUMFERENCE);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerBreak();
    }
  };

  return (
    <div
      className={`wax-seal ${isPressing ? 'is-pressing' : ''} ${
        isCracking ? 'is-cracking' : ''
      } ${isBroken ? 'is-broken' : ''}`}
      onPointerDown={handleStart}
      onPointerMove={handleMove}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Hold or swipe wax seal to break"
    >
      {/* Circular Progress Ring */}
      <svg className="wax-progress-ring" viewBox="0 0 88 88">
        <circle className="progress-ring-track" cx="44" cy="44" r="38" />
        <circle
          className="progress-ring-indicator"
          cx="44"
          cy="44"
          r="38"
          style={{ strokeDashoffset: progressOffset }}
        />
      </svg>

      {/* Wax Seal Halves */}
      <div className="wax-seal-wrapper">
        <div className="wax-seal-half wax-seal-left">
          <div className="wax-seal-outer">
            <div className="wax-seal-inner">
              <div className="wax-seal-crest">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />
              </div>
              <span className="wax-seal-text font-cinzel">FOR YOU</span>
            </div>
          </div>
        </div>

        <div className="wax-seal-half wax-seal-right">
          <div className="wax-seal-outer">
            <div className="wax-seal-inner">
              <div className="wax-seal-crest">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />
              </div>
              <span className="wax-seal-text font-cinzel">FOR YOU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wax-crack-fx" />

      {!isBroken && (
        <div className="seal-hold-badge">
          <span>{promptText}</span>
        </div>
      )}

      <div className="wax-seal-shimmer" />
    </div>
  );
};
