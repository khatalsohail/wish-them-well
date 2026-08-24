import React, { useState } from 'react';
import {
  Wand2,
  X,
  Plus,
  Trash2,
  Upload,
  Timer,
  BookOpen,
  SplitSquareVertical,
  Check,
  Gift,
  Film,
  Video,
} from 'lucide-react';
import { AppData, LetterPage, PhotoMemory, DEFAULT_DATA } from '../types';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onSave: (newData: AppData) => void;
  onReset: () => void;
  onTestDemoCountdown: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  appData,
  onSave,
  onReset,
  onTestDemoCountdown,
}) => {
  const [recipient, setRecipient] = useState(appData.recipient);
  const [date, setDate] = useState(appData.date);
  const [signature, setSignature] = useState(appData.signature);
  const [secretMessage, setSecretMessage] = useState(appData.secretMessage);
  const [countdownEnabled, setCountdownEnabled] = useState(appData.countdownEnabled);
  const [countdownTarget, setCountdownTarget] = useState(
    appData.countdownTarget || getDefaultCountdownTarget()
  );
  const [typewriterEnabled, setTypewriterEnabled] = useState(
    appData.typewriterEnabled !== false
  );
  const [giftBoxEnabled, setGiftBoxEnabled] = useState(
    appData.giftBoxEnabled !== false
  );
  const [giftVideoUrl, setGiftVideoUrl] = useState(
    appData.giftVideoUrl || DEFAULT_DATA.giftVideoUrl || ''
  );
  const [giftVideoTitle, setGiftVideoTitle] = useState(
    appData.giftVideoTitle || DEFAULT_DATA.giftVideoTitle || ''
  );
  const [giftVideoMessage, setGiftVideoMessage] = useState(
    appData.giftVideoMessage || DEFAULT_DATA.giftVideoMessage || ''
  );

  const [pages, setPages] = useState<LetterPage[]>(
    appData.pages && appData.pages.length > 0
      ? JSON.parse(JSON.stringify(appData.pages))
      : JSON.parse(JSON.stringify(DEFAULT_DATA.pages))
  );
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  const [photos, setPhotos] = useState<PhotoMemory[]>(
    appData.photos && appData.photos.length > 0
      ? JSON.parse(JSON.stringify(appData.photos))
      : JSON.parse(JSON.stringify(DEFAULT_DATA.photos))
  );

  function getDefaultCountdownTarget() {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(0, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  // Handle page text edits
  const handlePageContentChange = (idx: number, content: string) => {
    const next = [...pages];
    next[idx] = { ...next[idx], content };
    setPages(next);
  };

  const handlePageTitleChange = (idx: number, title: string) => {
    const next = [...pages];
    next[idx] = { ...next[idx], title };
    setPages(next);
  };

  const handleAddPage = () => {
    const newPageNum = pages.length + 1;
    const newPage: LetterPage = {
      id: `page-${Date.now()}`,
      title: `Chapter ${newPageNum}`,
      content: `Here are more heartfelt thoughts and wishes for your special year ahead... ✨`,
    };
    setPages([...pages, newPage]);
    setSelectedPageIndex(pages.length);
  };

  const handleDeletePage = (idx: number) => {
    if (pages.length <= 1) return;
    const next = pages.filter((_, i) => i !== idx);
    setPages(next);
    setSelectedPageIndex(Math.max(0, idx - 1));
  };

  // Smart Split: automatically splits long text by paragraphs into balanced pages
  const handleSmartSplit = () => {
    const allText = pages.map((p) => p.content).join('\n\n');
    const paragraphs = allText.split('\n\n').filter(Boolean);
    if (paragraphs.length <= 2) {
      alert('Your letter is short enough to fit nicely. Add more paragraphs to split!');
      return;
    }

    const chunkSize = Math.ceil(paragraphs.length / 3);
    const newPages: LetterPage[] = [];

    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const chunk = paragraphs.slice(i, i + chunkSize).join('\n\n');
      const pageIndex = Math.floor(i / chunkSize);
      newPages.push({
        id: `page-${pageIndex + 1}-${Date.now()}`,
        title:
          pageIndex === 0
            ? 'A Celebration of You'
            : pageIndex === 1
            ? 'Wishes & Dreams'
            : 'Magic & Memories',
        content: chunk,
      });
    }

    setPages(newPages);
    setSelectedPageIndex(0);
  };

  const handlePhotoUpload = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          const nextPhotos = [...photos];
          nextPhotos[slotIndex] = {
            ...nextPhotos[slotIndex],
            url: compressed,
          };
          setPhotos(nextPhotos);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleCaptionChange = (slotIndex: number, caption: string) => {
    const nextPhotos = [...photos];
    nextPhotos[slotIndex] = {
      ...nextPhotos[slotIndex],
      caption,
    };
    setPhotos(nextPhotos);
  };

  const handleSave = () => {
    const updated: AppData = {
      recipient: recipient.trim() || DEFAULT_DATA.recipient,
      date: date.trim() || DEFAULT_DATA.date,
      signature: signature.trim() || DEFAULT_DATA.signature,
      secretMessage: secretMessage.trim() || DEFAULT_DATA.secretMessage,
      countdownEnabled,
      countdownTarget: countdownTarget || getDefaultCountdownTarget(),
      typewriterEnabled,
      giftBoxEnabled,
      giftVideoUrl: giftVideoUrl.trim() || DEFAULT_DATA.giftVideoUrl || '',
      giftVideoTitle: giftVideoTitle.trim() || DEFAULT_DATA.giftVideoTitle || '',
      giftVideoMessage: giftVideoMessage.trim() || DEFAULT_DATA.giftVideoMessage || '',
      pages: pages.filter((p) => p.content.trim().length > 0),
      photos,
    };

    onSave(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md transition-all">
      <div className="modal-card w-full max-w-2xl max-h-[92vh] flex flex-col bg-stone-900/95 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-rose-100">
                Personalize Your Birthday Letter
              </h3>
              <p className="text-xs text-stone-400">
                Manage pages, text, photos, and secret gifts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-6 text-sm">
          {/* Recipient & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                placeholder="e.g. Sarah, Alex..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5">
                Celebration Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                placeholder="e.g. August 25, 2026"
              />
            </div>
          </div>

          {/* ================= MULTI-PAGE LETTER SECTION ================= */}
          <div className="border border-rose-900/40 rounded-xl bg-stone-950/40 p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Letter Pages ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSmartSplit}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium border border-amber-500/30 flex items-center space-x-1 transition cursor-pointer"
                  title="Auto-split into aesthetic pages"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Smart Split</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddPage}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Page</span>
                </button>
              </div>
            </div>

            {/* Page Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {pages.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                    selectedPageIndex === idx
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span>Page {idx + 1}</span>
                  {pages.length > 1 && selectedPageIndex === idx && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(idx);
                      }}
                      className="ml-1 text-rose-200 hover:text-white"
                      title="Delete page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Page Editor */}
            {pages[selectedPageIndex] && (
              <div className="space-y-2 pt-1">
                {selectedPageIndex > 0 && (
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Page Subtitle / Heading
                    </label>
                    <input
                      type="text"
                      value={pages[selectedPageIndex].title || ''}
                      onChange={(e) =>
                        handlePageTitleChange(selectedPageIndex, e.target.value)
                      }
                      placeholder={`e.g. Chapter ${selectedPageIndex + 1}, Memories...`}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Page Content (Paragraphs will be styled with handwriting script)
                  </label>
                  <textarea
                    rows={4}
                    value={pages[selectedPageIndex].content}
                    onChange={(e) =>
                      handlePageContentChange(selectedPageIndex, e.target.value)
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white font-sans text-xs sm:text-sm leading-relaxed"
                    placeholder="Write what's on your heart for this page..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Signature & Scratch Voucher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5">
                Sign-off / Signature
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                placeholder="e.g. With all my love ❤️"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1.5">
                Secret Scratch Voucher Note
              </label>
              <input
                type="text"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800/90 border border-stone-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                placeholder="e.g. 🎁 Secret Gift: Dinner & Cocktails!"
              />
            </div>
          </div>

          {/* 4 Photo Slots */}
          <div className="border-t border-stone-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                4 Corner Polaroid Memories
              </label>
              <span className="text-[11px] text-stone-400">
                Click any slot to upload
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.slice(0, 4).map((photo, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1.5">
                  <label className="relative w-full aspect-square rounded-lg overflow-hidden border border-stone-700 group cursor-pointer">
                    <img
                      src={photo.url}
                      alt={`Slot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs text-white">
                      <Upload className="w-4 h-4" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(idx, e)}
                    />
                  </label>
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(idx, e.target.value)}
                    placeholder={`Caption ${idx + 1}`}
                    className="w-full px-2 py-1 text-[11px] bg-stone-800 border border-stone-700 rounded text-center text-stone-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Countdown Settings */}
          <div className="border-t border-stone-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                  Birthday Countdown Lock
                </label>
                <span className="text-[11px] text-stone-400">
                  Lock letter behind ticking clock until birthday midnight
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={countdownEnabled}
                  onChange={(e) => setCountdownEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>

            {countdownEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-rose-200/80 mb-1">
                    Unlock Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownTarget}
                    onChange={(e) => setCountdownTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-rose-500 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTestDemoCountdown();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-rose-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Timer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Test 5s Countdown Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Typewriter Toggle */}
          <div className="border-t border-stone-800 pt-4 flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                Live Typewriter Reveal
              </label>
              <span className="text-[11px] text-stone-400">
                Types letter text live with acoustic keyboard sounds
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={typewriterEnabled}
                onChange={(e) => setTypewriterEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>

          {/* 3D Virtual Gift Box Unwrapping & Video Surprise */}
          <div className="border-t border-stone-800 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Gift className="w-3.5 h-3.5 text-rose-400" />
                  <span>3D Virtual Gift Box & Surprise Video</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  Drops an interactive wrapped 3D gift box with paper tearing & video reveal
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftBoxEnabled}
                  onChange={(e) => setGiftBoxEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>

            {giftBoxEnabled && (
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-rose-200/90 mb-1 flex items-center space-x-1">
                    <Video className="w-3 h-3 text-amber-300" />
                    <span>Surprise Video URL (MP4, YouTube, Vimeo, etc.)</span>
                  </label>
                  <input
                    type="url"
                    value={giftVideoUrl}
                    onChange={(e) => setGiftVideoUrl(e.target.value)}
                    placeholder="https://... (MP4 file or YouTube/Vimeo link)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white placeholder-stone-500"
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
                      Sample Festive Video
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGiftVideoUrl('https://www.youtube.com/watch?v=nl62hhiBMOM')
                      }
                      className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] border border-stone-700 cursor-pointer"
                    >
                      YouTube Birthday Clip
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">
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
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">
                      Special Note / Message
                    </label>
                    <input
                      type="text"
                      value={giftVideoMessage}
                      onChange={(e) => setGiftVideoMessage(e.target.value)}
                      placeholder="Heartfelt birthday message..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-400 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-rose-400/80 hover:text-rose-300 underline underline-offset-4 transition cursor-pointer"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply & View Letter ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
