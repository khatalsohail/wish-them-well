import React from 'react';
import {
  Sparkles,
  Heart,
  Smile,
  ShieldCheck,
  ArrowRight,
  Flame,
  Coffee,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { AppData, EnvelopeData } from '../types';
import { initAudio, playTone } from '../utils/audio';

interface EnvelopeStackViewProps {
  appData: AppData;
  onSelectEnvelope: (envelope: EnvelopeData, index: number) => void;
  openedEnvelopeIds?: Set<string>;
}

export const EnvelopeStackView: React.FC<EnvelopeStackViewProps> = ({
  appData,
  onSelectEnvelope,
  openedEnvelopeIds = new Set(),
}) => {
  const envelopes = appData.envelopes && appData.envelopes.length > 0
    ? appData.envelopes
    : [];

  const handlePick = (env: EnvelopeData, idx: number) => {
    initAudio();
    if (env.theme === 'stressed') {
      playTone(396, 0.4, 'sine', 0.15);
    } else if (env.theme === 'laugh') {
      playTone(523.25, 0.15, 'triangle', 0.18);
      setTimeout(() => playTone(783.99, 0.25, 'triangle', 0.2), 120);
    } else {
      playTone(523.25, 0.25, 'sine', 0.15);
      setTimeout(() => playTone(659.25, 0.25, 'triangle', 0.15), 100);
      setTimeout(() => playTone(1046.5, 0.4, 'sine', 0.18), 200);
    }
    onSelectEnvelope(env, idx);
  };

  const getThemeStyling = (env: EnvelopeData, idx: number) => {
    switch (env.theme) {
      case 'stressed':
        return {
          cardBg: 'from-[#14323b] via-[#1c4854] to-[#0f242b]',
          borderColor: 'border-teal-400/40 hover:border-teal-300',
          shadowGlow: 'hover:shadow-[0_0_35px_rgba(45,212,191,0.45)]',
          badgeBg: 'bg-teal-950/80 border-teal-400/50 text-teal-200',
          accentText: 'text-teal-300',
          sealColor: 'from-teal-600 via-emerald-600 to-teal-800',
          icon: <Coffee className="w-5 h-5 text-teal-300" />,
          pill: '🌿 Calming Care',
          rotateDeg: idx === 1 ? '-rotate-1 sm:-rotate-2' : '',
        };
      case 'laugh':
        return {
          cardBg: 'from-[#3c1706] via-[#7c2d12] to-[#2c0f04]',
          borderColor: 'border-amber-400/50 hover:border-amber-300',
          shadowGlow: 'hover:shadow-[0_0_35px_rgba(245,158,11,0.55)]',
          badgeBg: 'bg-amber-950/80 border-amber-400/50 text-amber-200',
          accentText: 'text-amber-300',
          sealColor: 'from-amber-500 via-orange-500 to-rose-600',
          icon: <Smile className="w-5 h-5 text-amber-300" />,
          pill: '😂 Comedy & Fun',
          rotateDeg: idx === 2 ? 'rotate-1 sm:rotate-2' : '',
        };
      case 'celebration':
      default:
        return {
          cardBg: 'from-[#3a101d] via-[#6e1e35] to-[#260a12]',
          borderColor: 'border-rose-400/40 hover:border-rose-300',
          shadowGlow: 'hover:shadow-[0_0_35px_rgba(244,63,94,0.45)]',
          badgeBg: 'bg-rose-950/80 border-rose-400/50 text-rose-200',
          accentText: 'text-rose-300',
          sealColor: 'from-rose-600 via-amber-600 to-rose-700',
          icon: <Sparkles className="w-5 h-5 text-rose-300" />,
          pill: '🎂 Birthday Star',
          rotateDeg: idx === 0 ? 'rotate-0' : '',
        };
    }
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center justify-center space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-2.5 max-w-xl">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-950/60 border border-rose-400/30 backdrop-blur-md text-rose-200 text-xs font-cinzel font-bold uppercase tracking-widest shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The "Open When" Envelope Collection</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-amber-100 drop-shadow-md">
          Surprises For {appData.recipient || 'You'}
        </h2>

        <p className="text-xs sm:text-sm text-stone-300/90 font-serif italic max-w-md mx-auto leading-relaxed">
          A personalized stack of 3 sealed keepsake envelopes. Pick one now, and save the others for when you need them most!
        </p>
      </div>

      {/* 3D Envelope Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl pt-2">
        {envelopes.map((env, idx) => {
          const style = getThemeStyling(env, idx);
          const isAlreadyOpened = openedEnvelopeIds.has(env.id);

          return (
            <div
              key={env.id || idx}
              onClick={() => handlePick(env, idx)}
              className={`group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b ${style.cardBg} border-2 ${style.borderColor} ${style.shadowGlow} ${style.rotateDeg} transition-all duration-500 transform-gpu hover:-translate-y-3 hover:scale-[1.03] cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xl`}
            >
              {/* Subtle Foil Pattern Accent */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

              {/* Top Tag & Status */}
              <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.badgeBg}`}>
                  {style.pill}
                </span>

                {isAlreadyOpened ? (
                  <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Read</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Sealed</span>
                  </span>
                )}
              </div>

              {/* Envelope Miniature Illustration */}
              <div className="relative my-6 flex flex-col items-center justify-center">
                {/* 3D Envelope Preview Shape */}
                <div className="relative w-44 sm:w-48 h-28 sm:h-32 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center transform group-hover:rotate-1 transition-transform duration-300">
                  {/* Flap Triangles */}
                  <div className="absolute top-0 left-0 right-0 h-14 border-t-[30px] border-t-white/15 border-l-[88px] sm:border-l-[96px] border-l-transparent border-r-[88px] sm:border-r-[96px] border-r-transparent pointer-events-none" />

                  {/* Wax Seal Center Badge */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${style.sealColor} border border-amber-300/60 shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {style.icon}
                  </div>
                </div>

                {/* Subtitle text */}
                <p className="mt-3 text-xs text-stone-300/80 font-serif italic text-center line-clamp-1">
                  {env.subtitle || 'A special sealed keepsake'}
                </p>
              </div>

              {/* Bottom Envelope Label & Button */}
              <div className="relative z-10 space-y-3 pt-2">
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                    {env.label}
                  </h3>
                  <div className="text-[11px] text-stone-400 flex items-center space-x-2 mt-0.5">
                    <span>{env.pages?.length || 1} Pages</span>
                    <span>•</span>
                    <span>{env.photos?.length || 4} Memories</span>
                    {env.giftBoxEnabled && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400">Surprise Video 🎁</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 group-hover:bg-white/20 border border-white/20 group-hover:border-amber-300/50 text-white font-cinzel text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
                >
                  <span>Unseal & Open</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
