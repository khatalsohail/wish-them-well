export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
}

export interface LetterPage {
  id: string;
  title?: string;
  content: string;
}

export interface AppData {
  recipient: string;
  date: string;
  pages: LetterPage[];
  signature: string;
  secretMessage: string;
  countdownEnabled: boolean;
  countdownTarget: string;
  typewriterEnabled: boolean;
  photos: PhotoMemory[];
  activeTemplate?: string;
  giftBoxEnabled?: boolean;
  giftVideoUrl?: string;
  giftVideoTitle?: string;
  giftVideoMessage?: string;
  secretPassword?: string;
  riddlePrompt?: string;
  waxSealColor?: string;
  waxSealSymbol?: string;
}

export const DEFAULT_PAGES: LetterPage[] = [
  {
    id: "page-1",
    title: "A Celebration of You",
    content: `Today is all about celebrating you — the light, warmth, and endless joy you bring into the world.

From the quiet conversations to the unforgettable adventures, every memory shared with you is a treasure that glows brighter with time.

May this special day bring you as much happiness as you selflessly give to everyone around you.`
  },
  {
    id: "page-2",
    title: "Wishes & Dreams",
    content: `As you blow out your candles, I wish for every dream you carry in your heart to find its wings this year.

May you be surrounded by deep laughter, peaceful mornings, thrilling new journeys, and people who love you unconditionally.

Never forget how truly extraordinary and loved you are today and every single day.`
  },
  {
    id: "page-3",
    title: "Magic & Memories",
    content: `Here's to another year of making memories, chasing sunsets, and celebrating the wonderful soul you are!

Happy Birthday! May every second of today be filled with pure magic and sweet surprises. 🎂✨`
  }
];

export const DEFAULT_PHOTOS: PhotoMemory[] = [
  {
    id: "photo-1",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop",
    caption: "Birthday Smiles ✨"
  },
  {
    id: "photo-2",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop",
    caption: "Sweet Moments 🍰"
  },
  {
    id: "photo-3",
    url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop",
    caption: "Pure Joy 🥂"
  },
  {
    id: "photo-4",
    url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop",
    caption: "Forever Cherished 💖"
  }
];

export const DEFAULT_DATA: AppData = {
  recipient: "Birthday Star",
  date: "August 25, 2026",
  pages: DEFAULT_PAGES,
  signature: "With all my love ❤️",
  secretMessage: "🎁 Secret Gift: Dinner & Cocktails on me! Code: BDAY-VIP-2026 ✨",
  countdownEnabled: false,
  countdownTarget: "",
  typewriterEnabled: true,
  photos: DEFAULT_PHOTOS,
  giftBoxEnabled: true,
  giftVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  giftVideoTitle: "A Special Birthday Video For You 🎥✨",
  giftVideoMessage: "May this next chapter of your life be filled with unforgettable adventures, pure joy, and dreams fulfilled! 🎂💖",
  secretPassword: "",
  riddlePrompt: ""
};
