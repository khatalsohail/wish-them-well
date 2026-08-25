import LZString from 'lz-string';
import {
  AppData,
  EnvelopeData,
  DEFAULT_DATA,
  DEFAULT_ENVELOPES,
  DEFAULT_OPEN_NOW_PAGES,
  DEFAULT_OPEN_NOW_PHOTOS,
  DEFAULT_STRESSED_PAGES,
  DEFAULT_STRESSED_PHOTOS,
  DEFAULT_LAUGH_PAGES,
  DEFAULT_LAUGH_PHOTOS,
} from '../types';

const LOCAL_CARD_CACHE_KEY_PREFIX = 'card_cache_';

/**
 * Saves card data to backend API to generate an ultra-short 6-char identifier (e.g. #c=8x2k1m)
 */
export async function saveCardToCloud(data: AppData): Promise<string | null> {
  try {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.id) {
        // Cache locally for instantaneous access
        try {
          localStorage.setItem(
            `${LOCAL_CARD_CACHE_KEY_PREFIX}${json.id}`,
            JSON.stringify(data)
          );
        } catch {
          // ignore
        }
        return json.id;
      }
    }
  } catch (err) {
    console.warn('Backend short link API unavailable, using compact client-side encoding', err);
  }
  return null;
}

/**
 * Fetches card data by short ID from the backend API or local cache
 */
export async function fetchCardFromCloud(id: string): Promise<AppData | null> {
  if (!id) return null;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(`${LOCAL_CARD_CACHE_KEY_PREFIX}${id}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      return normalizeAppData(parsed);
    }
  } catch {
    // ignore
  }

  // Fetch from server
  try {
    const res = await fetch(`/api/cards/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const normalized = normalizeAppData(json.data);
        try {
          localStorage.setItem(
            `${LOCAL_CARD_CACHE_KEY_PREFIX}${id}`,
            JSON.stringify(normalized)
          );
        } catch {
          // ignore
        }
        return normalized;
      }
    }
  } catch (err) {
    console.error('Failed to fetch card by ID', err);
  }

  return null;
}

/**
 * Ultra-compact delta serializer that strips unchanged defaults and minifies keys
 * Keeps URL length down to ~80-180 chars even without a database!
 */
export function encodeCompactAppData(data: AppData): string {
  try {
    const minified: Record<string, any> = {};

    if (data.recipient && data.recipient !== DEFAULT_DATA.recipient) minified.r = data.recipient;
    if (data.date && data.date !== DEFAULT_DATA.date) minified.d = data.date;
    if (data.countdownEnabled) minified.ce = 1;
    if (data.countdownTarget) minified.ct = data.countdownTarget;
    if (data.typewriterEnabled === false) minified.tw = 0;
    if (data.secretPassword) minified.pw = data.secretPassword;
    if (data.riddlePrompt) minified.rp = data.riddlePrompt;

    if (data.envelopes && data.envelopes.length > 0) {
      minified.env = data.envelopes.map((env) => {
        const e: Record<string, any> = {
          i: env.id,
          c: env.category,
          l: env.label,
          t: env.theme,
        };
        if (env.subtitle) e.s = env.subtitle;
        if (env.sealSymbol) e.ss = env.sealSymbol;
        if (env.sealText) e.st = env.sealText;
        if (env.signature) e.sg = env.signature;
        if (env.secretMessage) e.sm = env.secretMessage;
        if (env.giftBoxEnabled === false) e.ge = 0;
        if (env.giftVideoUrl) e.gv = env.giftVideoUrl;
        if (env.giftVideoTitle) e.gt = env.giftVideoTitle;
        if (env.giftVideoMessage) e.gm = env.giftVideoMessage;

        // Pages
        if (env.pages) {
          e.p = env.pages.map((p) => ({
            i: p.id,
            t: p.title || '',
            c: p.content,
          }));
        }

        // Photos
        if (env.photos) {
          e.ph = env.photos.map((photo) => ({
            i: photo.id,
            u: photo.url,
            c: photo.caption,
          }));
        }

        return e;
      });
    }

    const jsonStr = JSON.stringify(minified);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return compressed || '';
  } catch (e) {
    return encodeAppData(data);
  }
}

/**
 * Decodes ultra-compact minified data into full AppData
 */
export function decodeCompactAppData(encoded: string): AppData | null {
  try {
    let jsonStr = LZString.decompressFromEncodedURIComponent(encoded);
    if (!jsonStr) {
      jsonStr = LZString.decompressFromEncodedURIComponent(decodeURIComponent(encoded));
    }
    if (!jsonStr) return null;

    const min = JSON.parse(jsonStr);
    if (!min) return null;

    // Reconstruct envelopes
    let envelopes: EnvelopeData[] = DEFAULT_ENVELOPES;
    if (min.env && Array.isArray(min.env) && min.env.length > 0) {
      envelopes = min.env.map((e: any, idx: number) => {
        const fallback = DEFAULT_ENVELOPES[idx] || DEFAULT_ENVELOPES[0];
        return {
          id: e.i || fallback.id,
          category: e.c || fallback.category,
          label: e.l || fallback.label,
          subtitle: e.s !== undefined ? e.s : fallback.subtitle,
          theme: e.t || fallback.theme,
          sealSymbol: e.ss || fallback.sealSymbol,
          sealText: e.st !== undefined ? e.st : fallback.sealText,
          signature: e.sg !== undefined ? e.sg : fallback.signature,
          secretMessage: e.sm !== undefined ? e.sm : fallback.secretMessage,
          giftBoxEnabled: e.ge === 0 ? false : true,
          giftVideoUrl: e.gv || fallback.giftVideoUrl,
          giftVideoTitle: e.gt || fallback.giftVideoTitle,
          giftVideoMessage: e.gm || fallback.giftVideoMessage,
          pages: e.p
            ? e.p.map((p: any) => ({
                id: p.i || 'p1',
                title: p.t,
                content: p.c,
              }))
            : fallback.pages,
          photos: e.ph
            ? e.ph.map((photo: any) => ({
                id: photo.i || 'photo-1',
                url: photo.u,
                caption: photo.c,
              }))
            : fallback.photos,
        };
      });
    }

    return {
      recipient: min.r || DEFAULT_DATA.recipient,
      date: min.d || DEFAULT_DATA.date,
      countdownEnabled: Boolean(min.ce),
      countdownTarget: min.ct || '',
      typewriterEnabled: min.tw !== 0,
      secretPassword: min.pw || '',
      riddlePrompt: min.rp || '',
      envelopes,
      pages: envelopes[0]?.pages || DEFAULT_OPEN_NOW_PAGES,
      photos: envelopes[0]?.photos || DEFAULT_OPEN_NOW_PHOTOS,
      signature: envelopes[0]?.signature || DEFAULT_DATA.signature,
      secretMessage: envelopes[0]?.secretMessage || DEFAULT_DATA.secretMessage,
    };
  } catch {
    return null;
  }
}

/**
 * Normalizes and fills in default values for AppData
 */
function normalizeAppData(parsed: any): AppData {
  let envelopes = parsed.envelopes;
  if (!envelopes || !Array.isArray(envelopes) || envelopes.length === 0) {
    envelopes = [
      {
        ...DEFAULT_ENVELOPES[0],
        pages: parsed.pages || DEFAULT_ENVELOPES[0].pages,
        photos: parsed.photos || DEFAULT_ENVELOPES[0].photos,
        secretMessage: parsed.secretMessage || DEFAULT_ENVELOPES[0].secretMessage,
        signature: parsed.signature || DEFAULT_ENVELOPES[0].signature,
        giftBoxEnabled: parsed.giftBoxEnabled !== undefined ? parsed.giftBoxEnabled : DEFAULT_ENVELOPES[0].giftBoxEnabled,
        giftVideoUrl: parsed.giftVideoUrl || DEFAULT_ENVELOPES[0].giftVideoUrl,
        giftVideoTitle: parsed.giftVideoTitle || DEFAULT_ENVELOPES[0].giftVideoTitle,
        giftVideoMessage: parsed.giftVideoMessage || DEFAULT_ENVELOPES[0].giftVideoMessage,
      },
      DEFAULT_ENVELOPES[1],
      DEFAULT_ENVELOPES[2],
    ];
  }

  return {
    ...DEFAULT_DATA,
    ...parsed,
    envelopes,
  };
}

/**
 * Encodes AppData into a compressed string using LZ-String compression.
 */
export function encodeAppData(data: AppData): string {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed || '';
  } catch (error) {
    console.error('Failed to compress AppData', error);
    try {
      const utf8Bytes = encodeURIComponent(JSON.stringify(data)).replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt(p1, 16))
      );
      return encodeURIComponent(btoa(utf8Bytes));
    } catch {
      return '';
    }
  }
}

export function encodeAppDataToBase64(data: AppData): string {
  return encodeAppData(data);
}

/**
 * Decodes a compressed LZ-string, compact string, or legacy Base64 string into AppData.
 */
export function decodeAppData(encodedStr: string): AppData | null {
  if (!encodedStr) return null;

  // Try compact decoder first
  const compact = decodeCompactAppData(encodedStr);
  if (compact) return compact;

  try {
    let jsonStr: string | null = null;

    // 1. Try LZString decompression
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
      if (decompressed && decompressed.startsWith('{')) {
        jsonStr = decompressed;
      }
    } catch {
      // Continue
    }

    // 2. Try URI-decoded LZString decompression
    if (!jsonStr) {
      try {
        const decodedUrl = decodeURIComponent(encodedStr);
        const decompressed = LZString.decompressFromEncodedURIComponent(decodedUrl);
        if (decompressed && decompressed.startsWith('{')) {
          jsonStr = decompressed;
        }
      } catch {
        // Continue
      }
    }

    // 3. Fallback: Legacy Base64 UTF-8 decoding
    if (!jsonStr) {
      try {
        const decodedUrlSafe = decodeURIComponent(encodedStr);
        const binaryStr = atob(decodedUrlSafe);
        const utf8Decoded = decodeURIComponent(
          binaryStr
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        if (utf8Decoded.startsWith('{')) {
          jsonStr = utf8Decoded;
        }
      } catch {
        // Continue
      }
    }

    // 4. Fallback: Direct base64 atob
    if (!jsonStr) {
      try {
        const binaryStr = atob(encodedStr);
        if (binaryStr.startsWith('{')) {
          jsonStr = binaryStr;
        }
      } catch {
        // Continue
      }
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    return normalizeAppData(parsed);
  } catch (error) {
    console.error('Failed to decode AppData from URL', error);
    return null;
  }
}

export function decodeBase64ToAppData(encodedStr: string): AppData | null {
  return decodeAppData(encodedStr);
}

export interface ParsedUrlParam {
  type: 'short_id' | 'payload';
  value: string;
}

/**
 * Extracts short ID or payload from URL hash or query params
 */
export function getUrlCardParam(): ParsedUrlParam | null {
  if (typeof window === 'undefined') return null;

  // 1. Check Hash Fragment (#c=ID or #data=PAYLOAD or #ID)
  if (window.location.hash) {
    const rawHash = window.location.hash.substring(1); // remove '#'
    const hashWithoutSlash = rawHash.startsWith('/') ? rawHash.substring(1) : rawHash;

    if (hashWithoutSlash.startsWith('c=')) {
      return { type: 'short_id', value: hashWithoutSlash.substring(2) };
    }
    if (hashWithoutSlash.startsWith('data=')) {
      return { type: 'payload', value: hashWithoutSlash.substring(5) };
    }

    try {
      const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash;
      const hashParams = new URLSearchParams(queryPart);
      const c = hashParams.get('c');
      if (c) return { type: 'short_id', value: c };
      const data = hashParams.get('data');
      if (data) return { type: 'payload', value: data };
    } catch {
      // Ignore
    }

    // If hash is a direct 6-char short ID (e.g. #k8x9m2)
    if (hashWithoutSlash && /^[a-z0-9]{5,10}$/i.test(hashWithoutSlash)) {
      return { type: 'short_id', value: hashWithoutSlash };
    }

    if (rawHash && !rawHash.includes('=') && rawHash.length > 10) {
      return { type: 'payload', value: rawHash };
    }
  }

  // 2. Check Search Query (?c=ID or ?data=PAYLOAD)
  if (window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('c');
      if (c) return { type: 'short_id', value: c };
      const dataQuery = params.get('data');
      if (dataQuery) return { type: 'payload', value: dataQuery };
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Legacy backwards compatibility wrapper
 */
export function getUrlDataParam(): string | null {
  const parsed = getUrlCardParam();
  if (!parsed) return null;
  return parsed.value;
}

/**
 * Generates an ultra-short shareable URL.
 * If a shortId is provided, returns `${origin}/#c=${shortId}` (~40 characters total!).
 * Otherwise uses the compact delta compression.
 */
export function generateShareUrl(data: AppData, shortId?: string | null): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const cleanPath = pathname.endsWith('/') ? pathname : `${pathname}`;

  if (shortId) {
    return `${origin}${cleanPath}#c=${shortId}`;
  }

  const compact = encodeCompactAppData(data);
  return `${origin}${cleanPath}#c=${compact}`;
}
