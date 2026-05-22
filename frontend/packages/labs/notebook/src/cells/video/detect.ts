/**
 * URL detection and embed-URL derivation for video cells.
 *
 * Identifies the hosting platform for a video URL and converts
 * watch/share URLs into embeddable iframe URLs for YouTube and Vimeo.
 */

/**
 * Supported video hosting platforms.
 *
 * - 'youtube'  — hosted on youtube.com or youtu.be
 * - 'vimeo'    — hosted on vimeo.com
 * - 'direct'   — a direct media file (.mp4, .webm, .ogg)
 * - 'unknown'  — anything else; rendered as an "Open video" button
 */
export type VideoHost = 'youtube' | 'vimeo' | 'direct' | 'unknown';

/**
 * Inspects a URL and returns the detected hosting platform.
 *
 * Detection rules, applied in order:
 * 1. Hostname contains 'youtube.com' or equals 'youtu.be' → 'youtube'
 * 2. Hostname contains 'vimeo.com' → 'vimeo'
 * 3. Pathname ends with .mp4, .webm, or .ogg (case-insensitive) → 'direct'
 * 4. Anything else → 'unknown'
 *
 * Malformed URLs that cannot be parsed by the URL constructor fall through
 * to string-based checks so plain relative paths still work.
 *
 * @param url Absolute or relative URL string to inspect
 * @returns Detected VideoHost variant
 */
export function detectVideoHost(url: string): VideoHost {
  let hostname = '';
  let pathname = url;

  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    pathname = parsed.pathname;
  } catch {
    // Unparseable URL — fall through to extension check on the raw string.
    pathname = url;
  }

  if (hostname.includes('youtube.com') || hostname === 'youtu.be') {
    return 'youtube';
  }

  if (hostname.includes('vimeo.com')) {
    return 'vimeo';
  }

  if (/\.(mp4|webm|ogg)$/i.test(pathname)) {
    return 'direct';
  }

  return 'unknown';
}

/**
 * Converts a YouTube watch or share URL to its embed form.
 *
 * Handles the following input formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID (already canonical, returned as-is)
 *
 * Returns the original URL unchanged when no video ID can be extracted.
 *
 * @param url YouTube URL in any supported format
 * @returns https://www.youtube.com/embed/VIDEO_ID, or the original url on failure
 */
export function youtubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Already an embed URL.
    if (parsed.pathname.startsWith('/embed/')) {
      return url;
    }

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // youtube.com/watch?v=VIDEO_ID
    const id = parsed.searchParams.get('v');
    if (id) return `https://www.youtube.com/embed/${id}`;
  } catch {
    // Malformed URL — return unchanged.
  }

  return url;
}

/**
 * Converts a Vimeo video page URL to its player embed form.
 *
 * Handles the following input format:
 * - https://vimeo.com/123456
 * - https://player.vimeo.com/video/123456 (already canonical, returned as-is)
 *
 * Returns the original URL unchanged when no numeric video ID can be extracted.
 *
 * @param url Vimeo URL in standard or already-embedded form
 * @returns https://player.vimeo.com/video/VIDEO_ID, or the original url on failure
 */
export function vimeoEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Already an embed URL.
    if (parsed.hostname === 'player.vimeo.com') {
      return url;
    }

    // vimeo.com/123456  (first path segment is the numeric ID)
    const match = parsed.pathname.match(/^\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
  } catch {
    // Malformed URL — return unchanged.
  }

  return url;
}
