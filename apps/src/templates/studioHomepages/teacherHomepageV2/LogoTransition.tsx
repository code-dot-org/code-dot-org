import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

interface LogoTransitionProps {
  gifSrc: string;
  mp4Src?: string;
  svgSrc: string;
}

// Calibrated to the GIF asset's runtime; GIFs do not fire an "ended" event,
// so without the ?logo-mp4=true override we wait on a fixed timer.
const OPEN_FADE_MS = 300;
const GIF_DURATION_MS = 8000;
const CROSSFADE_MS = 500;
const MORPH_MS = 700;

// The .header_logo container in the Rails-rendered site header; also where
// the morphed card lands.
const HEADER_LOGO_SELECTOR = '#header_logo_container';

// Style tag id used by show.html.haml to pre-hide the native logo <img>
// before React mounts.
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

type Phase = 'opening' | 'gif' | 'crossfade' | 'morphing' | 'done';

type Rect = {top: number; left: number; width: number; height: number};

const LogoTransition: React.FC<LogoTransitionProps> = ({
  gifSrc,
  mp4Src,
  svgSrc,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRectRef = useRef<Rect | null>(null);
  const [phase, setPhase] = useState<Phase>('opening');

  // Honor ?logo-mp4=true: play the MP4 once and advance phase on the
  // actual 'ended' event instead of a timer.
  const [useVideo] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !mp4Src) return false;
    return (
      new URLSearchParams(window.location.search).get('logo-mp4') === 'true'
    );
  });

  // Render the card with transitions disabled on the very first frame so
  // the initial transform that places it at viewport center doesn't
  // animate from the natural rect. After paint we flip transitions on,
  // so subsequent style changes (the morph clear) do animate.
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);

  const [mountTarget] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>(HEADER_LOGO_SELECTOR)
      : null
  );

  // Synchronously (before first paint): take over visibility management
  // from Rails, capture the native <img>'s viewport rect as the morph
  // target, and place the card as a modal-sized rect centered in the
  // viewport.
  //
  // The Rails-injected <style#logo-transition-pre-hide> uses the selector
  // `#header_logo_container img` to hide the native logo before React
  // mounts. That selector matches the React card's <img>/<video> too, so
  // we remove the style tag as soon as React has rendered and replace it
  // with an inline visibility:hidden on the native <img> only.
  //
  // We animate top/left/width/height directly (rather than via transform
  // scale) so the modal can be a different aspect than the header slot
  // without distorting the media inside.
  useLayoutEffect(() => {
    if (!mountTarget) return;

    const nativeImg = mountTarget.querySelector<HTMLImageElement>('img');
    if (nativeImg) {
      nativeImg.style.visibility = 'hidden';
    }
    document.getElementById(PRE_HIDE_STYLE_ID)?.remove();

    if (cardRef.current && nativeImg) {
      const nativeRect = nativeImg.getBoundingClientRect();
      if (nativeRect.width && nativeRect.height) {
        targetRectRef.current = {
          top: nativeRect.top,
          left: nativeRect.left,
          width: nativeRect.width,
          height: nativeRect.height,
        };

        const modalWidth = Math.min(window.innerWidth * 0.6, 700);
        const modalHeight = Math.min(window.innerHeight * 0.6, 500);
        const modalTop = (window.innerHeight - modalHeight) / 2;
        const modalLeft = (window.innerWidth - modalWidth) / 2;
        cardRef.current.style.top = `${modalTop}px`;
        cardRef.current.style.left = `${modalLeft}px`;
        cardRef.current.style.width = `${modalWidth}px`;
        cardRef.current.style.height = `${modalHeight}px`;
      }
    }

    // Enable transitions on the next frame so the modal renders fully
    // open without an opening animation.
    const rafId = window.requestAnimationFrame(() =>
      setTransitionsEnabled(true)
    );

    return () => {
      window.cancelAnimationFrame(rafId);
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
    };
  }, [mountTarget]);

  // Hold in the opening phase long enough for the backdrop + card fade-in
  // to finish, then advance to 'gif' so the <img>/<video> is mounted and
  // starts loading/playing.
  useEffect(() => {
    if (phase !== 'opening') return;
    const t = window.setTimeout(() => setPhase('gif'), OPEN_FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Drive the play phase. With ?logo-mp4=true we wait on the <video>'s
  // 'ended' event; otherwise on a calibrated timer for the looping GIF.
  useEffect(() => {
    if (phase !== 'gif') return;
    if (useVideo) {
      // Some browsers refuse autoplay even with muted+playsinline if the
      // play() call is deferred too long; kick it off explicitly here.
      videoRef.current?.play().catch(() => {});
      return;
    }
    const t = window.setTimeout(() => setPhase('crossfade'), GIF_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase, useVideo]);

  useEffect(() => {
    if (phase !== 'crossfade') return;
    const t = window.setTimeout(() => setPhase('morphing'), CROSSFADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'morphing') return;
    if (cardRef.current && targetRectRef.current) {
      const r = targetRectRef.current;
      cardRef.current.style.top = `${r.top}px`;
      cardRef.current.style.left = `${r.left}px`;
      cardRef.current.style.width = `${r.width}px`;
      cardRef.current.style.height = `${r.height}px`;
    }
    const t = window.setTimeout(() => setPhase('done'), MORPH_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const handleVideoEnded = () => {
    setPhase('crossfade');
  };

  if (!mountTarget) return null;

  const showMedia = phase !== 'opening';
  const gifHidden = phase !== 'gif' && phase !== 'crossfade';
  // Hold the SVG hidden through the opening, GIF play, and GIF fade-out;
  // it only starts fading in once the card begins shrinking, so the final
  // logo appears together with the morph rather than overlapping the GIF
  // mid-modal.
  const svgHidden =
    phase === 'opening' || phase === 'gif' || phase === 'crossfade';
  const backdropFading = phase === 'morphing' || phase === 'done';
  const cardLanded = phase === 'morphing' || phase === 'done';

  const backdropClassName = [
    styles.backdrop,
    !transitionsEnabled && styles.backdropOpening,
    backdropFading && styles.backdropFading,
  ]
    .filter(Boolean)
    .join(' ');

  const cardClassName = [
    styles.card,
    !transitionsEnabled && styles.cardNoTransition,
    !transitionsEnabled && styles.cardOpening,
    cardLanded && styles.cardLanded,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {createPortal(<div className={backdropClassName} />, document.body)}
      {createPortal(
        <div ref={cardRef} className={cardClassName}>
          {showMedia &&
            (useVideo && mp4Src ? (
              <video
                ref={videoRef}
                src={mp4Src}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className={`${styles.image} ${
                  gifHidden ? styles.imageHidden : ''
                }`}
              />
            ) : (
              <img
                src={gifSrc}
                alt=""
                className={`${styles.image} ${
                  gifHidden ? styles.imageHidden : ''
                }`}
              />
            ))}
          <img
            src={svgSrc}
            alt=""
            className={`${styles.image} ${svgHidden ? styles.imageHidden : ''}`}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default LogoTransition;
