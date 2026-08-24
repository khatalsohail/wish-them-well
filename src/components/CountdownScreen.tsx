import React, { useEffect, useState } from 'react';
import { Hourglass, Sparkles, Play, Unlock } from 'lucide-react';
import { playMidnightGong } from '../utils/audio';

interface CountdownScreenProps {
  recipient: string;
  targetTime: number;
  onUnlock: () => void;
  onTestDemo: () => void;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  recipient,
  targetTime,
  onUnlock,
  onTestDemo,
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

  return (
    <section
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center p-4 text-center transition-all duration-1000 ${
        isDissolving ? 'countdown-dissolving' : ''
      }`}
      style={{
        background:
          'radial-gradient(circle at center, rgba(35, 12, 28, 0.96) 0%, rgba(12, 4, 13, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full mx-auto flex flex-col items-center space-y-6">
        {/* Lock & Hourglass */}
        <div className="relative group">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-600/30 to-amber-500/30 border border-amber-300/40 backdrop-blur-xl flex items-center justify-center text-amber-200 shadow-glow-gold animate-pulse">
            <Hourglass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-amber-400/20 animate-ping pointer-events-none" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-rose-300 text-xs sm:text-sm font-cinzel font-semibold uppercase tracking-widest bg-rose-950/70 px-4 py-1.5 rounded-full border border-rose-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Birthday Surprise Locked</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-rose-100 font-bold drop-shadow-md">
            Unlocking for{' '}
            <span className="text-amber-300 font-script text-3xl sm:text-5xl">
              {recipient || 'Birthday Star'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-rose-200/80 max-w-md mx-auto font-medium leading-relaxed">
            A heartfelt letter and special memories will magically open the exact second it turns to midnight on their birthday! 🎂✨
          </p>
        </div>

        {/* 4 Clock Cards */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-md">
          <div className="countdown-unit-box">
            <div className="countdown-unit-card">
              <span className="countdown-digit font-serif">{pad(timeLeft.days)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel">Days</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card">
              <span className="countdown-digit font-serif">{pad(timeLeft.hours)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel">Hours</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card">
              <span className="countdown-digit font-serif">{pad(timeLeft.minutes)}</span>
            </div>
            <span className="countdown-unit-label font-cinzel">Mins</span>
          </div>

          <div className="countdown-unit-box">
            <div className="countdown-unit-card">
              <span className="countdown-digit font-serif text-amber-300 animate-pulse">
                {pad(timeLeft.seconds)}
              </span>
            </div>
            <span className="countdown-unit-label font-cinzel">Secs</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onTestDemo}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-rose-200 text-xs font-medium backdrop-blur-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-amber-300" />
            <span>Test 5s Countdown Demo</span>
          </button>

          <button
            type="button"
            onClick={onUnlock}
            className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-medium backdrop-blur-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlock / View Letter</span>
          </button>
        </div>
      </div>
    </section>
  );
};
