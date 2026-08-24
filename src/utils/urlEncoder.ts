import LZString from 'lz-string';
import { AppData, DEFAULT_DATA, DEFAULT_ENVELOPES } from '../types';

/**
 * Encodes AppData into a highly compressed URL-safe string using LZ-String compression.
 * This keeps the payload extremely compact and prevents URL size issues.
 */
export function encodeAppData(data: AppData): string {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed || '';
  } catch (error) {
    console.error('Failed to compress AppData', error);
    // Fallback to base64 if compression fails
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

/**
 * Backwards-compatible alias for encodeAppData
 */
export function encodeAppDataToBase64(data: AppData): string {
  return encodeAppData(data);
}

/**
 * Decodes a compressed LZ-string or legacy Base64 string from the URL into AppData.
 */
export function decodeAppData(encodedStr: string): AppData | null {
  if (!encodedStr) return null;

  try {
    let jsonStr: string | null = null;

    // 1. Try LZString decompression first (Modern, compact format)
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
      if (decompressed && decompressed.startsWith('{')) {
        jsonStr = decompressed;
      }
    } catch {
      // Continue to fallback
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
        // Continue to fallback
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
        // Continue to fallback
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
        // Continue to fallback
      }
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    // If decoded payload lacks envelopes array (legacy data), construct multi-envelope stack
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
  } catch (error) {
    console.error('Failed to decode AppData from URL', error);
    return null;
  }
}

/**
 * Backwards-compatible alias for decodeAppData
 */
export function decodeBase64ToAppData(encodedStr: string): AppData | null {
  return decodeAppData(encodedStr);
}

/**
 * Extracts data param from window hash or search.
 * We prioritize window.location.hash (#data=...) because hash fragments are NEVER
 * sent to the server, preventing HTTP 414 "URI Too Long" errors from proxies.
 */
export function getUrlDataParam(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check Hash Fragment (#data=... or #/data=... or #... )
  if (window.location.hash) {
    const rawHash = window.location.hash.substring(1); // remove '#'

    // Check if hash is formatted like #data=VALUE or #/data=VALUE
    const hashWithoutSlash = rawHash.startsWith('/') ? rawHash.substring(1) : rawHash;
    if (hashWithoutSlash.startsWith('data=')) {
      return hashWithoutSlash.substring(5);
    }

    // Check URLSearchParams style inside hash (e.g. #?data=... or #foo=1&data=...)
    try {
      const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash;
      const hashParams = new URLSearchParams(queryPart);
      const hashData = hashParams.get('data');
      if (hashData) return hashData;
    } catch {
      // Ignore
    }

    // If raw hash itself has no key but is a direct compressed payload
    if (rawHash && !rawHash.includes('=') && rawHash.length > 10) {
      return rawHash;
    }
  }

  // 2. Check Search Query (?data=...) as backwards-compatible fallback
  if (window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const dataQuery = params.get('data');
      if (dataQuery) return dataQuery;
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Generates the full shareable URL with the compressed payload in the HASH fragment.
 * Using the hash (#data=...) guarantees that the payload is handled 100% client-side
 * and NEVER sent to HTTP servers, preventing HTTP 414 (Request-URI Too Long).
 */
export function generateShareUrl(data: AppData): string {
  const compressed = encodeAppData(data);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return `${origin}${pathname}#data=${compressed}`;
}
