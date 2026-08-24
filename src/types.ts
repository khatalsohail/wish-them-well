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

export type EnvelopeTheme = 'celebration' | 'stressed' | 'laugh' | 'custom';
export type EnvelopeCategory = 'open_now' | 'stressed' | 'laugh' | 'custom';

export interface EnvelopeData {
  id: string;
  category: EnvelopeCategory;
  label: string;
  subtitle?: string;
  sealSymbol?: 'sparkles' | 'heart' | 'lotus' | 'laugh' | 'cake' | 'star';
  sealText?: string;
  theme: EnvelopeTheme;
  pages: LetterPage[];
  photos: PhotoMemory[];
  secretMessage: string;
  signature: string;
  giftBoxEnabled?: boolean;
  giftVideoUrl?: string;
  giftVideoTitle?: string;
  giftVideoMessage?: string;
}

export interface AppData {
  recipient: string;
  date: string;
  countdownEnabled: boolean;
  countdownTarget: string;
  typewriterEnabled: boolean;
  secretPassword?: string;
  riddlePrompt?: string;

  // Multi-Envelope System
  envelopes: EnvelopeData[];

  // Fallbacks for backwards compatibility
  pages?: LetterPage[];
  photos?: PhotoMemory[];
  signature?: string;
  secretMessage?: string;
  giftBoxEnabled?: boolean;
  giftVideoUrl?: string;
  giftVideoTitle?: string;
  giftVideoMessage?: string;
}

export const DEFAULT_OPEN_NOW_PAGES: LetterPage[] = [
  {
    id: 'p1',
    title: 'A Celebration of You',
    content: `Today is all about celebrating you — the light, warmth, and endless joy you bring into the world.\n\nFrom the quiet conversations to the unforgettable adventures, every memory shared with you is a treasure that glows brighter with time.\n\nMay this special day bring you as much happiness as you selflessly give to everyone around you.`,
  },
  {
    id: 'p2',
    title: 'Wishes & Dreams',
    content: `As you blow out your candles, I wish for every dream you carry in your heart to find its wings this year.\n\nMay you be surrounded by deep laughter, peaceful mornings, thrilling new journeys, and people who love you unconditionally.\n\nNever forget how truly extraordinary and loved you are today and every single day.`,
  },
  {
    id: 'p3',
    title: 'Magic & Memories',
    content: `Here's to another year of making memories, chasing sunsets, and celebrating the wonderful soul you are!\n\nHappy Birthday! May every second of today be filled with pure magic and sweet surprises. 🎂✨`,
  },
];

export const DEFAULT_STRESSED_PAGES: LetterPage[] = [
  {
    id: 'p-stress-1',
    title: 'Take a Deep Breath 🌿',
    content: `Pause for a moment right now.\n\nDrop your shoulders away from your ears. Unclench your jaw. Take a slow, deep breath in... and let it all the way out.\n\nWhatever is feeling heavy or overwhelming right now, remember: this is just a single moment in time. You don't have to figure everything out all at once.`,
  },
  {
    id: 'p-stress-2',
    title: 'You Are Stronger Than You Know',
    content: `You have survived 100% of your hardest days so far, and you handled them with incredible grace.\n\nIt is okay to rest. It is okay to take a break and step away. You are human, you are worthy, and you are doing the best you can.\n\nI believe in you always, even when you doubt yourself. 🍵✨`,
  },
];

export const DEFAULT_LAUGH_PAGES: LetterPage[] = [
  {
    id: 'p-laugh-1',
    title: 'EMERGENCY LAUGH DOSE 😂',
    content: `WARNING: Opening this envelope has been clinically proven to reduce stress by 99% and increase silly giggles!\n\nRemember that time we thought we were mature adults? That was hilarious. We are basically toddlers with credit cards and existential dread.\n\nYou are my favorite unhinged companion! 🤪🍕`,
  },
  {
    id: 'p-laugh-2',
    title: 'Life Pro Tips For You',
    content: `1. Calories don't count if you eat while dancing.\n2. If you can't convince them, confuse them.\n3. Wine doesn't ask questions; wine understands.\n4. You are hotter than jalapeño poppers on a hot summer day.\n\nStay weird, stay hilarious, and go treat yourself! 🚀🥳`,
  },
];

export const DEFAULT_OPEN_NOW_PHOTOS: PhotoMemory[] = [
  {
    id: 'photo-1',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop',
    caption: 'Birthday Smiles ✨',
  },
  {
    id: 'photo-2',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    caption: 'Sweet Moments 🍰',
  },
  {
    id: 'photo-3',
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600&auto=format&fit=crop',
    caption: 'Pure Joy 🥂',
  },
  {
    id: 'photo-4',
    url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=600&auto=format&fit=crop',
    caption: 'Forever Cherished 💖',
  },
];

export const DEFAULT_STRESSED_PHOTOS: PhotoMemory[] = [
  {
    id: 'stress-photo-1',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    caption: 'Calm Ocean Horizon 🌊',
  },
  {
    id: 'stress-photo-2',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600&auto=format&fit=crop',
    caption: 'Tranquil Sunset 🌅',
  },
  {
    id: 'stress-photo-3',
    url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop',
    caption: 'Quiet Forest Path 🌲',
  },
  {
    id: 'stress-photo-4',
    url: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?q=80&w=600&auto=format&fit=crop',
    caption: 'Peaceful Moments ☕',
  },
];

export const DEFAULT_LAUGH_PHOTOS: PhotoMemory[] = [
  {
    id: 'laugh-photo-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    caption: 'Silly Goofball Energy 🤪',
  },
  {
    id: 'laugh-photo-2',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop',
    caption: 'Epic Party Shenanigans 🎉',
  },
  {
    id: 'laugh-photo-3',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop',
    caption: 'Laughing Until We Cried 😂',
  },
  {
    id: 'laugh-photo-4',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
    caption: 'Chaos & Cocktails 🍕',
  },
];

export const DEFAULT_ENVELOPES: EnvelopeData[] = [
  {
    id: 'env-open-now',
    category: 'open_now',
    label: 'Open Now',
    subtitle: 'Birthday Celebration ✨',
    sealSymbol: 'sparkles',
    sealText: 'FOR YOU',
    theme: 'celebration',
    pages: DEFAULT_OPEN_NOW_PAGES,
    photos: DEFAULT_OPEN_NOW_PHOTOS,
    secretMessage: '🎁 Secret Gift: Dinner & Cocktails on me! Code: BDAY-VIP-2026 ✨',
    signature: 'With all my love ❤️',
    giftBoxEnabled: true,
    giftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    giftVideoTitle: 'A Special Birthday Video For You 🎥✨',
    giftVideoMessage: 'May this next chapter of your life be filled with unforgettable adventures, pure joy, and dreams fulfilled! 🎂💖',
  },
  {
    id: 'env-stressed',
    category: 'stressed',
    label: "Open When You're Stressed",
    subtitle: 'A Calming Escape & Warm Hug 🌿',
    sealSymbol: 'lotus',
    sealText: 'BREATHE',
    theme: 'stressed',
    pages: DEFAULT_STRESSED_PAGES,
    photos: DEFAULT_STRESSED_PHOTOS,
    secretMessage: '💆 Secret Voucher: 1x Unlimited Guilt-Free Vent Session + Bubble Tea on me! 🍵',
    signature: 'Always in your corner 🤍',
    giftBoxEnabled: true,
    giftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    giftVideoTitle: 'Serene Nature & Calm Vibes 🌿🧘',
    giftVideoMessage: 'Remember to take care of yourself. Everything is going to be alright. Sending you peace & warmth. ✨',
  },
  {
    id: 'env-laugh',
    category: 'laugh',
    label: 'Open For A Laugh',
    subtitle: 'Instant Giggles & Unhinged Fun 😂',
    sealSymbol: 'laugh',
    sealText: 'LOL 😂',
    theme: 'laugh',
    pages: DEFAULT_LAUGH_PAGES,
    photos: DEFAULT_LAUGH_PHOTOS,
    secretMessage: '🍕 Secret Voucher: Redeem 1 Free Late-Night Pizza & Gossip Session! Code: LOL-CHUCKLE-99 🍕',
    signature: 'Your Partner In Crime 🤪✌️',
    giftBoxEnabled: true,
    giftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    giftVideoTitle: 'Hilarious Chaos Zone 🚀🤪',
    giftVideoMessage: 'Never let anyone dull your shine, you absolute comedy legend! 🤣🎉',
  },
];

export const DEFAULT_PAGES = DEFAULT_OPEN_NOW_PAGES;
export const DEFAULT_PHOTOS = DEFAULT_OPEN_NOW_PHOTOS;

export const DEFAULT_DATA: AppData = {
  recipient: 'Birthday Star',
  date: 'August 25, 2026',
  countdownEnabled: false,
  countdownTarget: '',
  typewriterEnabled: true,
  secretPassword: '',
  riddlePrompt: '',
  envelopes: DEFAULT_ENVELOPES,
  pages: DEFAULT_OPEN_NOW_PAGES,
  photos: DEFAULT_OPEN_NOW_PHOTOS,
  signature: 'With all my love ❤️',
  secretMessage: '🎁 Secret Gift: Dinner & Cocktails on me! Code: BDAY-VIP-2026 ✨',
  giftBoxEnabled: true,
  giftVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  giftVideoTitle: 'A Special Birthday Video For You 🎥✨',
  giftVideoMessage: 'May this next chapter of your life be filled with unforgettable adventures, pure joy, and dreams fulfilled! 🎂💖',
};
