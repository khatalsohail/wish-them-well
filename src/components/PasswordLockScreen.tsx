import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Lock,
  Unlock,
  KeyRound,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Gift,
  HeartHandshake,
} from 'lucide-react';
import {
  initAudio,
  playLockBuzzerSound,
  playLockUnlockSound,
  playTone,
} from '../utils/audio';

interface PasswordLockScreenProps {
  requiredPassword: string;
  riddlePrompt?: string;
  recipientName?: string;
  onUnlock: () => void;
}

export const PasswordLockScreen: React.FC<PasswordLockScreenProps> = ({
  requiredPassword,
  riddlePrompt,
  recipientName = 'Special Someone',
  onUnlock,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Auto-focus the input field on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isUnlocking) return;

    initAudio();
    const cleanInput = inputVal.trim().toLowerCase();
    const cleanTarget = (requiredPassword || '').trim().toLowerCase();

    if (!cleanInput) {
      setIsError(true);
      setErrorMessage('Please enter the secret password or answer.');
      playLockBuzzerSound();
      return;
    }

    // STRICT FUNCTIONAL COMPARISON: exact case-insensitive match
    if (cleanInput === cleanTarget) {
      setIsError(false);
      setIsUnlocking(true);
      playLockUnlockSound();

      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fbbf24', '#f59e0b', '#ec4899', '#fef08a'],
        });
      } catch {
        // ignore
      }

      // Transition smoothly into viewer envelope
      setTimeout(() => {
        onUnlock();
      }, 950);
    } else {
      // Incorrect match
      setIsError(true);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setErrorMessage('Incorrect passcode / answer. Please try again! 🔒');
      playLockBuzzerSound();

      if (navigator.vibrate) {
        try {
          navigator.vibrate([60, 40, 80]);
        } catch {
          // ignore
        }
      }

      // Reset shake state after 500ms
      setTimeout(() => {
        setIsError(false);
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-stone-950 via-[#180814] to-stone-950 text-white overflow-y-auto">
      {/* Deep Romantic Ambient Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-600/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Main Lock Screen Card */}
      <div
        className={`relative w-full max-w-md bg-stone-900/90 border border-amber-400/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500 transform-gpu ${
          isUnlocking
            ? 'scale-105 opacity-0 duration-700'
            : isError
            ? 'animate-shake'
            : 'scale-100 opacity-100'
        }`}
      >
        {/* Top Decorative Header & Lock Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            {/* Pulsing Aura */}
            <div
              className={`absolute inset-0 rounded-full blur-lg transition-all duration-500 ${
                isUnlocking
                  ? 'bg-emerald-500/60 scale-125'
                  : isError
                  ? 'bg-rose-600/50 scale-110'
                  : 'bg-amber-400/30 animate-pulse'
              }`}
            />

            {/* Lock Circle */}
            <div
              className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center shadow-xl transition-all duration-500 ${
                isUnlocking
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-emerald-300 text-white'
                  : isError
                  ? 'bg-gradient-to-tr from-rose-700 to-red-900 border-rose-400 text-rose-100'
                  : 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 border-amber-300/80 text-amber-950'
              }`}
            >
              {isUnlocking ? (
                <Unlock className="w-9 h-9 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8 sm:w-9 sm:h-9 text-amber-950 drop-shadow-sm" />
              )}
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-cinzel font-bold tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>Private Birthday Delivery</span>
          </div>

          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-200 to-amber-200">
            For {recipientName}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300/80 font-serif italic mt-1.5 px-2">
            {riddlePrompt
              ? 'Answer the secret riddle below to unseal your birthday envelope ✨'
              : 'This special birthday letter is protected with a secret passcode.'}
          </p>
        </div>

        {/* Riddle / Question Display Box (If Riddle exists) */}
        {riddlePrompt && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-amber-950/40 border border-amber-400/40 text-amber-100 shadow-inner">
            <div className="flex items-center space-x-1.5 text-[11px] font-cinzel uppercase font-bold text-amber-300/90 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Riddle / Secret Clue:</span>
            </div>
            <p className="font-serif italic text-sm sm:text-base leading-relaxed text-amber-50">
              "{riddlePrompt}"
            </p>
          </div>
        )}

        {/* Password / Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400/70">
              <KeyRound className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (isError) setIsError(false);
              }}
              placeholder={riddlePrompt ? 'Type your answer here...' : 'Enter secret passcode...'}
              disabled={isUnlocking}
              className={`w-full pl-10 pr-11 py-3 text-sm rounded-2xl bg-stone-950/80 border text-white placeholder-stone-500 focus:outline-none transition-all duration-200 shadow-inner ${
                isError
                  ? 'border-rose-500 focus:border-rose-400 ring-2 ring-rose-500/30'
                  : 'border-amber-400/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
              }`}
              autoComplete="off"
              autoFocus
            />

            {/* Toggle show/hide password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-amber-300 transition cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Error Message Notice */}
          {errorMessage && isError && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-medium px-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUnlocking || !inputVal.trim()}
            className={`w-full py-3 rounded-2xl font-cinzel font-bold text-sm tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg cursor-pointer active:scale-98 ${
              isUnlocking
                ? 'bg-emerald-600 text-white cursor-wait'
                : !inputVal.trim()
                ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white border border-amber-300/40 hover:shadow-glow-rose'
            }`}
          >
            {isUnlocking ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                <span>Unlocking Envelope...</span>
              </>
            ) : (
              <>
                <span>Unlock Envelope</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </>
            )}
          </button>
        </form>

        {/* Failed attempts helper hint */}
        {failedAttempts >= 2 && !riddlePrompt && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-300/80 hover:text-amber-200 underline cursor-pointer"
            >
              {showHint ? 'Hide Hint' : 'Need a clue? 💡'}
            </button>
            {showHint && (
              <p className="text-[11px] text-stone-300 font-serif italic mt-1 bg-stone-950/60 p-2 rounded-xl border border-stone-800">
                Hint: Check with the person who sent you this link for the secret birthday password!
              </p>
            )}
          </div>
        )}

        {/* Subtle Security Trust Tag */}
        <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-center space-x-1.5 text-[11px] text-stone-400">
          <HeartHandshake className="w-3.5 h-3.5 text-rose-500/70" />
          <span>Case-insensitive secure seal • Crafted with love</span>
        </div>
      </div>
    </div>
  );
};
