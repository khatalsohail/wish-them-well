import { AppData, DEFAULT_DATA } from '../types';

/**
 * Encodes AppData into a URL-safe Base64 string supporting UTF-8 characters and emojis.
 */
export function encodeAppDataToBase64(data: AppData): string {
  try {
    const jsonString = JSON.stringify(data);
    // UTF-8 safe base64 encoding
    const utf8Bytes = encodeURIComponent(jsonString).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    );
    const base64 = btoa(utf8Bytes);
    // Make URL safe
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Failed to encode AppData to base64', error);
    return '';
  }
}

/**
 * Decodes a Base64 string from the URL query parameter into AppData.
 */
export function decodeBase64ToAppData(encodedStr: string): AppData | null {
  if (!encodedStr) return null;
  try {
    const decodedUrlSafe = decodeURIComponent(encodedStr);
    const binaryStr = atob(decodedUrlSafe);
    const jsonStr = decodeURIComponent(
      binaryStr
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonStr);
    return {
      ...DEFAULT_DATA,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to decode base64 into AppData', error);
    return null;
  }
}

/**
 * Extracts data param from window search or hash.
 */
export function getUrlDataParam(): string | null {
  if (typeof window === 'undefined') return null;

  // Check URLSearchParams (?data=...)
  const params = new URLSearchParams(window.location.search);
  const dataQuery = params.get('data');
  if (dataQuery) return dataQuery;

  // Also check hash fallback (#/data=...)
  if (window.location.hash) {
    const hashStr = window.location.hash.substring(1);
    if (hashStr.startsWith('data=')) {
      return hashStr.substring(5);
    }
    const hashParams = new URLSearchParams(hashStr.includes('?') ? hashStr.split('?')[1] : hashStr);
    const hashData = hashParams.get('data');
    if (hashData) return hashData;
  }

  return null;
}

/**
 * Generates the full shareable URL with the encoded payload.
 */
export function generateShareUrl(data: AppData): string {
  const base64 = encodeAppDataToBase64(data);
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?data=${base64}`;
}
