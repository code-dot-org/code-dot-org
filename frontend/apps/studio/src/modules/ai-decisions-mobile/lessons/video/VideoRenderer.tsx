/**
 * VideoRenderer — video-watch level.
 *
 * Renders the real prod YouTube video via the privacy-enhanced
 * `youtube-nocookie.com` iframe embed.  Continue is enabled
 * immediately so a learner can skip past it; typical flow is
 * watch → tap Continue.
 *
 * Falls back to a tappable stub (2 s simulated playback) only when
 * the level payload has no `youtubeId`.
 */

import {Box, Button, LinearProgress, Link, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import type {Level} from '../../content/types';
import {useString} from '../../i18n/StringsProvider';

interface VideoPayload {
  /** Direct MP4 URL on videos.code.org — preferred when present. */
  mp4Url?: string | null;
  /** YouTube video id (11 characters).  Fallback when mp4Url is absent. */
  youtubeId?: string;
  videoId?: string;
  titleKey?: string;
  thumbnailId?: string;
  durationSec?: number;
}

export interface VideoRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Renderer for `kind: 'video'`, `'dance-intro-video'`, `'oceans-video'`. */
export function VideoRenderer({level, onComplete}: VideoRendererProps) {
  const getString = useString;
  const payload = level.payload as VideoPayload;
  const title = payload.titleKey ? getString(payload.titleKey) : null;

  // Prefer the prod-hosted MP4 (videos.code.org) — fewer CSP surprises
  // than YouTube iframes, controls render natively, and offline-cache
  // works through Capacitor's web view.
  if (payload.mp4Url) {
    return (
      <Mp4Video
        src={payload.mp4Url}
        title={title}
        externalUrl={
          payload.youtubeId
            ? `https://www.youtube.com/watch?v=${payload.youtubeId}`
            : null
        }
        onComplete={onComplete}
      />
    );
  }
  if (payload.youtubeId) {
    return (
      <YouTubeEmbedVideo
        youtubeId={payload.youtubeId}
        title={title}
        onComplete={onComplete}
      />
    );
  }
  return <StubVideo title={title} onComplete={onComplete} />;
}

/** Real video — native HTML5 player against the prod MP4 URL. */
function Mp4Video({
  src,
  title,
  externalUrl,
  onComplete,
}: {
  src: string;
  title: string | null;
  externalUrl: string | null;
  onComplete: (perfect: boolean) => void;
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Box
        component="video"
        src={src}
        controls
        playsInline
        preload="metadata"
        sx={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: 'common.black',
          borderRadius: 1,
        }}
      />
      {title && (
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>
          {title}
        </Typography>
      )}
      {externalUrl && (
        <Typography variant="body2" color="text.secondary">
          Trouble loading?{' '}
          <Link href={externalUrl} target="_blank" rel="noreferrer">
            Open in YouTube
          </Link>
          .
        </Typography>
      )}
      <Button variant="contained" onClick={() => onComplete(true)}>
        Continue
      </Button>
    </Box>
  );
}

/** Real video — privacy-enhanced YouTube iframe. */
function YouTubeEmbedVideo({
  youtubeId,
  title,
  onComplete,
}: {
  youtubeId: string;
  title: string | null;
  onComplete: (perfect: boolean) => void;
}) {
  // Privacy-enhanced domain (no tracking until interaction).
  // playsinline=1 lets the video play in the iframe on iOS instead of
  // hijacking the fullscreen player, which is the right behavior for
  // a Capacitor-wrapped PWA.
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
  const externalUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: 'common.black',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          component="iframe"
          src={src}
          title={title ?? 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Box>
      {title && (
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>
          {title}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        Trouble loading?{' '}
        <Link href={externalUrl} target="_blank" rel="noreferrer">
          Open in YouTube
        </Link>
        .
      </Typography>
      <Button variant="contained" onClick={() => onComplete(true)}>
        Continue
      </Button>
    </Box>
  );
}

/** Stub used when no youtubeId is on the level payload. */
function StubVideo({
  title,
  onComplete,
}: {
  title: string | null;
  onComplete: (perfect: boolean) => void;
}) {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle');
  useEffect(() => {
    if (state !== 'playing') return;
    const id = setTimeout(() => setState('done'), 2000);
    return () => clearTimeout(id);
  }, [state]);
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Box
        component="button"
        type="button"
        onClick={() => state === 'idle' && setState('playing')}
        aria-label="Play video"
        disabled={state !== 'idle'}
        sx={{
          aspectRatio: '16 / 9',
          backgroundColor: 'grey.800',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          color: 'common.white',
          cursor: state === 'idle' ? 'pointer' : 'default',
          gap: 2,
          padding: 2,
        }}
      >
        {state === 'idle' && (
          <Typography variant="h2" component="span" aria-hidden>
            ▶
          </Typography>
        )}
        {state === 'playing' && (
          <>
            <Typography variant="body2">Playing…</Typography>
            <LinearProgress sx={{width: '70%', height: 6, borderRadius: 1}} />
          </>
        )}
        {state === 'done' && <Typography variant="body2">✓ Watched</Typography>}
      </Box>
      {title && (
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>
          {title}
        </Typography>
      )}
      <Button
        variant="contained"
        onClick={() => onComplete(true)}
        disabled={state === 'playing'}
      >
        Continue
      </Button>
    </Box>
  );
}
