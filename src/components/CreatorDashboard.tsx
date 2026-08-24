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
} from 'lucide-react';
import { AppData, PhotoMemory, LetterPage, DEFAULT_DATA, DEFAULT_PAGES, DEFAULT_PHOTOS } from '../types';
import { generateShareUrl } from '../utils/urlEncoder';
import { initAudio, playTone, playTriumphChime } from '../utils/audio';

interface CreatorDashboardProps {
  initialData: AppData;
  onSaveAndPreview: (data: AppData) => void;
  onEnterViewerMode: (data: AppData) => void;
}

const TEMPLATE_PRESETS = [
  {
    name: '🌟 Heartfelt & Meaningful',
    pages: [
      {
        id: 'p1',
        title: 'A Celebration of You',
        content: `Today is all about celebrating you — the light, warmth, and endless joy you bring into the world.\n\nFrom the quiet conversations to the unforgettable adventures, every memory shared with you is a treasure that glows brighter with time.\n\nMay this special day bring you as much happiness as you selflessly give to everyone around you.`,
      },
      {
        id: 'p2',
        title: 'Wishes & Dreams',
        content: `As you blow out your candles, I wish for every dream you carry in your heart to find its wings this year.\n\nMay you be surrounded by deep laughter, peaceful mornings, thrilling new journeys, and people who love you unconditionally.`,
      },
      {
        id: 'p3',
        title: 'Forever Cherished',
        content: `Here's to another year of making memories, chasing sunsets, and celebrating the wonderful soul you are!\n\nHappy Birthday! May every second of today be filled with pure magic and sweet surprises. 🎂✨`,
      },
    ],
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
];

const CURATED_IMAGE_SETS = [
  {
    name: 'Festive Celebration',
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop',
        caption: 'Birthday Confetti ✨',
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
        caption: 'Sweet Celebrations 🍰',
      },
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
        caption: 'Pure Joy & Laughter 🥂',
      },
      {
        id: 'photo-4',
        url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop',
        caption: 'Forever Cherished 💖',
      },
    ],
  },
  {
    name: 'Golden Elegance',
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        caption: 'Midnight Sparklers ✨',
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=600&auto=format&fit=crop',
        caption: 'Golden Glow 🌟',
      },
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?q=80&w=600&auto=format&fit=crop',
        caption: 'Special Memories 📸',
      },
      {
        id: 'photo-4',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop',
        caption: 'Best Times Together 💕',
      },
    ],
  },
];

function toLocalISOString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  initialData,
  onSaveAndPreview,
  onEnterViewerMode,
}) => {
  // Form States
  const [recipient, setRecipient] = useState(initialData.recipient || 'Birthday Star');
  const [date, setDate] = useState(initialData.date || 'August 25, 2026');
  const [signature, setSignature] = useState(initialData.signature || 'With all my love ❤️');

  // Birthday Countdown Lock State
  const [countdownEnabled, setCountdownEnabled] = useState(
    Boolean(initialData.countdownEnabled)
  );
  const [countdownTarget, setCountdownTarget] = useState(() => {
    if (initialData.countdownTarget) return initialData.countdownTarget;
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(0, 0, 0, 0);
    return toLocalISOString(defaultDate);
  });

  // Letter Pages
  const [pages, setPages] = useState<LetterPage[]>(
    initialData.pages && initialData.pages.length > 0 ? initialData.pages : DEFAULT_PAGES
  );

  // 4 Image URLs
  const [photos, setPhotos] = useState<PhotoMemory[]>(() => {
    const existing = initialData.photos || [];
    const fullList: PhotoMemory[] = [];
    for (let i = 0; i < 4; i++) {
      fullList.push(
        existing[i] ||
          DEFAULT_PHOTOS[i] || {
            id: `photo-${i + 1}`,
            url: '',
            caption: `Memory #${i + 1}`,
          }
      );
    }
    return fullList;
  });

  // Password / Riddle Lock State
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(
    Boolean(initialData.secretPassword && initialData.secretPassword.trim().length > 0)
  );
  const [secretPassword, setSecretPassword] = useState(initialData.secretPassword || '');
  const [riddlePrompt, setRiddlePrompt] = useState(initialData.riddlePrompt || '');

  // Scratch Card & Gift Video
  const [secretMessage, setSecretMessage] = useState(
    initialData.secretMessage || '🎁 Secret Gift: Dinner & Cocktails on me! Code: BDAY-VIP ✨'
  );
  const [giftBoxEnabled, setGiftBoxEnabled] = useState(initialData.giftBoxEnabled !== false);
  const [giftVideoUrl, setGiftVideoUrl] = useState(
    initialData.giftVideoUrl || DEFAULT_DATA.giftVideoUrl || ''
  );
  const [giftVideoTitle, setGiftVideoTitle] = useState(
    initialData.giftVideoTitle || DEFAULT_DATA.giftVideoTitle || ''
  );
  const [giftVideoMessage, setGiftVideoMessage] = useState(
    initialData.giftVideoMessage || DEFAULT_DATA.giftVideoMessage || ''
  );

  // Generated Link State
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Helper to compile data object
  const buildCurrentData = (): AppData => {
    return {
      ...initialData,
      recipient: recipient.trim() || 'Birthday Star',
      date: date.trim() || 'Today',
      signature: signature.trim() || 'With love ❤️',
      countdownEnabled,
      countdownTarget: countdownEnabled ? countdownTarget : '',
      pages: pages.filter((p) => p.content.trim().length > 0),
      photos: photos.map((p, idx) => ({
        id: p.id || `photo-${idx + 1}`,
        url: p.url.trim() || DEFAULT_PHOTOS[idx]?.url || '',
        caption: p.caption.trim() || `Memory #${idx + 1}`,
      })),
      secretPassword: isPasswordEnabled ? secretPassword.trim() : '',
      riddlePrompt: isPasswordEnabled ? riddlePrompt.trim() : '',
      secretMessage: secretMessage.trim(),
      giftBoxEnabled,
      giftVideoUrl: giftVideoUrl.trim() || DEFAULT_DATA.giftVideoUrl || '',
      giftVideoTitle: giftVideoTitle.trim() || DEFAULT_DATA.giftVideoTitle || '',
      giftVideoMessage: giftVideoMessage.trim() || DEFAULT_DATA.giftVideoMessage || '',
    };
  };

  // Generate Base64 share link
  const handleGenerateLink = () => {
    initAudio();
    const data = buildCurrentData();
    const url = generateShareUrl(data);
    setGeneratedUrl(url);
    setShowShareModal(true);
    playTriumphChime();
  };

  // Copy link
  const handleCopyLink = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      playTone(880, 0.2, 'triangle', 0.1);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Update photo at index
  const updatePhoto = (index: number, field: 'url' | 'caption', value: string) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Page handlers
  const handleAddPage = () => {
    setPages((prev) => [
      ...prev,
      {
        id: `page-${Date.now()}`,
        title: `Page ${prev.length + 1}`,
        content: '',
      },
    ]);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePage = (index: number, field: 'title' | 'content', value: string) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const applyTemplate = (tpl: typeof TEMPLATE_PRESETS[0]) => {
    setPages(tpl.pages);
    playTone(587.33, 0.2, 'sine', 0.1);
  };

  const applyImagePreset = (set: typeof CURATED_IMAGE_SETS[0]) => {
    setPhotos(set.photos);
    playTone(523.25, 0.2, 'sine', 0.1);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-20 selection:bg-rose-500 selection:text-white">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-rose-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header / Branding Bar */}
      <header className="sticky top-0 z-30 bg-stone-900/80 backdrop-blur-xl border-b border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Gift className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-cinzel font-bold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100">
              Birthday Envelope Studio
            </h1>
            <div className="flex items-center space-x-2 text-[10px] text-stone-400">
              <span className="inline-flex items-center text-amber-400 font-semibold">
                <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-400" />
                Creator Mode
              </span>
              <span>•</span>
              <span className="text-stone-400">Base64 Encoded (No Database Needed)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => onSaveAndPreview(buildCurrentData())}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
            title="Preview how the envelope will look"
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Preview Envelope</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateLink}
            className="px-3.5 sm:px-5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-glow-rose transition active:scale-95 cursor-pointer border border-amber-300/40"
          >
            <Link2 className="w-4 h-4" />
            <span>Generate Share Link ✨</span>
          </button>
        </div>
      </header>

      {/* Main Form Dashboard Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8 relative z-10">
        {/* Intro Hero Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-stone-900/70 to-amber-950/30 border border-rose-500/25 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Create an unforgettable digital birthday gift</span>
            </div>
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white">
              Customize Your Envelope, Letter & Secrets
            </h2>
            <p className="text-xs sm:text-sm text-stone-300/80">
              Fill in the details below. When you're ready, click <strong>"Generate Share Link"</strong> to produce a secure, standalone URL containing all your custom photos, letters, passwords, and surprise video!
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateLink}
            className="shrink-0 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span>Get Share Link</span>
          </button>
        </div>

        {/* ================= SECTION 1: RECIPIENT & EVENT DETAILS ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              1. Recipient & Event Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-200/90 mb-1.5">
                Recipient Name / Nickname
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., Sarah, Birthday Star, My Love"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800/80 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/90 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Celebration Date Display</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., August 25, 2026"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800/80 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/90 mb-1.5">
                Letter Sign-off / Signature
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g., With all my love, Alex ❤️"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800/80 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
              />
            </div>
          </div>

          {/* Birthday Countdown Lock Toggle & Date/Time Setting */}
          <div className="mt-4 p-4 rounded-2xl bg-stone-950/80 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hourglass className="w-4 h-4 text-amber-400 animate-pulse" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-amber-200">
                    Lock Envelope Until Recipient's Birthday (Live Countdown)
                  </span>
                  <p className="text-[11px] text-stone-400">
                    When enabled, the recipient strictly cannot open the envelope until the countdown strikes their birthday!
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={countdownEnabled}
                  onChange={(e) => setCountdownEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>

            {countdownEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Birthday Target Date & Time (Unlock Moment)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownTarget}
                    onChange={(e) => setCountdownTarget(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    The envelope automatically unseals the exact second this time arrives.
                  </span>
                </div>

                <div className="flex flex-col justify-end space-y-1">
                  <span className="text-[11px] text-stone-400">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(0, 0, 0, 0);
                        setCountdownTarget(toLocalISOString(d));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] text-amber-200 border border-stone-700 cursor-pointer"
                    >
                      Tomorrow Midnight
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setMinutes(d.getMinutes() + 5);
                        setCountdownTarget(toLocalISOString(d));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] text-stone-300 border border-stone-700 cursor-pointer"
                    >
                      In 5 Minutes (Test)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION 2: STRICT PASSWORD & RIDDLE LOCK ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  2. Strict Password & Riddle Lock (Viewer Mode)
                </h3>
                <p className="text-xs text-stone-400">
                  When enabled, the recipient must enter the exact password or answer the riddle before the envelope appears.
                </p>
              </div>
            </div>

            {/* Enable Lock Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPasswordEnabled}
                onChange={(e) => setIsPasswordEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>

          {isPasswordEnabled ? (
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-amber-500/30 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Secret Password / Answer (Case-Insensitive Match) *</span>
                  </label>
                  <input
                    type="text"
                    value={secretPassword}
                    onChange={(e) => setSecretPassword(e.target.value)}
                    placeholder="e.g. 2026, paris, bff, cupcake"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white font-mono"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Exact string check. Spaces at start/end and letter capitalization will be automatically normalized.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-200/90 mb-1.5 flex items-center space-x-1">
                    <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Optional Riddle / Clue for the Recipient</span>
                  </label>
                  <input
                    type="text"
                    value={riddlePrompt}
                    onChange={(e) => setRiddlePrompt(e.target.value)}
                    placeholder="e.g., Where did we take our favorite road trip?"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Displayed prominently on the lock screen so they know what to type!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800 text-xs text-stone-400">
              🔓 No password required. The recipient will see the envelope directly upon opening the link.
            </div>
          )}
        </section>

        {/* ================= SECTION 3: 4 IMAGE MEMORY URLS ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-800 gap-2">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  3. Four Polaroid Photo Memories
                </h3>
                <p className="text-xs text-stone-400">
                  These 4 photos will unfold around the letter like charming vintage Polaroids. (Strictly read-only on the viewer's side).
                </p>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-stone-400 text-[11px] mr-1">Presets:</span>
              {CURATED_IMAGE_SETS.map((set, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyImagePreset(set)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] border border-stone-700 transition cursor-pointer"
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Image Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                  <span>Photo #{index + 1}</span>
                  <span className="text-[10px] text-stone-500 font-mono">Polaroid {index + 1}/4</span>
                </div>

                <div className="flex gap-3">
                  {/* Real-time Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl bg-stone-800 border border-stone-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-600" />
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={photo.url}
                      onChange={(e) => updatePhoto(index, 'url', e.target.value)}
                      placeholder="https://images.unsplash.com/... or image link"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
                    />
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => updatePhoto(index, 'caption', e.target.value)}
                      placeholder="Caption (e.g. Birthday Smiles ✨)"
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-800/60 border border-stone-700/80 focus:border-amber-400 text-stone-200 placeholder-stone-500 font-serif italic"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: MAIN LETTER TEXT & PAGES ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-800 gap-2">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  4. The Main Letter Text (Pages)
                </h3>
                <p className="text-xs text-stone-400">
                  Write heartfelt multi-page letters with vintage parchment styling.
                </p>
              </div>
            </div>

            {/* Template Selector */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-stone-400 text-[11px] mr-1">Templates:</span>
              {TEMPLATE_PRESETS.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] border border-stone-700 transition cursor-pointer"
                >
                  {tpl.name.split(' ')[1] || tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Pages Editor */}
          <div className="space-y-4">
            {pages.map((page, index) => (
              <div
                key={page.id || index}
                className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-cinzel text-xs font-bold border border-amber-500/20">
                      Page {index + 1}
                    </span>
                    <input
                      type="text"
                      value={page.title || ''}
                      onChange={(e) => handleUpdatePage(index, 'title', e.target.value)}
                      placeholder="Page Header Title (optional)"
                      className="px-2.5 py-1 text-xs rounded-lg bg-stone-800 border border-stone-700 focus:border-amber-400 text-white font-cinzel font-semibold"
                    />
                  </div>

                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePage(index)}
                      className="text-rose-400/80 hover:text-rose-300 p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
                      title="Delete this page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <textarea
                  value={page.content}
                  onChange={(e) => handleUpdatePage(index, 'content', e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800/80 border border-stone-700 focus:border-amber-400 text-white font-serif leading-relaxed"
                />
              </div>
            ))}

            {pages.length < 5 && (
              <button
                type="button"
                onClick={handleAddPage}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-700 hover:border-amber-400/60 hover:bg-stone-900 text-stone-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Page</span>
              </button>
            )}
          </div>
        </section>

        {/* ================= SECTION 5: SURPRISE VIDEO & 3D GIFT BOX ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  5. Surprise Birthday Video (3D Gift Box)
                </h3>
                <p className="text-xs text-stone-400">
                  A 3D wrapped gift box will drop onto the screen. Recipient taps to tear wrapping paper and reveal your video!
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={giftBoxEnabled}
                onChange={(e) => setGiftBoxEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>

          {giftBoxEnabled && (
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-rose-200/90 mb-1">
                  Surprise Video URL (MP4 file, YouTube link, or Vimeo)
                </label>
                <input
                  type="url"
                  value={giftVideoUrl}
                  onChange={(e) => setGiftVideoUrl(e.target.value)}
                  placeholder="https://... (Direct MP4 or https://youtube.com/watch?v=...)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500 font-mono"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setGiftVideoUrl(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                      )
                    }
                    className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] border border-stone-700 cursor-pointer"
                  >
                    Sample MP4 Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setGiftVideoUrl('https://www.youtube.com/watch?v=nl62hhiBMOM')}
                    className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] border border-stone-700 cursor-pointer"
                  >
                    YouTube Birthday Preset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-rose-200/90 mb-1">
                    Surprise Video Title
                  </label>
                  <input
                    type="text"
                    value={giftVideoTitle}
                    onChange={(e) => setGiftVideoTitle(e.target.value)}
                    placeholder="A Special Birthday Video For You 🎥✨"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-200/90 mb-1">
                    Video Note / Special Wish
                  </label>
                  <input
                    type="text"
                    value={giftVideoMessage}
                    onChange={(e) => setGiftVideoMessage(e.target.value)}
                    placeholder="May your day be filled with joy... 💖"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= SECTION 6: SCRATCH CARD VOUCHER ================= */}
        <section className="p-5 sm:p-6 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel text-base font-bold text-amber-200">
              6. Secret Scratch Card Voucher
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-200/90 mb-1.5">
              Secret Message Underneath the Metallic Gold Foil
            </label>
            <input
              type="text"
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              placeholder="e.g., 🎁 Secret Gift: Dinner on me! Code: BDAY-2026"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-800/80 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
            />
          </div>
        </section>

        {/* Bottom Floating Generate Action Bar */}
        <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleGenerateLink}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-cinzel font-bold text-sm sm:text-base tracking-wide flex items-center justify-center space-x-2 shadow-2xl shadow-rose-900/50 border border-amber-300/50 transition active:scale-98 cursor-pointer"
          >
            <Link2 className="w-5 h-5 text-amber-200" />
            <span>Generate Share Link 🎁</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveAndPreview(buildCurrentData())}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm flex items-center justify-center space-x-2 border border-stone-700 transition active:scale-98 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-300" />
            <span>Live Interactive Preview</span>
          </button>
        </div>
      </main>

      {/* ================= GENERATED SHARE LINK POPUP MODAL ================= */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-stone-900 border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg mb-2">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
                Your Shareable Link is Ready! 🎉
              </h3>
              <p className="text-xs text-stone-300">
                Send this standalone link to {recipient}. All your letter pages, photos, password lock, and surprise video are encoded inside this URL.
              </p>
            </div>

            {/* URL Display & Copy Box */}
            <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                <span>Encrypted Share Link</span>
                {isPasswordEnabled && (
                  <span className="text-amber-400 font-semibold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Protected: "{secretPassword}"</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-amber-200 font-mono select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 transition active:scale-95 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Sharing Options */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🎁 Here is a special birthday surprise for you! Open it here: ${generatedUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `🎁 A Special Birthday Surprise for ${recipient}!`
                )}&body=${encodeURIComponent(
                  `I prepared a special digital birthday envelope for you!\n\nOpen your surprise here:\n${generatedUrl}\n\n${
                    isPasswordEnabled && riddlePrompt
                      ? `Hint to unlock: ${riddlePrompt}\n`
                      : ''
                  }`
                )}`}
                className="px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via Email</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  onEnterViewerMode(buildCurrentData());
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                <span>Test in Viewer Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
