/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Cake,
  SlidersHorizontal,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  PartyPopper,
  LockKeyholeOpen,
  BookOpen,
  ChevronRight,
  Gift,
  Film,
} from 'lucide-react';
import { AppData, DEFAULT_DATA } from './types';
import { AmbientCanvas } from './components/AmbientCanvas';
import { WaxSeal } from './components/WaxSeal';
import { PolaroidMemories } from './components/PolaroidMemories';
import { LetterContent } from './components/LetterContent';
import { CountdownScreen } from './components/CountdownScreen';
import { CustomizerModal } from './components/CustomizerModal';
import { GiftBoxModal } from './components/GiftBoxModal';
import {
  initAudio,
  playChimeSound,
  playPaperSlideSound,
  playPageTurnSound,
  startMusicBox,
  stopMusicBox,
} from './utils/audio';

const STORAGE_KEY = 'happy_birthday_custom_data_v2';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_DATA;
  });

  // Envelope animation phases
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Multi-page state
  const [currentPage, setCurrentPage] = useState(0);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Countdown & Modal states
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [demoCountdownEndTime, setDemoCountdownEndTime] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Save to localStorage
  const saveAppData = (newData: AppData) => {
    setAppData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore
    }
  };

  // Evaluate countdown logic
  useEffect(() => {
    if (demoCountdownEndTime) {
      if (demoCountdownEndTime > Date.now()) {
        setIsCountdownActive(true);
      } else {
        setIsCountdownActive(false);
      }
      return;
    }

    if (appData.countdownEnabled && appData.countdownTarget) {
      const targetTime = Date.parse(appData.countdownTarget);
      if (!isNaN(targetTime) && targetTime > Date.now()) {
        setIsCountdownActive(true);
        return;
      }
    }

    setIsCountdownActive(false);
  }, [appData.countdownEnabled, appData.countdownTarget, demoCountdownEndTime]);

  // Confetti cannon
  const triggerCelebratoryConfetti = () => {
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
  };

  // Music toggle
  const toggleMusic = (forcePlay?: boolean) => {
    initAudio();
    const nextState = forcePlay !== undefined ? forcePlay : !isMusicPlaying;
    setIsMusicPlaying(nextState);

    if (nextState) {
      startMusicBox();
    } else {
      stopMusicBox();
    }
  };

  // Sequence to open envelope
  const handleOpenSequence = () => {
    if (isOpen) return;
    initAudio();
    playChimeSound();

    setIsOpen(true);

    // Slide out
    setTimeout(() => {
      playPaperSlideSound();
      setIsSliding(true);
    }, 500);

    // Unfold
    setTimeout(() => {
      setIsUnfolded(true);
    }, 1200);

    // Focus & celebrate
    setTimeout(() => {
      setIsZoomed(true);
      triggerCelebratoryConfetti();
      if (!isMusicPlaying) {
        toggleMusic(true);
      }
    }, 2200);
  };

  const handleSealBreak = () => {
    setIsSealBroken(true);
    setTimeout(() => {
      handleOpenSequence();
    }, 350);
  };

  const handleReplay = () => {
    setIsZoomed(false);
    setIsUnfolded(false);
    setCurrentPage(0);

    setTimeout(() => {
      setIsSliding(false);
    }, 300);

    setTimeout(() => {
      setIsOpen(false);
      setIsSealBroken(false);
    }, 700);
  };

  const handlePhotoUpdate = (index: number, newUrl: string) => {
    const nextPhotos = [...appData.photos];
    nextPhotos[index] = { ...nextPhotos[index], url: newUrl };
    saveAppData({ ...appData, photos: nextPhotos });
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fbbf24', '#f472b6'],
    });
  };

  const totalPages = appData.pages && appData.pages.length > 0 ? appData.pages.length : 1;

  // Turn page from bottom bar
  const handleTurnPageQuickAction = () => {
    if (currentPage < totalPages - 1) {
      initAudio();
      playPageTurnSound();
      setCurrentPage((prev) => prev + 1);
    } else {
      initAudio();
      playPageTurnSound();
      setCurrentPage(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-x-hidden bg-gradient-to-br from-[#1a0b16] via-[#2d1226] to-[#120813] text-stone-800 antialiased select-none font-sans flex flex-col justify-between items-center relative min-h-screen"
    >
      {/* Background Ambient Canvas & Glow */}
      <AmbientCanvas />
      <div className="fixed inset-0 bg-radial-vignette pointer-events-none z-0" />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-5xl px-4 pt-4 sm:pt-6 pb-2 flex items-center justify-between transition-opacity duration-700">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-400/30 backdrop-blur-md flex items-center justify-center text-rose-300 shadow-xs">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs uppercase tracking-widest font-semibold text-rose-300/80">
              Birthday Celebration
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-rose-100/90 font-medium">
              A special surprise for you
            </p>
          </div>
        </div>

        {/* Action Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Music Toggle */}
          <button
            type="button"
            onClick={() => toggleMusic()}
            className={`group relative px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white/90 text-xs font-medium flex items-center space-x-2 transition-all duration-300 shadow-xs active:scale-95 cursor-pointer ${
              !isMusicPlaying ? 'music-paused' : ''
            }`}
          >
            <span className="flex items-center space-x-0.5">
              <span className="w-0.5 h-3 bg-rose-400 rounded-full animate-wave-1" />
              <span className="w-0.5 h-4 bg-rose-300 rounded-full animate-wave-2" />
              <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-wave-3" />
            </span>
            <span>{isMusicPlaying ? 'Playing ♪' : 'Birthday Tune'}</span>
          </button>

          {/* Customize Drawer */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 backdrop-blur-md text-rose-200 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-all duration-300 shadow-xs active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize</span>
          </button>
        </div>
      </header>

      {/* Countdown Lock Screen */}
      {isCountdownActive && (
        <CountdownScreen
          recipient={appData.recipient}
          targetTime={
            demoCountdownEndTime ||
            (appData.countdownTarget ? Date.parse(appData.countdownTarget) : Date.now() + 5000)
          }
          onUnlock={() => {
            setIsCountdownActive(false);
            setDemoCountdownEndTime(null);
            triggerCelebratoryConfetti();
          }}
          onTestDemo={() => {
            setDemoCountdownEndTime(Date.now() + 5000);
            setIsCountdownActive(true);
          }}
        />
      )}

      {/* Main Stage (3D Perspective Stage) */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-4 perspective-1500 overflow-visible">
        {/* Tap to Open Hint */}
        {!isOpen && (
          <div className="absolute -top-3 sm:top-2 z-30 flex flex-col items-center pointer-events-none transition-all duration-500 animate-bounce">
            <div className="px-4 py-2 rounded-full bg-rose-950/70 border border-rose-400/40 backdrop-blur-md text-rose-200 text-xs sm:text-sm font-medium shadow-glow-rose flex items-center space-x-2">
              <LockKeyholeOpen className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Press & hold the wax seal to break it open ✨</span>
            </div>
          </div>
        )}

        {/* 3D Scene Wrapper */}
        <div
          className={`scene-container transition-transform duration-1000 ease-out transform-gpu ${
            isZoomed ? 'is-zoomed' : ''
          }`}
        >
          {/* Envelope Component */}
          <div
            className={`envelope-container relative group ${isOpen ? 'is-open' : ''} ${
              isSliding ? 'is-sliding' : ''
            } ${isUnfolded ? 'is-unfolded' : ''}`}
            onClick={() => {
              if (!isSealBroken && !isOpen) {
                // Pulse guidance
              }
            }}
          >
            {/* Ambient Shadow */}
            <div className="envelope-ground-shadow" />

            {/* Back face & Interior Liner */}
            <div className="envelope-back bg-gradient-to-b from-[#b84d66] to-[#80233b] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="envelope-interior-liner bg-gradient-to-b from-parchment-200 to-parchment-300" />
            </div>

            {/* ================= FOLDED & UNFOLDING LETTER ================= */}
            <div className="letter-sheet parchment-texture text-stone-800 rounded-xl transition-all duration-1000 transform-gpu overflow-hidden">
              {/* Delicate Gold Foil Border Pattern */}
              <div className="absolute inset-2 sm:inset-3 border border-amber-800/20 rounded-lg pointer-events-none z-20 flex flex-col justify-between">
                <div className="flex justify-between p-1">
                  <span className="text-amber-800/40 text-xs sm:text-sm font-serif">✦</span>
                  <span className="text-amber-800/40 text-xs sm:text-sm font-serif">✦</span>
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-amber-800/40 text-xs sm:text-sm font-serif">✦</span>
                  <span className="text-amber-800/40 text-xs sm:text-sm font-serif">✦</span>
                </div>
              </div>

              {/* Crease Overlay */}
              <div
                id="crease-overlay"
                className="absolute inset-0 pointer-events-none z-20 opacity-30 transition-opacity duration-700"
              />

              {/* 4 Corner Polaroid Photo Memories */}
              <PolaroidMemories
                photos={appData.photos}
                onUpdatePhoto={handlePhotoUpdate}
              />

              {/* Multi-Page Letter Engine with Page Turning */}
              <LetterContent
                appData={appData}
                isUnfolded={isUnfolded}
                currentPage={currentPage}
                onPageChange={(p) => setCurrentPage(p)}
                onOpenGiftBox={() => {
                  initAudio();
                  setIsGiftModalOpen(true);
                }}
              />
            </div>

            {/* Side Pockets */}
            <div className="envelope-pocket-left" />
            <div className="envelope-pocket-right" />

            {/* Bottom Pocket */}
            <div className="envelope-pocket-bottom bg-gradient-to-t from-[#8f2840] via-[#ab3f58] to-[#be4e68]">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
              <div className="envelope-pocket-trim" />
            </div>

            {/* Top Flap */}
            <div className="envelope-flap bg-gradient-to-b from-[#c95973] via-[#b3445d] to-[#992f47]">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
              <div className="envelope-flap-trim" />
            </div>

            {/* Virtual Tactile Wax Seal */}
            <WaxSeal isBroken={isSealBroken} onBreak={handleSealBreak} />
          </div>
        </div>
      </main>

      {/* Bottom Floating Interactive Control Bar */}
      <footer className="relative z-20 w-full max-w-2xl px-4 py-4 sm:pb-6 flex items-center justify-center gap-2 sm:gap-3 transition-opacity duration-500">
        {/* Replay */}
        <button
          type="button"
          onClick={handleReplay}
          className="px-3.5 sm:px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-900 border border-white/20 text-white text-xs sm:text-sm font-medium flex items-center space-x-1.5 sm:space-x-2 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-rose-400/50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Replay</span>
        </button>

        {/* Turn Page Quick Action (Visible when letter is unfolded and multi-page exists) */}
        {isUnfolded && totalPages > 1 && (
          <button
            type="button"
            onClick={handleTurnPageQuickAction}
            className="px-3.5 sm:px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>
              {currentPage < totalPages - 1
                ? `Turn to Page ${currentPage + 2}`
                : 'Turn to Page 1'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        )}

        {/* 3D Gift Box Button (Available when letter is unfolded) */}
        {isUnfolded && appData.giftBoxEnabled !== false && (
          <button
            type="button"
            onClick={() => {
              initAudio();
              setIsGiftModalOpen(true);
            }}
            className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-700 via-amber-600 to-rose-700 hover:from-rose-600 hover:to-amber-500 border border-amber-300/50 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 shadow-glow-rose transition-all active:scale-95 cursor-pointer animate-pulse hover:animate-none"
            title="Unwrap 3D gift box surprise"
          >
            <Gift className="w-4 h-4 text-amber-200" />
            <span>3D Gift Box 🎁</span>
          </button>
        )}

        {/* Focus Note */}
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              handleOpenSequence();
            } else {
              setIsZoomed(!isZoomed);
            }
          }}
          className="px-3.5 sm:px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-900 border border-white/20 text-white text-xs sm:text-sm font-medium flex items-center space-x-1.5 sm:space-x-2 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-rose-400/50 cursor-pointer"
        >
          {isZoomed ? (
            <>
              <ZoomOut className="w-4 h-4 text-amber-300" />
              <span>View All</span>
            </>
          ) : (
            <>
              <ZoomIn className="w-4 h-4 text-amber-300" />
              <span>Focus Note</span>
            </>
          )}
        </button>

        {/* Confetti Cannon */}
        <button
          type="button"
          onClick={triggerCelebratoryConfetti}
          className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 shadow-glow-rose transition-all active:scale-95 cursor-pointer"
        >
          <PartyPopper className="w-4 h-4" />
          <span>Confetti! 🎉</span>
        </button>
      </footer>

      {/* 3D Virtual Gift Box Unwrapping Modal */}
      <GiftBoxModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        videoUrl={appData.giftVideoUrl}
        videoTitle={appData.giftVideoTitle}
        videoMessage={appData.giftVideoMessage}
        recipientName={appData.recipient}
      />

      {/* Customize Drawer Modal */}
      <CustomizerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appData={appData}
        onSave={(newData) => {
          saveAppData(newData);
          setCurrentPage(0);
          if (!isOpen) {
            setTimeout(handleOpenSequence, 300);
          } else {
            triggerCelebratoryConfetti();
          }
        }}
        onReset={() => {
          if (window.confirm('Reset all text, pages, and photos to original defaults?')) {
            saveAppData(DEFAULT_DATA);
            setCurrentPage(0);
            setIsModalOpen(false);
          }
        }}
        onTestDemoCountdown={() => {
          setDemoCountdownEndTime(Date.now() + 5000);
          setIsCountdownActive(true);
        }}
      />
    </div>
  );
}
