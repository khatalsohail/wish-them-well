import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { initAudio, playScratchSound, playTriumphChime } from '../utils/audio';

interface ScratchCardProps {
  secretMessage: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ secretMessage }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const initFoil = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsRevealed(false);
    setIsScratching(false);
    setScratchProgress(0);
    lastPointRef.current = null;

    // Get true bounding dimensions
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width || container.clientWidth || 320);
    const h = Math.round(rect.height || container.clientHeight || 74);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(w * dpr, 200);
    canvas.height = Math.max(h * dpr, 60);

    // Reset transform & render crisp foil
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // 1. Shimmering Metallic Gold Foil Gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#92400e'); // warm bronze gold
    grad.addColorStop(0.2, '#f59e0b');
    grad.addColorStop(0.38, '#fef08a'); // sparkling gold highlight
    grad.addColorStop(0.55, '#f59e0b');
    grad.addColorStop(0.72, '#fde047');
    grad.addColorStop(0.88, '#d97706');
    grad.addColorStop(1, '#92400e');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Subtle Star Sparkles Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    const sparkleCount = Math.floor((canvas.width * canvas.height) / 700);
    for (let i = 0; i < sparkleCount; i++) {
      const sx = Math.random() * canvas.width;
      const sy = Math.random() * canvas.height;
      const sSize = Math.random() * (2.2 * dpr) + 0.8;
      ctx.fillRect(sx, sy, sSize, sSize);
    }

    // 3. Foil ornate dashed border
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.5)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([5 * dpr, 4 * dpr]);
    ctx.strokeRect(4 * dpr, 4 * dpr, canvas.width - 8 * dpr, canvas.height - 8 * dpr);
    ctx.setLineDash([]);

    // 4. Center Watermark text (Drawn ON foil, so scratching erases it!)
    const fontSize = Math.max(Math.round(11 * dpr), 11);
    ctx.font = `bold ${fontSize}px 'Cinzel', 'Playfair Display', serif`;
    ctx.fillStyle = 'rgba(120, 53, 15, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.7)';
    ctx.shadowBlur = 4 * dpr;
    ctx.fillText('✦ SCRATCH TO REVEAL SECRET ✦', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
  }, []);

  // Initialize foil with slight delay to ensure CSS layout is settled
  useEffect(() => {
    const timer = setTimeout(() => {
      initFoil();
    }, 60);

    const handleResize = () => {
      if (!isRevealed) {
        initFoil();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [secretMessage, initFoil, isRevealed]);

  const revealVoucher = useCallback(() => {
    if (isRevealed) return;
    setIsRevealed(true);
    setScratchProgress(100);

    // Clear canvas completely
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    playTriumphChime();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([30, 40, 60]);
      } catch {
        // ignore
      }
    }

    try {
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { x: 0.5, y: 0.62 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ec4899', '#fef08a'],
      });
    } catch {
      // ignore
    }
  }, [isRevealed]);

  const checkScratchPercentage = useCallback(() => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const pixels = imgData.data;
      let transparentCount = 0;
      const totalPixels = pixels.length / 4;

      // Sample every 16th pixel for smooth performance
      for (let i = 3; i < pixels.length; i += 64) {
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }

      const sampledCount = Math.floor(totalPixels / 16);
      const ratio = transparentCount / sampledCount;
      const pct = Math.round(ratio * 100);
      setScratchProgress(pct);

      // Auto reveal once 22% or more is scratched
      if (ratio >= 0.22) {
        revealVoucher();
      }
    } catch {
      // Fallback
    }
  }, [isRevealed, revealVoucher]);

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const eraseAt = (x: number, y: number, radius = 28) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = radius * dpr;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();
  };

  const eraseLine = (x1: number, y1: number, x2: number, y2: number, radius = 28) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = radius * dpr;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = r * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    playScratchSound();
  };

  // Unified Pointer Down Handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (isRevealed) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    initAudio();
    setIsScratching(true);

    const pt = getCanvasCoords(e.clientX, e.clientY);
    lastPointRef.current = pt;
    eraseAt(pt.x, pt.y);
    checkScratchPercentage();
  };

  // Unified Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    if (!isScratching || isRevealed) return;

    const currentPt = getCanvasCoords(e.clientX, e.clientY);

    if (lastPointRef.current) {
      eraseLine(
        lastPointRef.current.x,
        lastPointRef.current.y,
        currentPt.x,
        currentPt.y
      );
    } else {
      eraseAt(currentPt.x, currentPt.y);
    }

    lastPointRef.current = currentPt;
    checkScratchPercentage();
  };

  // Unified Pointer Up Handler
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    setIsScratching(false);
    lastPointRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    checkScratchPercentage();
  };

  return (
    <div
      ref={containerRef}
      className={`scratch-card-container mx-auto my-2 w-full max-w-sm relative z-30 select-none ${
        isRevealed ? 'scratch-revealed' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Controls (Never blocks the voucher text!) */}
      <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-cinzel text-amber-950/80 font-bold">
        <div className="flex items-center space-x-1">
          <Gift className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>Secret Gift Voucher</span>
        </div>
        {!isRevealed ? (
          <button
            type="button"
            onClick={revealVoucher}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-800 text-[10px] font-sans font-semibold border border-rose-400/40 transition active:scale-95 cursor-pointer shadow-xs"
            title="Click to instantly auto-reveal the secret"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>Auto Reveal</span>
            <Wand2 className="w-2.5 h-2.5 text-rose-600" />
          </button>
        ) : (
          <span className="flex items-center space-x-1 text-emerald-700 text-[10px] font-sans font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Revealed!</span>
          </span>
        )}
      </div>

      {/* Scratch Box */}
      <div className="scratch-card-box relative rounded-xl border-2 border-amber-300/80 shadow-md overflow-hidden bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 p-3 text-center min-h-[64px] sm:min-h-[72px] flex flex-col justify-center items-center">
        {/* Secret Voucher Message Underneath (Completely visible and unblocked) */}
        <div className="scratch-secret-content w-full px-1 relative z-0">
          <p className="font-handwriting text-base sm:text-lg text-amber-950 font-bold leading-snug tracking-wide select-text drop-shadow-xs">
            {secretMessage}
          </p>
        </div>

        {/* Scratchable Gold Canvas Foil (Only overlays when not revealed) */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            className="scratch-canvas absolute inset-0 w-full h-full touch-none cursor-crosshair z-10"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        )}
      </div>

      {/* Progress Helper Line (Optional subtle indicator) */}
      {!isRevealed && scratchProgress > 0 && (
        <div className="mt-1 flex items-center justify-center space-x-1 text-[10px] text-amber-900/60 font-serif italic">
          <span>Scratching... {scratchProgress}%</span>
        </div>
      )}
    </div>
  );
};
