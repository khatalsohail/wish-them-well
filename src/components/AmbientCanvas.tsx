import React, { useEffect, useRef } from 'react';
import { EnvelopeTheme } from '../types';

interface AmbientCanvasProps {
  theme?: EnvelopeTheme;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ theme = 'celebration' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isStressed = theme === 'stressed';
    const isLaugh = theme === 'laugh';

    const particleCount = Math.min(width < 640 ? 30 : 65, isLaugh ? 80 : 70);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: isStressed
        ? Math.random() * 3.5 + 1.5
        : Math.random() * 2.5 + 1,
      speedY: isStressed
        ? -(Math.random() * 0.15 + 0.05) // Ultra gentle floating for stressed
        : isLaugh
        ? -(Math.random() * 0.6 + 0.3) // Bouncy, lively for laugh
        : -(Math.random() * 0.35 + 0.15),
      speedX: isStressed
        ? (Math.random() - 0.5) * 0.15
        : isLaugh
        ? (Math.random() - 0.5) * 0.5
        : (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.7 + 0.2,
      twinkle: isStressed ? Math.random() * 0.01 + 0.003 : Math.random() * 0.03 + 0.008,
      specialType: isStressed
        ? Math.random() > 0.85
          ? 'ripple'
          : 'zen'
        : isLaugh
        ? Math.random() > 0.8
          ? 'emoji'
          : 'sparkle'
        : Math.random() > 0.82
        ? 'heart'
        : 'gold',
    }));

    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.scale(size / 10, size / 10);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-5, -5, -10, 2, 0, 10);
      ctx.bezierCurveTo(10, 2, 5, -5, 0, 0);
      ctx.fillStyle = `rgba(244, 114, 182, ${opacity * 0.55})`;
      ctx.fill();
      ctx.restore();
    };

    const drawZenRipple = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(153, 246, 228, ${opacity * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 243, 208, ${opacity * 0.6})`;
      ctx.fill();
      ctx.restore();
    };

    const emojis = ['😂', '🎉', '🤪', '✨', '🍕'];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(Date.now() * p.twinkle + idx) * 0.01;

        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const alpha = Math.max(0.1, Math.min(0.85, p.opacity));

        if (isStressed) {
          if (p.specialType === 'ripple') {
            drawZenRipple(p.x, p.y, p.size, alpha);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.6})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(45, 212, 191, 0.6)';
            ctx.fill();
          }
        } else if (isLaugh) {
          if (p.specialType === 'emoji') {
            ctx.save();
            ctx.font = `${Math.round(p.size * 5 + 8)}px sans-serif`;
            ctx.globalAlpha = alpha * 0.75;
            ctx.fillText(emojis[idx % emojis.length], p.x, p.y);
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = idx % 2 === 0 ? `rgba(250, 204, 21, ${alpha * 0.85})` : `rgba(244, 63, 94, ${alpha * 0.85})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
            ctx.fill();
          }
        } else {
          // Celebration
          if (p.specialType === 'heart') {
            drawHeart(p.x, p.y, p.size * 3.5, alpha);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.75})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(251, 191, 36, 0.75)';
            ctx.fill();
          }
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  // Orb theme colors
  const orbClasses =
    theme === 'stressed'
      ? {
          orb1: 'orb-stressed-1',
          orb2: 'orb-stressed-2',
          orb3: 'orb-stressed-3',
        }
      : theme === 'laugh'
      ? {
          orb1: 'orb-laugh-1',
          orb2: 'orb-laugh-2',
          orb3: 'orb-laugh-3',
        }
      : {
          orb1: 'orb-1',
          orb2: 'orb-2',
          orb3: 'orb-3',
        };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-1000">
      <canvas ref={canvasRef} className="fixed inset-0" />
      <div className={`ambient-orb ${orbClasses.orb1} transition-all duration-1000`} />
      <div className={`ambient-orb ${orbClasses.orb2} transition-all duration-1000`} />
      <div className={`ambient-orb ${orbClasses.orb3} transition-all duration-1000`} />
    </div>
  );
};
