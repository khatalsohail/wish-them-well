import React, { useEffect, useState } from 'react';
import { Hourglass, Sparkles, Play, Unlock, ShieldAlert, Lock, Clock } from 'lucide-react';
import { playMidnightGong } from '../utils/audio';

interface CountdownScreenProps {
  recipient: string;
  targetTime: number;
  onUnlock: () => void;
  onTestDemo?: () => void;
  isViewerMode?: boolean;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  recipient,
  targetTime,
  onUnlock,
  onTestDemo,
  isViewerMode = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isDissolving, setIsDissolving] = useState(false);

  useEffect(() => {
    const update = () => {
      const remainingMs = targetTime - Date.now();
      if (remainingMs <= 0) {
        setIsDissolving(true);
        playMidnightGong();
        setTimeout(() => {
          onUnlock();
        }, 900);
        return;
      }

      const totalSecs = Math.floor(remainingMs / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onUnlock]);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Format target date nicely
  const formattedTargetDate = (() => {
    try {
      const d = new Date(targetTime);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  return (
    <section
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-center transition-all duration-1000 ${
        isDissolving ? 'countdown-dissolving' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at center, rgba(35, 12, 28, 0.98) 0%, rgba(12, 4, 13, 0.99) 100%)',
        backdropFilter: 'blur(25px)',
      }}
    >
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full mx-auto flex flex-col items-center space-y-6">
        {/* Lock & Hourglass */}
        <div className="relative group">
          <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-600/40 via-amber-500/30 to-rose-700/40 border-2 border-amber-300/50 backdrop-blur-xl flex items-center justify-center text-amber-200 shadow-glow-gold">
            <Hourglass className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-amber-400/30 animate-ping pointer-events-none" />
        </div>

        {/* Title */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center space-x-2 text-rose-300 text-xs sm:text-sm font-cinzel font-bold uppercase tracking-widest bg-rose-950/80 px-4 py-1.5 rounded-full border border-rose-400/40 backdrop-blur-md shadow-md">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Envelope Locked Until Birthday</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl text-rose-100 font-bold drop-shadow-md">
            Opening for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 font-script text-3xl sm:text-5xl block sm:inline mt-1 sm:mt-0">
              {recipient || 'Birthday Star'}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-rose-200/90 max-w-md mx-auto font-serif italic leading-relaxed px-2">
            This birthday letter is sealed tight! It will automatically unseal the exact second your birthday arrives.
          </p>

          {formattedTargetDate && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Time: {formattedTargetDate}</span>
            </div>
          )}
        </div>

        {/* 4 Countdown Units (Days, Hours, Minutes, Seconds) */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-md">
          <div className="countdown-unit-box">
            <div className="countdown-unit-card border border-amber-400/30 bg-stone-900/90">
              <span className="countdown-digit font-serif text-white">{pad(timeLeft.days)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel text-amber-300/80">Days</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card border border-amber-400/30 bg-stone-900/90">
              <span className="countdown-digit font-serif text-white">{pad(timeLeft.hours)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel text-amber-300/80">Hours</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card border border-amber-400/30 bg-stone-900/90">
              <span className="countdown-digit font-serif text-white">{pad(timeLeft.minutes)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel text-amber-300/80">Mins</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card border border-amber-400/30 bg-stone-900/90">
              <span className="countdown-digit font-serif text-amber-300 animate-pulse">
                {pad(timeLeft.seconds)}
              </span>
            </div>
            <span className="countdown-unit-label font-cinzel text-amber-300">Secs</span>
          </div>
        </div>

        {/* Security Notice on Viewer Mode */}
        {isViewerMode ? (
          <div className="pt-3">
            <p className="text-[11px] text-stone-400 font-sans flex items-center justify-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Countdown is live • Bookmark this link and return when the timer hits zero!</span>
            </p>
          </div>
        ) : (
          /* Creator Mode Preview Controls Only */
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block w-full">
              Creator Preview Controls
            </span>
            {onTestDemo && (
              <button
                type="button"
                onClick={onTestDemo}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-rose-200 text-xs font-medium backdrop-blur-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-300" />
                <span>Test 5s Countdown</span>
              </button>
            )}

            <button
              type="button"
              onClick={onUnlock}
              className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-medium backdrop-blur-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Preview Envelope Now</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
