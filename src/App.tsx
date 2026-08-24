/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ArrowLeft,
  Share2,
  Layers,
  Smile,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import {
  AppData,
  EnvelopeData,
  EnvelopeTheme,
  DEFAULT_DATA,
  DEFAULT_ENVELOPES,
} from './types';
import { AmbientCanvas } from './components/AmbientCanvas';
import { WaxSeal } from './components/WaxSeal';
import { PolaroidMemories } from './components/PolaroidMemories';
import { LetterContent } from './components/LetterContent';
import { CountdownScreen } from './components/CountdownScreen';
import { CustomizerModal } from './components/CustomizerModal';
import { GiftBoxModal } from './components/GiftBoxModal';
import { PasswordLockScreen } from './components/PasswordLockScreen';
import { CreatorDashboard } from './components/CreatorDashboard';
import { EnvelopeStackView } from './components/EnvelopeStackView';
import {
  decodeBase64ToAppData,
  getUrlDataParam,
  generateShareUrl,
} from './utils/urlEncoder';
import {
  initAudio,
  playChimeSound,
  playPaperSlideSound,
  playPageTurnSound,
  startMusicBox,
  stopMusicBox,
  playThemeUnsealSound,
} from './utils/audio';
import { triggerThemeConfetti } from './utils/confettiHelper';

const STORAGE_KEY = 'happy_birthday_custom_data_v3';

export default function App() {
  // Check if URL has ?data= parameter for Viewer Mode
  const [dataParam, setDataParam] = useState<string | null>(() => getUrlDataParam());
  const [isViewerMode, setIsViewerMode] = useState<boolean>(() => Boolean(getUrlDataParam()));

  // Active App Data
  const [appData, setAppData] = useState<AppData>(() => {
    const urlData = getUrlDataParam();
    if (urlData) {
      const decoded = decodeBase64ToAppData(urlData);
      if (decoded) return decoded;
    }

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

  // Strict Password / Riddle Lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const urlData = getUrlDataParam();
    if (urlData) {
      const decoded = decodeBase64ToAppData(urlData);
      if (decoded && decoded.secretPassword && decoded.secretPassword.trim().length > 0) {
        return false; // Locked until recipient enters exact password
      }
    }
    return true; // No password required
  });

  // Multi-Envelope Viewer State
  const [viewerScreen, setViewerScreen] = useState<'stack' | 'envelope'>('stack');
  const [selectedEnvelopeIdx, setSelectedEnvelopeIdx] = useState<number>(0);
  const [openedEnvelopeIds, setOpenedEnvelopeIds] = useState<Set<string>>(new Set());

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

  // Temporary preview flag for Creator
  const [isPreviewingInCreator, setIsPreviewingInCreator] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Envelopes fallback
  const envelopesList =
    appData.envelopes && appData.envelopes.length > 0
      ? appData.envelopes
      : DEFAULT_ENVELOPES;

  const activeEnvelope: EnvelopeData =
    envelopesList[selectedEnvelopeIdx] || envelopesList[0] || DEFAULT_ENVELOPES[0];

  const activeTheme: EnvelopeTheme = activeEnvelope.theme || 'celebration';

  // Listen to popstate or hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const param = getUrlDataParam();
      setDataParam(param);
      if (param) {
        const decoded = decodeBase64ToAppData(param);
        if (decoded) {
          setAppData(decoded);
          setIsViewerMode(true);
          if (decoded.secretPassword && decoded.secretPassword.trim().length > 0) {
            setIsUnlocked(false);
          } else {
            setIsUnlocked(true);
          }
        }

        // If data was in search query (?data=...), safely convert it to hash (#data=...)
        // so page refreshes never hit HTTP 414 Request-URI Too Large limits
        if (window.location.search && window.location.search.includes('data=')) {
          const newUrl = `${window.location.origin}${window.location.pathname}#data=${param}`;
          window.history.replaceState({}, '', newUrl);
        }
      } else {
        setIsViewerMode(false);
        setIsUnlocked(true);
      }
    };

    // Run on initial load to clean up any ?data= in browser URL bar
    if (window.location.search && window.location.search.includes('data=')) {
      const param = getUrlDataParam();
      if (param) {
        const newUrl = `${window.location.origin}${window.location.pathname}#data=${param}`;
        window.history.replaceState({}, '', newUrl);
      }
    }

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Save to localStorage (Creator Mode)
  const saveAppData = (newData: AppData) => {
    setAppData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore
    }
  };

  // Evaluate countdown logic strictly
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

  // Sequence to open envelope with dynamic theme animations
  const handleOpenSequence = () => {
    if (isOpen || isCountdownActive) return;
    initAudio();
    playThemeUnsealSound(activeTheme);

    setIsOpen(true);
    setOpenedEnvelopeIds((prev) => new Set(prev).add(activeEnvelope.id));

    // Slide out
    setTimeout(() => {
      playPaperSlideSound();
      setIsSliding(true);
    }, 500);

    // Unfold
    setTimeout(() => {
      setIsUnfolded(true);
    }, 1200);

    // Focus & dynamic theme confetti explosion!
    setTimeout(() => {
      setIsZoomed(true);
      triggerThemeConfetti(activeTheme);
      if (!isMusicPlaying && activeTheme === 'celebration') {
        toggleMusic(true);
      }
    }, 2200);
  };

  const handleSealBreak = () => {
    if (isCountdownActive) return;
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

  // Select an envelope from Stack Desk
  const handleSelectEnvelopeFromStack = (envelope: EnvelopeData, index: number) => {
    setSelectedEnvelopeIdx(index);
    setCurrentPage(0);
    setIsSealBroken(false);
    setIsOpen(false);
    setIsSliding(false);
    setIsUnfolded(false);
    setIsZoomed(false);
    setViewerScreen('envelope');
  };

  // Switch between envelopes while inside the envelope stage
  const handleSwitchEnvelopeDirect = (index: number) => {
    if (index === selectedEnvelopeIdx) return;
    initAudio();
    setSelectedEnvelopeIdx(index);
    setCurrentPage(0);
    setIsSealBroken(false);
    setIsOpen(false);
    setIsSliding(false);
    setIsUnfolded(false);
    setIsZoomed(false);
  };

  // Disabled in Viewer Mode
  const handlePhotoUpdate = (index: number, newUrl: string) => {
    if (isViewerMode) return;
    const nextEnvelopes = [...(appData.envelopes || DEFAULT_ENVELOPES)];
    const currentEnv = nextEnvelopes[selectedEnvelopeIdx] || nextEnvelopes[0];
    const newPhotos = [...(currentEnv.photos || DEFAULT_ENVELOPES[0].photos)];
    newPhotos[index] = { ...newPhotos[index], url: newUrl };
    currentEnv.photos = newPhotos;
    saveAppData({ ...appData, envelopes: nextEnvelopes });
  };

  const totalPages =
    activeEnvelope.pages && activeEnvelope.pages.length > 0
      ? activeEnvelope.pages.length
      : 1;

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

  // Switch to creator dashboard from viewer
  const handleGoToCreatorMode = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    window.history.pushState({}, '', url.toString());
    setIsViewerMode(false);
    setIsPreviewingInCreator(false);
    setIsUnlocked(true);
  };

  // Theme Background Gradient Class
  const getThemeBackground = () => {
    switch (activeTheme) {
      case 'stressed':
        return 'from-[#08181e] via-[#0f2e38] to-[#061217]';
      case 'laugh':
        return 'from-[#1e0f2b] via-[#33113d] to-[#12071c]';
      case 'celebration':
      default:
        return 'from-[#1a0b16] via-[#2d1226] to-[#120813]';
    }
  };

  // ================= 1. CREATOR MODE DASHBOARD =================
  if (!isViewerMode && !isPreviewingInCreator) {
    return (
      <CreatorDashboard
        initialData={appData}
        onSaveAndPreview={(newData) => {
          saveAppData(newData);
          setIsPreviewingInCreator(true);
          setViewerScreen('stack');
        }}
        onEnterViewerMode={(newData) => {
          saveAppData(newData);
          const shareUrl = generateShareUrl(newData);
          window.location.href = shareUrl;
        }}
      />
    );
  }

  // ================= 2. STRICT BIRTHDAY COUNTDOWN LOCK (BEFORE BIRTHDAY ARRIVES) =================
  if (isCountdownActive) {
    const targetTimestamp =
      demoCountdownEndTime ||
      (appData.countdownTarget ? Date.parse(appData.countdownTarget) : Date.now() + 5000);

    return (
      <CountdownScreen
        recipient={appData.recipient}
        targetTime={targetTimestamp}
        isViewerMode={isViewerMode}
        onUnlock={() => {
          setIsCountdownActive(false);
          setDemoCountdownEndTime(null);
          triggerThemeConfetti(activeTheme);
        }}
        onTestDemo={() => {
          setDemoCountdownEndTime(Date.now() + 5000);
          setIsCountdownActive(true);
        }}
      />
    );
  }

  // ================= 3. STRICT PASSWORD / RIDDLE LOCK SCREEN (VIEWER MODE) =================
  if (
    isViewerMode &&
    !isUnlocked &&
    appData.secretPassword &&
    appData.secretPassword.trim().length > 0
  ) {
    return (
      <PasswordLockScreen
        requiredPassword={appData.secretPassword}
        riddlePrompt={appData.riddlePrompt}
        recipientName={appData.recipient}
        onUnlock={() => {
          setIsUnlocked(true);
          setViewerScreen('stack');
        }}
      />
    );
  }

  // ================= 4. MULTI-ENVELOPE "OPEN WHEN" VIEWER EXPERIENCE =================
  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-x-hidden bg-gradient-to-br ${getThemeBackground()} text-stone-800 antialiased select-none font-sans flex flex-col justify-between items-center relative min-h-screen transition-colors duration-1000`}
    >
      {/* Dynamic Theme Ambient Canvas & Lighting */}
      <AmbientCanvas theme={activeTheme} />
      <div className="fixed inset-0 bg-radial-vignette pointer-events-none z-0" />

      {/* Top Header & Envelope Switcher Bar */}
      <header className="relative z-30 w-full max-w-5xl px-4 pt-4 sm:pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-700">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-400/30 backdrop-blur-md flex items-center justify-center text-rose-300 shadow-xs">
              <Cake className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xs uppercase tracking-widest font-semibold text-rose-200/90 font-cinzel">
                {appData.recipient}'s Birthday Collection
              </h1>
              <p className="text-xs sm:text-sm font-serif italic text-stone-300/90 font-medium">
                {viewerScreen === 'stack' ? 'The "Open When" Stack' : activeEnvelope.label}
              </p>
            </div>
          </div>

          {/* Mobile Back Button */}
          {viewerScreen === 'envelope' && (
            <button
              type="button"
              onClick={() => {
                initAudio();
                setViewerScreen('stack');
              }}
              className="sm:hidden px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-cinzel font-bold flex items-center space-x-1"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>Stack</span>
            </button>
          )}
        </div>

        {/* Action Badges & Envelope Quick Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
          {/* Back to Stack Desk Button (Desktop) */}
          {viewerScreen === 'envelope' && (
            <button
              type="button"
              onClick={() => {
                initAudio();
                setViewerScreen('stack');
              }}
              className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-cinzel font-bold items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-md"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>← All Envelopes</span>
            </button>
          )}

          {/* Quick Envelope Switcher Pills */}
          {viewerScreen === 'envelope' && (
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/15 backdrop-blur-md">
              {envelopesList.map((env, idx) => {
                const isActive = selectedEnvelopeIdx === idx;
                const isOpened = openedEnvelopeIds.has(env.id);
                return (
                  <button
                    key={env.id || idx}
                    type="button"
                    onClick={() => handleSwitchEnvelopeDirect(idx)}
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-cinzel font-bold flex items-center space-x-1 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{idx === 0 ? '💌 Now' : idx === 1 ? '🌿 Calm' : '😂 Fun'}</span>
                    {isOpened && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Creator Preview Banner / Exit */}
          {isPreviewingInCreator && (
            <button
              type="button"
              onClick={() => setIsPreviewingInCreator(false)}
              className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Editor</span>
            </button>
          )}

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
            <span className="hidden sm:inline">{isMusicPlaying ? 'Playing ♪' : 'Music'}</span>
          </button>
        </div>
      </header>

      {/* VIEW A: 3D ENVELOPE STACK DESK VIEW */}
      {viewerScreen === 'stack' ? (
        <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-4 overflow-visible animate-fadeIn">
          <EnvelopeStackView
            appData={appData}
            onSelectEnvelope={handleSelectEnvelopeFromStack}
            openedEnvelopeIds={openedEnvelopeIds}
          />
        </main>
      ) : (
        /* VIEW B: 3D INTERACTIVE UNSEALING ENVELOPE STAGE */
        <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-4 perspective-1500 overflow-visible">
          {/* Tap to Open Hint */}
          {!isOpen && (
            <div className="absolute -top-3 sm:top-2 z-30 flex flex-col items-center pointer-events-none transition-all duration-500 animate-bounce">
              <div className="px-4 py-2 rounded-full bg-black/70 border border-amber-400/40 backdrop-blur-md text-amber-200 text-xs sm:text-sm font-medium shadow-glow-rose flex items-center space-x-2">
                <LockKeyholeOpen className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>
                  {activeTheme === 'stressed'
                    ? 'Press & hold the serene wax seal to take a breath 🌿'
                    : activeTheme === 'laugh'
                    ? 'Press & hold to unleash chaotic laughter 😂'
                    : 'Press & hold the wax seal to break it open ✨'}
                </span>
              </div>
            </div>
          )}

          {/* 3D Scene Wrapper */}
          <div
            className={`scene-container transition-transform duration-1000 ease-out transform-gpu ${
              isZoomed ? 'is-zoomed' : ''
            }`}
          >
            {/* Envelope Component with Dynamic Theme Styling */}
            <div
              className={`envelope-container envelope-theme-${activeTheme} relative group ${
                isOpen ? 'is-open' : ''
              } ${isSliding ? 'is-sliding' : ''} ${isUnfolded ? 'is-unfolded' : ''}`}
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

                {/* 4 Corner Polaroid Photo Memories (Strictly read-only on Viewer Mode) */}
                <PolaroidMemories
                  photos={activeEnvelope.photos || DEFAULT_ENVELOPES[0].photos}
                  onUpdatePhoto={handlePhotoUpdate}
                  isViewerMode={isViewerMode}
                  readOnly={isViewerMode}
                />

                {/* Multi-Page Letter Engine with Page Turning & Theme Styling */}
                <LetterContent
                  appData={appData}
                  isUnfolded={isUnfolded}
                  currentPage={currentPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  theme={activeTheme}
                  envelopeLabel={activeEnvelope.label}
                  pages={activeEnvelope.pages}
                  signature={activeEnvelope.signature}
                  secretMessage={activeEnvelope.secretMessage}
                  giftBoxEnabled={activeEnvelope.giftBoxEnabled}
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
              <WaxSeal
                isBroken={isSealBroken}
                onBreak={handleSealBreak}
                theme={activeTheme}
                sealSymbol={activeEnvelope.sealSymbol}
                sealText={activeEnvelope.sealText}
              />
            </div>
          </div>
        </main>
      )}

      {/* Bottom Floating Interactive Control Bar */}
      <footer className="relative z-30 w-full max-w-2xl px-4 py-4 sm:pb-6 flex flex-col items-center gap-3 transition-opacity duration-500">
        {viewerScreen === 'envelope' && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {/* Replay */}
            <button
              type="button"
              onClick={handleReplay}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-stone-900/80 hover:bg-stone-900 border border-white/20 text-white text-xs sm:text-sm font-medium flex items-center space-x-1.5 sm:space-x-2 shadow-lg backdrop-blur-md transition-all active:scale-95 hover:border-rose-400/50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reseal</span>
            </button>

            {/* Turn Page Quick Action */}
            {isUnfolded && totalPages > 1 && (
              <button
                type="button"
                onClick={handleTurnPageQuickAction}
                className="px-3.5 sm:px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>
                  {currentPage < totalPages - 1
                    ? `Page ${currentPage + 2}`
                    : 'Page 1'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}

            {/* 3D Gift Box Button */}
            {isUnfolded && activeEnvelope.giftBoxEnabled !== false && (
              <button
                type="button"
                onClick={() => {
                  initAudio();
                  setIsGiftModalOpen(true);
                }}
                className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-700 via-amber-600 to-rose-700 hover:from-rose-600 hover:via-amber-500 hover:to-rose-600 border border-amber-300/50 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 shadow-glow-rose transition-all active:scale-95 cursor-pointer animate-pulse hover:animate-none"
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
              onClick={() => triggerThemeConfetti(activeTheme)}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 shadow-glow-rose transition-all active:scale-95 cursor-pointer"
            >
              <PartyPopper className="w-4 h-4" />
              <span>
                {activeTheme === 'stressed'
                  ? 'Zen Petals 🌸'
                  : activeTheme === 'laugh'
                  ? 'Chaos Blasts 😂'
                  : 'Confetti! 🎉'}
              </span>
            </button>
          </div>
        )}

        {/* Discreet "Create Your Own Birthday Envelope" link in Viewer Mode */}
        {isViewerMode && (
          <button
            type="button"
            onClick={handleGoToCreatorMode}
            className="text-[11px] text-rose-300/60 hover:text-rose-200 flex items-center space-x-1 transition cursor-pointer pt-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Create your own "Open When" envelopes for someone else</span>
          </button>
        )}
      </footer>

      {/* 3D Virtual Gift Box Unwrapping Modal */}
      <GiftBoxModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        videoUrl={activeEnvelope.giftVideoUrl || appData.giftVideoUrl}
        videoTitle={activeEnvelope.giftVideoTitle || appData.giftVideoTitle}
        videoMessage={activeEnvelope.giftVideoMessage || appData.giftVideoMessage}
        recipientName={appData.recipient}
      />
    </div>
  );
}
