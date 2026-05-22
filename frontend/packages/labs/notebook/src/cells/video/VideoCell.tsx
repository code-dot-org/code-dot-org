/**
 * VideoCell — renders a video from a URL inside a notebook cell.
 *
 * Three rendering strategies are selected based on the detected host:
 *
 *   youtube / vimeo  → 16:9 iframe wrapper using the embed URL
 *   direct           → native <video> element with <source>
 *   unknown/fallback → "Open video" button that opens the URL externally
 *
 * On native Capacitor builds the "Open video" fallback uses
 * @capacitor/browser instead of window.open so the in-app browser is used
 * instead of leaving the app entirely.
 */

import {useState, useCallback, useRef} from 'react';
import {Box, Button} from '@mui/material';
import {Capacitor} from '@capacitor/core';
import {detectVideoHost, youtubeEmbedUrl, vimeoEmbedUrl} from './detect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for VideoCell. */
export interface VideoCellProps {
  /** The URL of the video to render. */
  url: string;
  /** Optional accessible title shown in the iframe title attribute. */
  title?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Opens a URL externally.  On native Capacitor builds uses
 * @capacitor/browser for an in-app browser sheet; falls back to
 * window.open on web.
 *
 * @param url URL to open
 */
async function openExternally(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const {Browser} = await import('@capacitor/browser');
      await Browser.open({url});
      return;
    } catch {
      // @capacitor/browser unavailable — fall through to window.open.
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * MUI sx styles for the 16:9 aspect-ratio iframe wrapper.
 * Uses the padding-top trick so the container scales with available width.
 */
const aspectBoxSx = {
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // 9/16 = 0.5625
  overflow: 'hidden',
  borderRadius: 1,
} as const;

/** Inline styles for the absolute-fill iframe inside the aspect wrapper. */
const iframeStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 'none',
};

/** Timeout in milliseconds before treating an iframe load as failed. */
const IFRAME_TIMEOUT_MS = 2000;

/**
 * Props for EmbedFrame.
 */
interface EmbedFrameProps {
  /** Embed URL (already converted to the platform's embed form). */
  embedUrl: string;
  /** Accessible title for the iframe. */
  title: string;
  /** Called when the iframe fails to load or times out. */
  onFallback: () => void;
}

/**
 * Renders a 16:9 responsive iframe.  Triggers onFallback either when the
 * iframe fires an error event or when IFRAME_TIMEOUT_MS elapses without a
 * successful load.
 */
function EmbedFrame({embedUrl, title, onFallback}: EmbedFrameProps): React.ReactElement {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLoad = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleError = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onFallback();
  }, [onFallback]);

  // Start a timeout on mount; clear it if load succeeds.
  const startTimer = useCallback(
    (el: HTMLIFrameElement | null): void => {
      if (el === null) return;
      timerRef.current = setTimeout(() => {
        onFallback();
      }, IFRAME_TIMEOUT_MS);
    },
    [onFallback],
  );

  return (
    <Box sx={aspectBoxSx}>
      <iframe
        ref={startTimer}
        src={embedUrl}
        title={title}
        style={iframeStyle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      />
    </Box>
  );
}

/**
 * Renders a native HTML5 video element for direct media file URLs.
 */
function DirectVideo({url}: {url: string}): React.ReactElement {
  return (
    <Box sx={{width: '100%', borderRadius: 1, overflow: 'hidden'}}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video controls style={{width: '100%', display: 'block'}}>
        <source src={url} />
        Your browser does not support the video element.
      </video>
    </Box>
  );
}

/**
 * Renders a fallback "Open video" button for unknown hosts or iframe errors.
 */
function FallbackButton({url}: {url: string}): React.ReactElement {
  const handleClick = useCallback((): void => {
    void openExternally(url);
  }, [url]);

  return (
    <Box sx={{p: 1}}>
      <Button variant="outlined" onClick={handleClick}>
        Open video
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single video cell, automatically selecting an embed strategy
 * based on the URL's detected host.
 */
export function VideoCell({url, title = 'Video'}: VideoCellProps): React.ReactElement {
  const [useFallback, setUseFallback] = useState(false);

  const handleFallback = useCallback((): void => {
    setUseFallback(true);
  }, []);

  const host = detectVideoHost(url);

  if (useFallback || host === 'unknown') {
    return <FallbackButton url={url} />;
  }

  if (host === 'youtube') {
    return (
      <EmbedFrame
        embedUrl={youtubeEmbedUrl(url)}
        title={title}
        onFallback={handleFallback}
      />
    );
  }

  if (host === 'vimeo') {
    return (
      <EmbedFrame
        embedUrl={vimeoEmbedUrl(url)}
        title={title}
        onFallback={handleFallback}
      />
    );
  }

  // host === 'direct'
  return <DirectVideo url={url} />;
}
