import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { PhotoMemory } from '../types';

interface PolaroidMemoriesProps {
  photos: PhotoMemory[];
  onUpdatePhoto: (index: number, newUrl: string) => void;
}

export const PolaroidMemories: React.FC<PolaroidMemoriesProps> = ({
  photos,
  onUpdatePhoto,
}) => {
  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRefs[index].current?.click();
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="absolute inset-0 pointer-events-none z-30 p-2 sm:p-4 overflow-visible">
      {photos.slice(0, 4).map((photo, idx) => {
        const pos = cardPositions[idx] || cardPositions[0];
        return (
          <div
            key={photo.id || idx}
            className={`photo-card ${pos.className} pointer-events-auto group/photo`}
            onClick={(e) => handleCardClick(idx, e)}
            title="Click to replace photo"
          >
            {pos.tapeClass && <div className={pos.tapeClass} />}
            {pos.pinClass && <div className={pos.pinClass} />}

            <div className="polaroid-wrapper">
              <div className="photo-img-box">
                <img
                  src={photo.url}
                  alt={photo.caption || `Memory ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="photo-overlay">
                  <Camera className="w-4 h-4 text-white" />
                  <span className="text-[10px] text-white font-medium">Replace</span>
                </div>
              </div>
              <div className="polaroid-caption">{photo.caption}</div>
            </div>

            <input
              ref={fileInputRefs[idx]}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(idx, e)}
            />
          </div>
        );
      })}
    </div>
  );
};
