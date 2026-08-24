import React, { useRef, useState } from 'react';
import { Camera, Maximize2, X, Sparkles } from 'lucide-react';
import { PhotoMemory } from '../types';
import { initAudio, playTone } from '../utils/audio';

interface PolaroidMemoriesProps {
  photos: PhotoMemory[];
  onUpdatePhoto?: (index: number, newUrl: string) => void;
  isViewerMode?: boolean;
  readOnly?: boolean;
}

export const PolaroidMemories: React.FC<PolaroidMemoriesProps> = ({
  photos,
  onUpdatePhoto,
  isViewerMode = false,
  readOnly = false,
}) => {
  const isEditable = !isViewerMode && !readOnly && typeof onUpdatePhoto === 'function';
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (isEditable) {
      // Creator Mode: open file picker to upload photo
      fileInputRefs[index]?.current?.click();
    } else {
      // Viewer Mode: strictly read-only lightbox zoom (NO file picker)
      initAudio();
      playTone(659.25, 0.15, 'sine', 0.08);
      const photo = photos[index];
      if (photo && photo.url) {
        setSelectedPhoto(photo);
      }
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable || !onUpdatePhoto) return;

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
          onUpdatePhoto(index, compressed);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const cardPositions = [
    { className: 'photo-card-tl', tapeClass: 'tape-strip tape-tl' },
    { className: 'photo-card-tr', tapeClass: 'tape-strip tape-tr' },
    { className: 'photo-card-bl', pinClass: 'gold-pin pin-bl' },
    { className: 'photo-card-br', tapeClass: 'tape-strip tape-br' },
  ];

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-30 p-2 sm:p-4 overflow-visible">
        {photos.slice(0, 4).map((photo, idx) => {
          const pos = cardPositions[idx] || cardPositions[0];
          return (
            <div
              key={photo.id || idx}
              className={`photo-card ${pos.className} pointer-events-auto group/photo cursor-pointer`}
              onClick={(e) => handleCardClick(idx, e)}
              title={isEditable ? 'Click to replace photo' : 'Click to view photo memory'}
            >
              {pos.tapeClass && <div className={pos.tapeClass} />}
              {pos.pinClass && <div className={pos.pinClass} />}

              <div className="polaroid-wrapper">
                <div className="photo-img-box relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Memory ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Creator Mode: Show Replace overlay */}
                  {isEditable && (
                    <div className="photo-overlay">
                      <Camera className="w-4 h-4 text-white" />
                      <span className="text-[10px] text-white font-medium">Replace</span>
                    </div>
                  )}

                  {/* Viewer Mode: Subtle View Indicator on hover */}
                  {!isEditable && (
                    <div className="photo-overlay bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4 text-amber-200" />
                      <span className="text-[10px] text-amber-100 font-serif italic">View Memory</span>
                    </div>
                  )}
                </div>

                <div className="polaroid-caption">{photo.caption}</div>
              </div>

              {/* Creator Mode ONLY: hidden file input */}
              {isEditable && (
                <input
                  ref={fileInputRefs[idx]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(idx, e)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Viewer Mode: Zoom Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-parchment-100 p-4 sm:p-5 pb-6 rounded-2xl shadow-2xl border-4 border-amber-800/30 text-stone-900 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-stone-900 text-stone-200 border border-amber-400/40 flex items-center justify-center hover:bg-stone-800 transition shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner border border-stone-300 bg-stone-100 mb-3">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Memory'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <p className="font-script text-2xl sm:text-3xl text-rose-900 font-bold">
                {selectedPhoto.caption || 'Cherished Memory ✨'}
              </p>
              <div className="mt-1 flex items-center justify-center space-x-1 text-xs text-amber-800/70 font-cinzel">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Polaroid Birthday Keepsake</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
