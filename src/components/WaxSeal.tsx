import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  initAudio,
  startChargingSound,
  updateChargingSound,
  stopChargingSound,
  playWaxCrackSound,
} from '../utils/audio';
import { Sparkles, Heart, Smile, Flower2, Cake, Star } from 'lucide-react';
import { EnvelopeTheme } from '../types';

interface WaxSealProps {
  isBroken: boolean;
  onBreak: () => void;
  theme?: EnvelopeTheme;
  sealSymbol?: 'sparkles' | 'heart' | 'lotus' | 'laugh' | 'cake' | 'star';
  sealText?: string;
}

const RING_CIRCUMFERENCE = 238.76;

export const WaxSeal: React.FC<WaxSealProps> = ({
  isBroken,
  onBreak,
  theme = 'celebration',
  sealSymbol,
  sealText,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const [isCracking, setIsCracking] = useState(false);
  const [progressOffset, setProgressOffset] = useState(RING_CIRCUMFERENCE);
  const [promptText, setPromptText] = useState('HOLD TO BREAK');

  const pressStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const getThemeWaxColors = () => {
    switch (theme) {
      case 'stressed':
        return ['#0d9488', '#0f766e', '#14b8a6', '#5eead4', '#99f6e4'];
      case 'laugh':
        return ['#f59e0b', '#d97706', '#ea580c', '#facc15', '#fb7185'];
      case 'celebration':
      default:
        return ['#e11d48', '#991b1b', '#f59e0b', '#fbbf24', '#fef08a'];
    }
  };

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
        particleCount: 36,
        spread: 75,
        origin: { x: 0.5, y: 0.48 },
        colors: getThemeWaxColors(),
        scalar: 0.8,
        gravity: 1.2,
        ticks: 90,
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
      const targetDuration = 750; // fast responsive 0.75s hold
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

  const renderSealIcon = () => {
    const symbol = sealSymbol || (theme === 'stressed' ? 'lotus' : theme === 'laugh' ? 'laugh' : 'sparkles');
    switch (symbol) {
      case 'lotus':
        return <Flower2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-100 fill-teal-200/80" />;
      case 'laugh':
        return <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />;
      case 'heart':
        return <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-100 fill-rose-200/80" />;
      case 'cake':
        return <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />;
      case 'star':
        return <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 fill-amber-200/80" />;
    }
  };

  const displaySealText = sealText || (theme === 'stressed' ? 'BREATHE' : theme === 'laugh' ? 'LOL' : 'FOR YOU');

  return (
    <div
      className={`wax-seal wax-theme-${theme} ${isPressing ? 'is-pressing' : ''} ${
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
                {renderSealIcon()}
              </div>
              <span className="wax-seal-text font-cinzel">{displaySealText}</span>
            </div>
          </div>
        </div>

        <div className="wax-seal-half wax-seal-right">
          <div className="wax-seal-outer">
            <div className="wax-seal-inner">
              <div className="wax-seal-crest">
                {renderSealIcon()}
              </div>
              <span className="wax-seal-text font-cinzel">{displaySealText}</span>
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
