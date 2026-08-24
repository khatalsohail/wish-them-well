import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  PartyPopper,
  Film,
  Heart,
  Wand2,
} from 'lucide-react';
import {
  initAudio,
  playTearPaperSound,
  playRibbonUntieSound,
  playGiftBoxExplosionSound,
  playTone,
} from '../utils/audio';

interface GiftBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  videoTitle?: string;
  videoMessage?: string;
  recipientName?: string;
}

export const GiftBoxModal: React.FC<GiftBoxModalProps> = ({
  isOpen,
  onClose,
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoTitle = 'A Special Birthday Video For You 🎥✨',
  videoMessage = 'May this next chapter of your life be filled with unforgettable adventures, pure joy, and dreams fulfilled! 🎂💖',
  recipientName = 'Birthday Star',
}) => {
  // Unwrapping steps: 0 (Intact), 1 (Ribbon off), 2 (Paper torn 50%), 3 (Paper torn 90%), 4 (Unwrapped / Video active)
  const [tearStep, setTearStep] = useState(0);
  const [isBoxShaking, setIsBoxShaking] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Total tears required to reveal
  const TOTAL_TEAR_STEPS = 4;

  useEffect(() => {
    if (isOpen) {
      setHasEntered(true);
      setTearStep(0);
      setIsVideoPlaying(false);
    } else {
      setHasEntered(false);
    }
  }, [isOpen]);

  // Confetti helper for paper tearing scraps
  const fireTearConfetti = (step: number) => {
    try {
      const colors = ['#f43f5e', '#fbbf24', '#f59e0b', '#fde047', '#e11d48', '#fda4af'];
      confetti({
        particleCount: 20 + step * 10,
        spread: 50 + step * 15,
        origin: { x: 0.5, y: 0.55 },
        colors,
        gravity: 1.2,
        scalar: 0.9,
        ticks: 80,
      });
    } catch {
      // ignore
    }
  };

  // Grand gift box explosion confetti
  const fireExplosionConfetti = () => {
    try {
      const count = 250;
      const defaults = {
        origin: { x: 0.5, y: 0.5 },
        colors: ['#f43f5e', '#fbbf24', '#f59e0b', '#38bdf8', '#ec4899', '#a855f7', '#fef08a'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 60 });
      fire(0.2, { spread: 70, startVelocity: 45 });
      fire(0.35, { spread: 110, decay: 0.92, scalar: 1 });
      fire(0.1, { spread: 130, startVelocity: 30, decay: 0.93, scalar: 1.3 });
      fire(0.1, { spread: 140, startVelocity: 55 });
    } catch {
      // ignore
    }
  };

  // Handle Box Tap / Tear
  const handleTear = () => {
    if (tearStep >= TOTAL_TEAR_STEPS) return;

    initAudio();

    // Trigger box shake animation
    setIsBoxShaking(true);
    setTimeout(() => setIsBoxShaking(false), 350);

    // Haptic vibration feedback
    if (navigator.vibrate) {
      try {
        navigator.vibrate([35, 30, 45]);
      } catch {
        // ignore
      }
    }

    const nextStep = tearStep + 1;

    if (nextStep === 1) {
      playRibbonUntieSound();
      fireTearConfetti(1);
    } else if (nextStep < TOTAL_TEAR_STEPS) {
      playTearPaperSound(nextStep);
      fireTearConfetti(nextStep);
    } else {
      // Final Step: EXPLODE OPEN!
      playTearPaperSound(4);
      setTimeout(() => {
        playGiftBoxExplosionSound();
        fireExplosionConfetti();
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
          setIsVideoPlaying(true);
        }
      }, 300);
    }

    setTearStep(nextStep);
  };

  // Instant unwrap shortcut
  const handleInstantUnwrap = () => {
    initAudio();
    setTearStep(TOTAL_TEAR_STEPS);
    playGiftBoxExplosionSound();
    fireExplosionConfetti();
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      }
    }, 400);
  };

  // Rewrap box to enjoy unwrapping again
  const handleRewrap = () => {
    initAudio();
    playTone(440, 0.2, 'sine', 0.1);
    setTearStep(0);
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Helper to detect and parse YouTube / Vimeo embed links
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // YouTube formats
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Vimeo format
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return null;
  };

  const embedSrc = getEmbedUrl(videoUrl);
  const isDirectVideo = !embedSrc;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-opacity duration-500 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl bg-gradient-to-b from-stone-900 via-[#210d1c] to-stone-950 border border-rose-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl transition-all duration-700 text-white transform-gpu ${
          hasEntered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-rose-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Gift className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-200">
                {tearStep < TOTAL_TEAR_STEPS
                  ? `Unwrap Your Gift, ${recipientName}!`
                  : '🎉 Surprise Birthday Video!'}
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-300/70 font-sans">
                {tearStep < TOTAL_TEAR_STEPS
                  ? `Click the gift box to tear the wrapping paper (${tearStep}/${TOTAL_TEAR_STEPS})`
                  : 'The final celebration surprise is revealed'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {tearStep < TOTAL_TEAR_STEPS ? (
              <button
                type="button"
                onClick={handleInstantUnwrap}
                className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[11px] font-medium flex items-center space-x-1 transition active:scale-95 cursor-pointer"
                title="Instantly unwrap"
              >
                <Wand2 className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Quick Unwrap</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRewrap}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 text-[11px] font-medium flex items-center space-x-1 transition active:scale-95 cursor-pointer"
                title="Rewrap and unwrap again"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Rewrap</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= STAGE 1: 3D GIFT BOX TEARING STAGE ================= */}
        {tearStep < TOTAL_TEAR_STEPS && (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center relative overflow-hidden select-none">
            {/* Pulsing Hint Badge */}
            <div className="mb-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-serif italic animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {tearStep === 0 && '✨ Tap the gift box to untie ribbon!'}
                {tearStep === 1 && '✂️ Tap again to rip the wrapping paper!'}
                {tearStep === 2 && '💥 Tear harder! Almost open!'}
                {tearStep === 3 && '🔥 ONE MORE TAP TO OPEN!'}
              </span>
            </div>

            {/* 3D Perspective Box Container */}
            <div
              ref={boxRef}
              onClick={handleTear}
              className={`gift-box-interactive-stage relative cursor-pointer transform-gpu transition-all duration-300 ${
                isBoxShaking ? 'gift-shake' : 'gift-float'
              }`}
            >
              {/* Radial Ground Shadow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-8 bg-black/60 rounded-full blur-md" />

              {/* 3D Gift Box Body */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-2 border-amber-300/70 shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Wrapping Paper Festive Foil Pattern */}
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fef08a_1.5px,transparent_1.5px)] [background-size:14px_14px]" />

                {/* Foil Corner Accents */}
                <div className="absolute top-2 left-2 text-amber-300/40 text-xs font-serif">✦</div>
                <div className="absolute top-2 right-2 text-amber-300/40 text-xs font-serif">✦</div>
                <div className="absolute bottom-2 left-2 text-amber-300/40 text-xs font-serif">✦</div>
                <div className="absolute bottom-2 right-2 text-amber-300/40 text-xs font-serif">✦</div>

                {/* Inner Glowing Core peek (visible when paper torn) */}
                {tearStep >= 2 && (
                  <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-500 shadow-inner flex items-center justify-center animate-pulse">
                    <Film className="w-10 h-10 text-amber-950/70" />
                  </div>
                )}

                {/* Wrapping Paper Tear Peeling Overlays */}
                {tearStep >= 1 && (
                  <div
                    className={`absolute inset-0 transition-transform duration-500 pointer-events-none ${
                      tearStep === 1
                        ? 'translate-x-2 -translate-y-2 rotate-3 opacity-90'
                        : tearStep === 2
                        ? 'translate-x-8 -translate-y-8 rotate-12 opacity-60'
                        : 'translate-x-16 -translate-y-16 rotate-45 opacity-0'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-tr from-rose-800 via-rose-600 to-amber-600 opacity-80 border-r-4 border-b-4 border-amber-300/80 [clip-path:polygon(0_0,100%_0,85%_100%,0_80%)]" />
                  </div>
                )}

                {tearStep >= 2 && (
                  <div
                    className={`absolute inset-0 transition-transform duration-500 pointer-events-none ${
                      tearStep === 2
                        ? '-translate-x-4 translate-y-4 -rotate-6 opacity-75'
                        : '-translate-x-12 translate-y-12 -rotate-24 opacity-0'
                    }`}
                  >
                    <div className="w-full h-full bg-rose-900 border-l-4 border-t-4 border-amber-300/60 [clip-path:polygon(15%_0,100%_20%,100%_100%,0_100%)]" />
                  </div>
                )}

                {/* Golden Silk Ribbons (Vertical & Horizontal) - Unties on Step 1 */}
                <div
                  className={`gift-ribbon-vertical absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-md border-x border-amber-600/50 transition-all duration-500 ${
                    tearStep >= 1 ? 'opacity-0 scale-y-0 rotate-45' : 'opacity-100'
                  }`}
                />
                <div
                  className={`gift-ribbon-horizontal absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 sm:h-10 bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-500 shadow-md border-y border-amber-600/50 transition-all duration-500 ${
                    tearStep >= 1 ? 'opacity-0 scale-x-0 -rotate-45' : 'opacity-100'
                  }`}
                />

                {/* 3D Bow on Top - Floats and disappears on step 1 */}
                <div
                  className={`gift-bow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500 ${
                    tearStep >= 1
                      ? 'opacity-0 scale-150 -translate-y-16 rotate-180'
                      : 'opacity-100'
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <div className="absolute w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-400 shadow-lg border border-amber-600/60" />
                    <div className="absolute -left-3 w-8 h-8 rounded-tl-full rounded-br-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-md transform -rotate-45 border border-amber-500/80" />
                    <div className="absolute -right-3 w-8 h-8 rounded-tr-full rounded-bl-full bg-gradient-to-bl from-amber-300 to-amber-600 shadow-md transform rotate-45 border border-amber-500/80" />
                    <div className="absolute -top-3 w-8 h-8 rounded-tl-full rounded-br-full bg-gradient-to-tr from-amber-300 to-amber-600 shadow-md transform rotate-45 border border-amber-500/80" />
                    <div className="absolute -bottom-3 w-8 h-8 rounded-tr-full rounded-bl-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-md transform -rotate-45 border border-amber-500/80" />
                    <Sparkles className="w-5 h-5 text-amber-950 relative z-10 animate-pulse" />
                  </div>
                </div>

                {/* Center Action Prompt Overlay */}
                <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none z-30">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] sm:text-xs font-semibold text-amber-200 border border-amber-400/30">
                    {tearStep === 0 && '🎁 Tap to Untie'}
                    {tearStep === 1 && '✂️ Tap to Tear (1/3)'}
                    {tearStep === 2 && '💥 Tap to Tear (2/3)'}
                    {tearStep === 3 && '🔥 Tap to Open!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tear Progress Bar */}
            <div className="w-full max-w-xs mt-6 space-y-1.5 text-center">
              <div className="flex justify-between text-[11px] font-sans text-stone-400">
                <span>Wrapping Paper</span>
                <span className="font-semibold text-amber-300">
                  {Math.round((tearStep / TOTAL_TEAR_STEPS) * 100)}% Unwrapped
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden p-0.5 border border-stone-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 transition-all duration-300"
                  style={{ width: `${(tearStep / TOTAL_TEAR_STEPS) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: UNWRAPPED SURPRISE VIDEO PLAYER ================= */}
        {tearStep >= TOTAL_TEAR_STEPS && (
          <div className="py-2 sm:py-4 space-y-4 animate-scale-in">
            {/* Video Player Card Container */}
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              {/* Corner Ornate Badges */}
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-400/40 text-[10px] font-cinzel text-rose-200 flex items-center space-x-1">
                  <Film className="w-3 h-3 text-amber-300" />
                  <span>Surprise Video</span>
                </span>
              </div>

              {/* Video Player Render */}
              {isDirectVideo ? (
                <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    autoPlay
                    muted={isMuted}
                    className="w-full h-full object-contain"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={embedSrc || ''}
                    title="Birthday Surprise Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Video Title & Message Note */}
            <div className="rounded-xl p-3.5 sm:p-4 bg-gradient-to-r from-rose-950/60 via-stone-900 to-amber-950/60 border border-rose-400/30 text-center space-y-2">
              <h4 className="font-cinzel text-sm sm:text-base font-bold text-amber-200 flex items-center justify-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{videoTitle}</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h4>
              <p className="font-serif italic text-xs sm:text-sm text-stone-200 leading-relaxed px-2">
                "{videoMessage}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={fireExplosionConfetti}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4" />
                <span>Celebrate! 🎉</span>
              </button>

              <button
                type="button"
                onClick={handleRewrap}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Rewrap Box 🎁</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs sm:text-sm font-medium transition active:scale-95 cursor-pointer"
              >
                <span>Back to Letter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
