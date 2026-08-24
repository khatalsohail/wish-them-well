import React, { useState } from 'react';
import {
  Sparkles,
  Gift,
  Link2,
  Copy,
  Check,
  Eye,
  Lock,
  Image as ImageIcon,
  FileText,
  Calendar,
  Heart,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Wand2,
  RefreshCw,
  Share2,
  HelpCircle,
  Clock,
  Hourglass,
  Layers,
  Smile,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import {
  AppData,
  PhotoMemory,
  LetterPage,
  EnvelopeData,
  DEFAULT_DATA,
  DEFAULT_ENVELOPES,
  DEFAULT_OPEN_NOW_PAGES,
  DEFAULT_STRESSED_PAGES,
  DEFAULT_LAUGH_PAGES,
  DEFAULT_OPEN_NOW_PHOTOS,
  DEFAULT_STRESSED_PHOTOS,
  DEFAULT_LAUGH_PHOTOS,
} from '../types';
import { generateShareUrl } from '../utils/urlEncoder';
import { initAudio, playTone, playTriumphChime } from '../utils/audio';

interface CreatorDashboardProps {
  initialData: AppData;
  onSaveAndPreview: (data: AppData) => void;
  onEnterViewerMode: (data: AppData) => void;
}

const TEMPLATE_PRESETS_BY_CATEGORY = {
  open_now: [
    {
      name: '🌟 Heartfelt & Meaningful',
      pages: DEFAULT_OPEN_NOW_PAGES,
    },
    {
      name: '💖 Romantic & Tender',
      pages: [
        {
          id: 'p1',
          title: 'To My Favorite Person',
          content: `Happy Birthday to the one who makes my world softer, brighter, and infinitely more beautiful.\n\nEvery day with you feels like a gift, but today is the most special because it brought you into this world.`,
        },
        {
          id: 'p2',
          title: 'My Forever Wish',
          content: `I promise to always celebrate your victories, hold your hand through the storms, and remind you every single day how deeply cherished you are.\n\nWith all my love and heart, today and forever. ❤️`,
        },
      ],
    },
    {
      name: '🎉 Best Friend & Fun',
      pages: [
        {
          id: 'p1',
          title: 'Happy Birthday Bestie!',
          content: `Another year hotter, wiser, and slightly more unhinged! 😂\n\nThank you for being the person I can laugh with until my stomach hurts and call at 2 AM with zero judgment.\n\nToday we celebrate YOU!`,
        },
        {
          id: 'p2',
          title: 'Leveling Up!',
          content: `May your day be filled with your favorite food, endless drinks, great music, and zero stress.\n\nGet ready for the best year yet! 🥂✨`,
        },
      ],
    },
  ],
  stressed: [
    {
      name: '🌿 Deep Breath & Reset',
      pages: DEFAULT_STRESSED_PAGES,
    },
    {
      name: '🌊 Gentle Ocean of Peace',
      pages: [
        {
          id: 'p-stress-calm-1',
          title: 'Pause & Ground Yourself',
          content: `Close your eyes for three slow seconds after reading this sentence.\n\nFeel your feet firmly on the ground. You are safe in this present moment.\n\nWhatever is pulling at your energy can wait. Give yourself permission to just be.`,
        },
        {
          id: 'p-stress-calm-2',
          title: 'A Warm Reminder',
          content: `You do not have to carry everything alone.\n\nYou are worthy of rest, gentleness, and peace.\n\nI am always here whenever you need someone to listen, no questions asked. 🤍`,
        },
      ],
    },
  ],
  laugh: [
    {
      name: '😂 Emergency Giggles',
      pages: DEFAULT_LAUGH_PAGES,
    },
    {
      name: '🍕 Unhinged Survival Tips',
      pages: [
        {
          id: 'p-laugh-fun-1',
          title: 'CRITICAL LIFE UPDATE',
          content: `Congratulations on surviving another day without giving someone a piece of your mind in traffic!\n\nYou deserve a gold medal, five tacos, and an uninterrupted 12-hour nap.\n\nNever stop being the absolute riot that you are! 🚀🤪`,
        },
        {
          id: 'p-laugh-fun-2',
          title: 'Free Pass Activated',
          content: `This digital certificate grants you 1x permission to eat ice cream straight out of the tub while wearing sweatpants.\n\nUse wisely (or use right now). 😂🎉`,
        },
      ],
    },
  ],
};

const CURATED_IMAGE_SETS_BY_THEME = {
  celebration: [
    {
      name: 'Festive Celebration',
      photos: DEFAULT_OPEN_NOW_PHOTOS,
    },
    {
      name: 'Golden Elegance',
      photos: [
        {
          id: 'photo-1',
          url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
          caption: 'Golden Lights ✨',
        },
        {
          id: 'photo-2',
          url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=600&auto=format&fit=crop',
          caption: 'Sweet Confetti 🎂',
        },
        {
          id: 'photo-3',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
          caption: 'Unforgettable Joy 🥂',
        },
        {
          id: 'photo-4',
          url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop',
          caption: 'Forever Treasured 💖',
        },
      ],
    },
  ],
  stressed: [
    {
      name: 'Serene Nature & Tranquility',
      photos: DEFAULT_STRESSED_PHOTOS,
    },
  ],
  laugh: [
    {
      name: 'Fun Shenanigans & Laughs',
      photos: DEFAULT_LAUGH_PHOTOS,
    },
  ],
};

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  initialData,
  onSaveAndPreview,
  onEnterViewerMode,
}) => {
  const [data, setData] = useState<AppData>(() => {
    // Ensure envelopes exist
    if (!initialData.envelopes || initialData.envelopes.length === 0) {
      return {
        ...initialData,
        envelopes: DEFAULT_ENVELOPES,
      };
    }
    return initialData;
  });

  const [activeTab, setActiveTab] = useState<'envelopes' | 'security' | 'delivery' | 'share'>('envelopes');
  const [selectedEnvelopeIdx, setSelectedEnvelopeIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [activePageIdx, setActivePageIdx] = useState(0);

  const currentEnvelope: EnvelopeData =
    data.envelopes && data.envelopes[selectedEnvelopeIdx]
      ? data.envelopes[selectedEnvelopeIdx]
      : DEFAULT_ENVELOPES[0];

  const updateEnvelope = (updater: (prev: EnvelopeData) => EnvelopeData) => {
    setData((prev) => {
      const updatedEnvelopes = [...(prev.envelopes || DEFAULT_ENVELOPES)];
      if (updatedEnvelopes[selectedEnvelopeIdx]) {
        updatedEnvelopes[selectedEnvelopeIdx] = updater(updatedEnvelopes[selectedEnvelopeIdx]);
      }
      return {
        ...prev,
        envelopes: updatedEnvelopes,
      };
    });
  };

  const handleCopyLink = async () => {
    initAudio();
    playTriumphChime();
    const url = generateShareUrl(data);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? generateShareUrl(data) : '';

  // Quick preset helper
  const applyPreset = (preset: { name: string; pages: LetterPage[] }) => {
    initAudio();
    playTone(587.33, 0.2, 'sine', 0.1);
    updateEnvelope((prev) => ({
      ...prev,
      pages: preset.pages,
    }));
    setActivePageIdx(0);
  };

  const applyImageSet = (photos: PhotoMemory[]) => {
    initAudio();
    playTone(659.25, 0.2, 'sine', 0.1);
    updateEnvelope((prev) => ({
      ...prev,
      photos,
    }));
  };

  const handlePhotoUpload = (photoIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 450;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);

        updateEnvelope((prev) => {
          const newPhotos = [...(prev.photos || DEFAULT_OPEN_NOW_PHOTOS)];
          if (newPhotos[photoIdx]) {
            newPhotos[photoIdx] = {
              ...newPhotos[photoIdx],
              url: compressedBase64,
            };
          }
          return { ...prev, photos: newPhotos };
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d040a] text-stone-200 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#160612]/90 backdrop-blur-md border-b border-rose-950/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-700 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#160612] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-100 to-rose-100">
              "Open When" Keepsake Studio
            </h1>
            <p className="text-[11px] text-stone-400 font-sans">
              Create a personalized 3-Envelope stack with dynamic themes & live URL sharing
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => onSaveAndPreview(data)}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-cinzel text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-md"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Preview Experience</span>
            <span className="sm:hidden">Preview</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 sm:px-5 py-2 rounded-xl font-cinzel text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
              copied
                ? 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-900/50'
                : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white border border-amber-300/40 shadow-rose-950/60'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Link Copied! ✨</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-200" />
                <span>Copy Share Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-rose-950/80 pb-3 overflow-x-auto gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('envelopes')}
              className={`px-4 py-2 rounded-xl font-cinzel text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'envelopes'
                  ? 'bg-rose-900/60 text-amber-200 border border-rose-400/40 shadow-lg'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>1. Multi-Envelope Stack (3 Envelopes)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl font-cinzel text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-rose-900/60 text-amber-200 border border-rose-400/40 shadow-lg'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>2. Birthday Countdown & Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`px-4 py-2 rounded-xl font-cinzel text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-rose-900/60 text-amber-200 border border-rose-400/40 shadow-lg'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>3. Recipient & Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-xl font-cinzel text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'share'
                  ? 'bg-rose-900/60 text-amber-200 border border-rose-400/40 shadow-lg'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>4. Share & QR</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MULTI-ENVELOPE "OPEN WHEN" SYSTEM */}
        {activeTab === 'envelopes' && (
          <div className="space-y-6">
            {/* The 3 Envelope Selector Tabs */}
            <div className="bg-[#180814] rounded-2xl border border-rose-950/80 p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-cinzel text-base sm:text-lg font-bold text-amber-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Select Envelope to Customize</span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    Each envelope has its own unique mood, letter pages, photos, secret gift, and dynamic theme animations.
                  </p>
                </div>

                <div className="flex items-center space-x-1 text-xs text-amber-300/80 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
                  <span>✨ 3 Distinct Themes Active</span>
                </div>
              </div>

              {/* 3 Envelope Card Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.envelopes || DEFAULT_ENVELOPES).map((env, idx) => {
                  const isSelected = selectedEnvelopeIdx === idx;
                  const themeStyle =
                    env.theme === 'stressed'
                      ? {
                          border: isSelected ? 'border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.4)]' : 'border-teal-900/50 hover:border-teal-500/50',
                          bg: isSelected ? 'bg-gradient-to-b from-[#163844] to-[#0f242e]' : 'bg-[#10232b]/60',
                          badge: 'bg-teal-950 border-teal-500/40 text-teal-200',
                          icon: <Coffee className="w-4 h-4 text-teal-300" />,
                          tag: 'Calm & Zen 🌿',
                        }
                      : env.theme === 'laugh'
                      ? {
                          border: isSelected ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-amber-900/50 hover:border-amber-500/50',
                          bg: isSelected ? 'bg-gradient-to-b from-[#421d09] to-[#250d03]' : 'bg-[#291104]/60',
                          badge: 'bg-amber-950 border-amber-500/40 text-amber-200',
                          icon: <Smile className="w-4 h-4 text-amber-300" />,
                          tag: 'Comedy & LOL 😂',
                        }
                      : {
                          border: isSelected ? 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-rose-900/50 hover:border-rose-500/50',
                          bg: isSelected ? 'bg-gradient-to-b from-[#3d1220] to-[#220710]' : 'bg-[#220912]/60',
                          badge: 'bg-rose-950 border-rose-500/40 text-rose-200',
                          icon: <Sparkles className="w-4 h-4 text-rose-300" />,
                          tag: 'Celebration 🎂',
                        };

                  return (
                    <div
                      key={env.id || idx}
                      onClick={() => {
                        setSelectedEnvelopeIdx(idx);
                        setActivePageIdx(0);
                        initAudio();
                        playTone(523.25 + idx * 100, 0.15, 'sine', 0.1);
                      }}
                      className={`p-4 rounded-2xl border-2 ${themeStyle.border} ${themeStyle.bg} cursor-pointer transition-all duration-300 relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${themeStyle.badge}`}>
                          Envelope {idx + 1}
                        </span>
                        <span className="text-xs text-stone-300">{themeStyle.tag}</span>
                      </div>

                      <div className="flex items-center space-x-2 font-cinzel font-bold text-sm text-white">
                        {themeStyle.icon}
                        <span>{env.label}</span>
                      </div>

                      <p className="text-xs text-stone-400 font-serif italic mt-1 line-clamp-1">
                        {env.subtitle || 'Custom envelope keepsake'}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-white/10">
                        <span>{env.pages?.length || 1} Pages</span>
                        <span>{env.photos?.length || 4} Photos</span>
                        {isSelected && (
                          <span className="text-amber-300 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Editing</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Envelope Customizer Card */}
            <div className="bg-[#180814] rounded-2xl border border-rose-950/80 p-5 sm:p-7 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-950 gap-3">
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 flex items-center space-x-2">
                    <span>Editing: {currentEnvelope.label}</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Theme: <span className="font-semibold text-rose-300 uppercase">{currentEnvelope.theme}</span> • All updates sync live into your shareable link.
                  </p>
                </div>

                {/* Quick Theme Presets */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-400">Apply Preset:</span>
                  {(
                    TEMPLATE_PRESETS_BY_CATEGORY[currentEnvelope.category as keyof typeof TEMPLATE_PRESETS_BY_CATEGORY] ||
                    TEMPLATE_PRESETS_BY_CATEGORY.open_now
                  ).map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-stone-200 transition active:scale-95"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Envelope Header Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                    Envelope Label
                  </label>
                  <input
                    type="text"
                    value={currentEnvelope.label}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({ ...prev, label: e.target.value }))
                    }
                    placeholder="e.g. Open When You're Stressed"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                    Envelope Subtitle / Vibe
                  </label>
                  <input
                    type="text"
                    value={currentEnvelope.subtitle || ''}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="e.g. A Calming Escape & Warm Hug 🌿"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400/80"
                  />
                </div>
              </div>

              {/* Wax Seal Text & Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                    Wax Seal Text
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={currentEnvelope.sealText || ''}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({ ...prev, sealText: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. FOR YOU / BREATHE / LOL"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-cinzel text-sm focus:outline-none focus:border-amber-400/80 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                    Wax Seal Icon Symbol
                  </label>
                  <select
                    value={currentEnvelope.sealSymbol || 'sparkles'}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({
                        ...prev,
                        sealSymbol: e.target.value as EnvelopeData['sealSymbol'],
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400/80"
                  >
                    <option value="sparkles">✨ Sparkles (Classic)</option>
                    <option value="lotus">🌿 Lotus Blossom (Calming)</option>
                    <option value="laugh">😂 Laugh Smiley (Funny)</option>
                    <option value="heart">💖 Heart (Romantic)</option>
                    <option value="cake">🎂 Birthday Cake</option>
                    <option value="star">⭐ Shining Star</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                    Theme / Atmosphere Mood
                  </label>
                  <select
                    value={currentEnvelope.theme}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({
                        ...prev,
                        theme: e.target.value as EnvelopeData['theme'],
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400/80"
                  >
                    <option value="celebration">🎂 Celebration (Gold & Burgundy)</option>
                    <option value="stressed">🌿 Stressed (Calming Zen Ocean Teal)</option>
                    <option value="laugh">😂 Laugh (Chaotic Confetti & Electric Neon)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Page Letter Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-cinzel font-bold text-amber-200 uppercase flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Letter Pages ({currentEnvelope.pages?.length || 1} Total)</span>
                  </label>

                  {/* Add Page Button */}
                  {(currentEnvelope.pages?.length || 0) < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        updateEnvelope((prev) => {
                          const newPages = [
                            ...(prev.pages || DEFAULT_OPEN_NOW_PAGES),
                            {
                              id: `p-${Date.now()}`,
                              title: `Chapter ${(prev.pages?.length || 0) + 1}`,
                              content: 'Write your heartfelt message here...',
                            },
                          ];
                          return { ...prev, pages: newPages };
                        });
                        setActivePageIdx((currentEnvelope.pages?.length || 0));
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/40 text-xs font-cinzel text-amber-200 flex items-center space-x-1 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Page</span>
                    </button>
                  )}
                </div>

                {/* Page Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {(currentEnvelope.pages || []).map((page, pIdx) => (
                    <button
                      key={page.id || pIdx}
                      type="button"
                      onClick={() => setActivePageIdx(pIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition active:scale-95 flex items-center space-x-1.5 ${
                        activePageIdx === pIdx
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                          : 'bg-white/10 text-stone-300 hover:bg-white/15'
                      }`}
                    >
                      <span>Page {pIdx + 1}</span>
                      {(currentEnvelope.pages?.length || 0) > 1 && (
                        <Trash2
                          className="w-3 h-3 hover:text-rose-700 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEnvelope((prev) => {
                              const newPages = prev.pages.filter((_, i) => i !== pIdx);
                              return { ...prev, pages: newPages };
                            });
                            setActivePageIdx(0);
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Active Page Textarea */}
                {currentEnvelope.pages && currentEnvelope.pages[activePageIdx] && (
                  <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-rose-950">
                    <input
                      type="text"
                      value={currentEnvelope.pages[activePageIdx].title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateEnvelope((prev) => {
                          const newPages = [...prev.pages];
                          newPages[activePageIdx] = { ...newPages[activePageIdx], title: val };
                          return { ...prev, pages: newPages };
                        });
                      }}
                      placeholder="Page Title (e.g. Chapter 1 / A Celebration of You)"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-amber-200 font-serif text-sm focus:outline-none focus:border-amber-400"
                    />

                    <textarea
                      rows={6}
                      value={currentEnvelope.pages[activePageIdx].content}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateEnvelope((prev) => {
                          const newPages = [...prev.pages];
                          newPages[activePageIdx] = { ...newPages[activePageIdx], content: val };
                          return { ...prev, pages: newPages };
                        });
                      }}
                      placeholder="Type your message here..."
                      className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-stone-100 font-sans text-sm focus:outline-none focus:border-amber-400 leading-relaxed resize-y"
                    />
                  </div>
                )}
              </div>

              {/* 4 Polaroid Photo Memories */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-cinzel font-bold text-amber-200 uppercase flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>4 Polaroid Photo Memories For This Envelope</span>
                  </label>

                  {/* Preset photo themes */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-stone-400">Photo Presets:</span>
                    {(
                      CURATED_IMAGE_SETS_BY_THEME[currentEnvelope.theme as keyof typeof CURATED_IMAGE_SETS_BY_THEME] ||
                      CURATED_IMAGE_SETS_BY_THEME.celebration
                    ).map((set, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => applyImageSet(set.photos)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] text-stone-200 transition"
                      >
                        {set.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(currentEnvelope.photos || DEFAULT_OPEN_NOW_PHOTOS).slice(0, 4).map((photo, pIdx) => (
                    <div
                      key={photo.id || pIdx}
                      className="p-3 bg-black/40 rounded-xl border border-rose-950 flex flex-col items-center space-y-2"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-stone-900 group">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                          <ImageIcon className="w-5 h-5 text-amber-300 mb-1" />
                          <span className="text-[10px] font-cinzel font-bold text-white">Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(pIdx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateEnvelope((prev) => {
                            const newPhotos = [...(prev.photos || DEFAULT_OPEN_NOW_PHOTOS)];
                            if (newPhotos[pIdx]) {
                              newPhotos[pIdx] = { ...newPhotos[pIdx], caption: val };
                            }
                            return { ...prev, photos: newPhotos };
                          });
                        }}
                        placeholder="Photo Caption"
                        className="w-full px-2 py-1 text-center bg-black/60 rounded border border-white/10 text-xs text-amber-200 font-serif"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Secret Scratch Card & Gift Box Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Secret Scratch-Off Card Voucher</span>
                  </label>
                  <input
                    type="text"
                    value={currentEnvelope.secretMessage || ''}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({ ...prev, secretMessage: e.target.value }))
                    }
                    placeholder="e.g. 🎁 Secret Gift: Dinner & Cocktails on me! Code: BDAY-VIP"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-cinzel font-bold text-stone-300 uppercase flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Envelope Sign-off</span>
                  </label>
                  <input
                    type="text"
                    value={currentEnvelope.signature || ''}
                    onChange={(e) =>
                      updateEnvelope((prev) => ({ ...prev, signature: e.target.value }))
                    }
                    placeholder="e.g. With all my love ❤️"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-cursive text-lg focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Virtual 3D Gift Box Video Option */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 to-amber-950/30 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="font-cinzel text-xs font-bold text-amber-200 uppercase">
                      3D Gift Box Surprise Video For This Envelope
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentEnvelope.giftBoxEnabled !== false}
                      onChange={(e) =>
                        updateEnvelope((prev) => ({ ...prev, giftBoxEnabled: e.target.checked }))
                      }
                      className="rounded accent-amber-500"
                    />
                    <span className="text-xs text-stone-300 font-sans">Enable 3D Box</span>
                  </label>
                </div>

                {currentEnvelope.giftBoxEnabled !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <input
                      type="text"
                      value={currentEnvelope.giftVideoUrl || ''}
                      onChange={(e) =>
                        updateEnvelope((prev) => ({ ...prev, giftVideoUrl: e.target.value }))
                      }
                      placeholder="Video URL (MP4 / WebM / Stream link)"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={currentEnvelope.giftVideoTitle || ''}
                      onChange={(e) =>
                        updateEnvelope((prev) => ({ ...prev, giftVideoTitle: e.target.value }))
                      }
                      placeholder="Surprise Video Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BIRTHDAY COUNTDOWN & PASSWORD */}
        {activeTab === 'security' && (
          <div className="bg-[#180814] rounded-2xl border border-rose-950/80 p-5 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Strict Birthday Countdown & Password Lock</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Prevent the recipient from unsealing until their birthday or until they solve a private riddle!
              </p>
            </div>

            {/* Countdown Configuration */}
            <div className="p-5 rounded-2xl bg-black/40 border border-rose-950 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-cinzel text-sm font-bold text-amber-100 uppercase">
                    Strict Birthday Countdown Lock
                  </span>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.countdownEnabled}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, countdownEnabled: e.target.checked }))
                    }
                    className="rounded accent-amber-500"
                  />
                  <span className="text-xs text-amber-300 font-semibold">Enable Lock</span>
                </label>
              </div>

              {data.countdownEnabled && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-stone-300 font-sans">
                    When active, the viewer will be shown a strict live countdown timer and cannot open any envelope until the timer hits 00:00:00.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      value={data.countdownTarget || ''}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, countdownTarget: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-rose-900 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                    />

                    {/* Quick Presets */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const tmrw = new Date();
                          tmrw.setDate(tmrw.getDate() + 1);
                          tmrw.setHours(0, 0, 0, 0);
                          setData((prev) => ({
                            ...prev,
                            countdownTarget: tmrw.toISOString().slice(0, 16),
                          }));
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-stone-200 border border-white/15 transition active:scale-95"
                      >
                        Tomorrow Midnight
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const fiveMin = new Date(Date.now() + 5 * 60 * 1000);
                          setData((prev) => ({
                            ...prev,
                            countdownTarget: fiveMin.toISOString().slice(0, 16),
                          }));
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-stone-200 border border-white/15 transition active:scale-95"
                      >
                        In 5 Mins (Demo)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password / Riddle Configuration */}
            <div className="p-5 rounded-2xl bg-black/40 border border-rose-950 space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-sm font-bold text-amber-100 uppercase">
                  Secret Password & Riddle Prompt (Optional)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-stone-300 font-cinzel uppercase">
                    Secret Passcode (Case-Insensitive)
                  </label>
                  <input
                    type="text"
                    value={data.secretPassword || ''}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, secretPassword: e.target.value }))
                    }
                    placeholder="e.g. PARIS2026 or BESTIE"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-rose-900 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-300 font-cinzel uppercase">
                    Riddle Clue / Question
                  </label>
                  <input
                    type="text"
                    value={data.riddlePrompt || ''}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, riddlePrompt: e.target.value }))
                    }
                    placeholder="e.g. Where did we have our favorite coffee?"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-rose-900 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECIPIENT & DETAILS */}
        {activeTab === 'delivery' && (
          <div className="bg-[#180814] rounded-2xl border border-rose-950/80 p-5 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>Recipient & Atmosphere Settings</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Personalize recipient name and visual reading effects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={data.recipient}
                  onChange={(e) => setData((prev) => ({ ...prev, recipient: e.target.value }))}
                  placeholder="e.g. Sarah / Alex / Birthday Star"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-cinzel font-bold text-stone-300 uppercase">
                  Display Date
                </label>
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => setData((prev) => ({ ...prev, date: e.target.value }))}
                  placeholder="e.g. August 25, 2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-rose-900/50 text-white font-sans text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Typewriter Effect Toggle */}
            <div className="p-4 rounded-xl bg-black/40 border border-rose-950 flex items-center justify-between">
              <div>
                <span className="font-cinzel text-sm font-bold text-stone-200">
                  Typewriter Acoustic Animation
                </span>
                <p className="text-xs text-stone-400">
                  Letters reveal character-by-character with tactile mechanical click sounds.
                </p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.typewriterEnabled !== false}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, typewriterEnabled: e.target.checked }))
                  }
                  className="rounded accent-amber-500"
                />
                <span className="text-xs text-stone-300">Enabled</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: SHARE & QR */}
        {activeTab === 'share' && (
          <div className="bg-[#180814] rounded-2xl border border-rose-950/80 p-5 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 flex items-center space-x-2">
                <Link2 className="w-5 h-5 text-amber-400" />
                <span>Your Shareable Gift URL</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                This single link holds all 3 envelopes, custom photos, dynamic themes, and locks. Send it to your recipient over WhatsApp, iMessage, or email!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="font-mono text-xs text-amber-200 break-all select-all flex-1 line-clamp-2">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 text-white font-cinzel text-xs font-bold flex items-center space-x-2 transition active:scale-95 whitespace-nowrap cursor-pointer shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-amber-200" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => onEnterViewerMode(data)}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-cinzel text-sm font-bold flex items-center space-x-2 transition active:scale-95 cursor-pointer shadow-lg"
              >
                <ExternalLink className="w-4 h-4 text-amber-300" />
                <span>Open in Viewer Mode</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
