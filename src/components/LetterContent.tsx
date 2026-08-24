import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Heart,
  Bookmark,
  Gift,
  Film,
} from 'lucide-react';
import { AppData } from '../types';
import { ScratchCard } from './ScratchCard';
import {
  initAudio,
  playPageTurnSound,
  playTypewriterClickSound,
} from '../utils/audio';

interface LetterContentProps {
  appData: AppData;
  isUnfolded: boolean;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  onOpenGiftBox?: () => void;
}

export const LetterContent: React.FC<LetterContentProps> = ({
  appData,
  isUnfolded,
  currentPage,
  onPageChange,
  onOpenGiftBox,
}) => {
  const pages = appData.pages && appData.pages.length > 0
    ? appData.pages
    : [{ id: 'p1', title: '', content: 'Happy Birthday!' }];

  const totalPages = pages.length;
  const activePage = pages[currentPage] || pages[0];

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);

  const typingTimeoutsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clearTypingTimers = () => {
    typingTimeoutsRef.current.forEach((id) => clearTimeout(id));
    typingTimeoutsRef.current = [];
    setIsTyping(false);
  };

  // Turn to Next Page with sound & 3D flip
  const handleNextPage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentPage < totalPages - 1) {
      initAudio();
      playPageTurnSound();
      setFlipDirection('forward');
      setTimeout(() => {
        onPageChange(currentPage + 1);
        setTimeout(() => setFlipDirection(null), 400);
      }, 220);
    }
  };

  // Turn to Previous Page
  const handlePrevPage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentPage > 0) {
      initAudio();
      playPageTurnSound();
      setFlipDirection('backward');
      setTimeout(() => {
        onPageChange(currentPage - 1);
        setTimeout(() => setFlipDirection(null), 400);
      }, 220);
    }
  };

  // Typewriter effect on page switch or unfold
  useEffect(() => {
    clearTypingTimers();

    if (!isUnfolded) {
      setDisplayedText('');
      return;
    }

    if (!appData.typewriterEnabled) {
      setDisplayedText(activePage.content);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');

    const fullText = activePage.content;
    let charIndex = 0;

    const typeNext = () => {
      if (charIndex < fullText.length) {
        const nextChar = fullText[charIndex];
        setDisplayedText(fullText.slice(0, charIndex + 1));
        playTypewriterClickSound(nextChar);
        charIndex++;

        let delay = 22 + Math.random() * 16;
        if (nextChar === ' ') {
          delay = 32 + Math.random() * 14;
        } else if (['.', '!', '?'].includes(nextChar)) {
          delay = 200 + Math.random() * 50;
        } else if ([',', ';', ':', '—', '-'].includes(nextChar)) {
          delay = 110 + Math.random() * 30;
        }

        const timer = window.setTimeout(typeNext, delay);
        typingTimeoutsRef.current.push(timer);
      } else {
        setIsTyping(false);
      }
    };

    const initialTimer = window.setTimeout(typeNext, 200);
    typingTimeoutsRef.current.push(initialTimer);

    return () => {
      clearTypingTimers();
    };
  }, [currentPage, isUnfolded, activePage.content, appData.typewriterEnabled]);

  const handleSkipTyping = () => {
    if (isTyping) {
      clearTypingTimers();
      setDisplayedText(activePage.content);
    }
  };

  // Format paragraphs nicely with special word styling
  const renderFormattedParagraphs = (rawText: string) => {
    const paragraphs = rawText.split('\n\n').filter(Boolean);
    if (paragraphs.length === 0) return null;

    return paragraphs.map((para, pIdx) => {
      // Highlight "you" with romantic cursive on page 1
      const isFirstPara = pIdx === 0 && currentPage === 0;
      let content: React.ReactNode = para;

      if (isFirstPara && para.toLowerCase().includes('you')) {
        const parts = para.split(/\b(you)\b/gi);
        content = parts.map((part, i) => {
          if (part.toLowerCase() === 'you') {
            return (
              <em
                key={i}
                className="text-rose-800 font-cursive text-2xl sm:text-3xl not-italic font-bold"
              >
                {part}
              </em>
            );
          }
          return part;
        });
      }

      return (
        <p key={pIdx} className="leading-relaxed">
          {content}
        </p>
      );
    });
  };

  const isFinalPage = currentPage === totalPages - 1;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  return (
    <div
      ref={containerRef}
      className={`relative z-20 w-full h-full flex flex-col justify-between px-5 sm:px-12 md:px-16 py-5 sm:py-8 text-center transition-all duration-500 select-none ${
        flipDirection === 'forward'
          ? 'page-flip-forward'
          : flipDirection === 'backward'
          ? 'page-flip-backward'
          : ''
      }`}
      onClick={handleSkipTyping}
    >
      {/* Decorative Top Bookmark Ribbon Tag */}
      {totalPages > 1 && (
        <div
          className="page-ribbon-tag"
          onClick={handleNextPage}
          title={`Page ${currentPage + 1} of ${totalPages}`}
        >
          <Bookmark className="w-3 h-3 text-amber-200 fill-amber-200/50" />
        </div>
      )}

      {/* Letter Header / Salutation */}
      <div className="space-y-1 pt-1">
        <div className="inline-flex items-center space-x-2 text-rose-700/80 font-serif text-[11px] sm:text-xs uppercase tracking-widest">
          <span className="h-px w-5 sm:w-8 bg-rose-400/40" />
          <span>{appData.date || 'August 25, 2026'}</span>
          <span className="h-px w-5 sm:w-8 bg-rose-400/40" />
        </div>

        {currentPage === 0 ? (
          <h2 className="font-script text-3xl sm:text-4xl md:text-5xl text-rose-900 drop-shadow-sm font-semibold tracking-wide">
            Dearest{' '}
            <span className="border-b-2 border-rose-300/60 pb-0.5 text-rose-950 font-bold">
              {appData.recipient || 'Birthday Star'}
            </span>
            ,
          </h2>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-amber-800/40 text-xs font-serif">✦</span>
            <h3 className="font-serif italic text-base sm:text-lg text-rose-900 font-semibold">
              {activePage.title || `Chapter ${currentPage + 1}`}
            </h3>
            <span className="text-amber-800/40 text-xs font-serif">✦</span>
          </div>
        )}
      </div>

      {/* Main Message Text Area */}
      <div className="my-auto py-1.5 sm:py-2 px-1 max-w-lg mx-auto w-full text-stone-800 font-handwriting text-lg sm:text-2xl leading-relaxed font-bold space-y-2.5 sm:space-y-3 cursor-text">
        {renderFormattedParagraphs(displayedText)}
        {isTyping && <span className="typewriter-cursor" />}
      </div>

      {/* Secret Scratch Card on final page or teaser on earlier pages */}
      {isFinalPage && appData.secretMessage ? (
        <div className="w-full my-1 sm:my-2" onClick={(e) => e.stopPropagation()}>
          <ScratchCard secretMessage={appData.secretMessage} />
        </div>
      ) : appData.secretMessage && totalPages > 1 ? (
        <div
          onClick={handleNextPage}
          className="w-full my-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-400/30 text-amber-900/90 text-xs font-serif italic cursor-pointer flex items-center justify-center space-x-1.5 transition active:scale-98"
          title="Turn page to reveal secret gift voucher"
        >
          <Gift className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>🎁 Secret gift voucher waiting on the final page (Click to turn →)</span>
        </div>
      ) : null}

      {/* Virtual 3D Gift Box Unwrapping Button on Final Page */}
      {isFinalPage && appData.giftBoxEnabled !== false && onOpenGiftBox && (
        <div className="w-full my-1 sm:my-1.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onOpenGiftBox}
            className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 via-amber-600 to-rose-700 hover:from-rose-600 hover:via-amber-500 hover:to-rose-600 text-white font-cinzel text-xs sm:text-sm font-bold shadow-lg border border-amber-300/60 flex items-center space-x-2 transition-all duration-300 active:scale-95 cursor-pointer animate-pulse hover:animate-none"
            title="Open 3D Gift Box and reveal final surprise video"
          >
            <Gift className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform animate-bounce" />
            <span className="tracking-wide">Unwrap Final 3D Gift Box ✨</span>
            <Film className="w-3.5 h-3.5 text-amber-200 opacity-80 group-hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Letter Bottom Section: Page Navigation & Aesthetic "Turn Page" Button */}
      <div className="pt-2 border-t border-amber-900/15 mt-auto">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Signature or Previous Page */}
          <div className="text-left flex items-center space-x-2">
            {hasPrevPage ? (
              <button
                type="button"
                onClick={handlePrevPage}
                className="px-2.5 py-1 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 text-xs font-serif italic flex items-center space-x-1 border border-amber-900/20 transition active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Page {currentPage}</span>
              </button>
            ) : (
              <div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-500 font-serif">
                  Forever & Always,
                </div>
                <div className="font-cursive text-xl sm:text-2xl md:text-3xl text-rose-800 font-bold leading-none">
                  {appData.signature || 'With love ❤️'}
                </div>
              </div>
            )}
          </div>

          {/* Center: Delicate Page Indicator Pill */}
          {totalPages > 1 && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[11px] font-cinzel font-semibold text-amber-900 shadow-xs">
              <BookOpen className="w-3 h-3 text-amber-700" />
              <span>
                Page {currentPage + 1} / {totalPages}
              </span>
            </div>
          )}

          {/* Right: Aesthetic "Turn Page" Button OR Vintage Stamp */}
          <div className="flex items-center space-x-2">
            {hasNextPage ? (
              <button
                type="button"
                onClick={handleNextPage}
                className="btn-turn-page-pill group px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 sm:space-x-2 cursor-pointer transition-all active:scale-95 shadow-lg"
                title="Turn to next page"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span className="font-medium tracking-wide">Turn Page</span>
                <ChevronRight className="w-4 h-4 text-amber-100 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <div className="vintage-stamp">
                <div className="vintage-stamp-inner">
                  <Heart className="w-3.5 h-3.5 text-rose-700 fill-rose-600" />
                  <span className="text-[7px] font-cinzel font-bold text-rose-900">
                    SPECIAL
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Aesthetic Curled Page Corner (Clickable page corner at bottom right) */}
      {hasNextPage && (
        <div
          className="page-corner-curl group/curl"
          onClick={handleNextPage}
          title="Click or drag corner to turn page"
        >
          <div className="absolute bottom-2 right-2 flex items-center justify-center text-[10px] text-amber-800/80 font-cinzel font-bold">
            <span className="group-hover/curl:translate-x-0.5 group-hover/curl:-translate-y-0.5 transition-transform">
              ✦
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
