import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

interface LogoTransitionProps {
  // Looping animated image (GIF by default; works with any format <img>
  // can render).
  animatedSrc: string;
  // Video sources offered under ?logo-mp4=true. WebM is preferred when
  // present; MP4 is the fallback for browsers that can't play it.
  webmSrc?: string;
  mp4Src?: string;
  svgSrc: string;
}

// Note on terminology: the "morph" the codeai brand reveal performs — the
// old logo transforming into the new wordmark — lives entirely inside the
// GIF/MP4 asset. This component just plays that asset in a centered modal,
// then lands the resulting static SVG into the empty header slot. The
// modal-to-header motion is a slide, not a morph.

// Calibrated to the animated image asset's runtime; animated <img>s (GIF,
// AVIF, etc.) do not fire an "ended" event, so without the ?logo-mp4=true
// override we wait on a fixed timer.
const OPEN_FADE_MS = 300;
const ANIMATED_DURATION_MS = 8000;
const HOLD_MS = 500;
const LAND_MS = 700;

// The .header_logo container in the Rails-rendered site header; also where
// the slide ends.
const HEADER_LOGO_SELECTOR = '#header_logo_container';

// Style tag id used by show.html.haml to pre-hide the native logo <img>
// before React mounts.
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

// Canvas dimensions of the looping animated asset (logo-codeai-transition
// .gif and the .avif counterpart). Passed to the <img> as width/height
// attributes so the browser knows the intrinsic aspect ratio before any
// bytes load — without this, the IMG box has CSS-set 100%/100% dims but
// no intrinsic aspect for object-fit: contain to honor on the first
// frame, producing an intermittent squish-then-correct as the asset
// finishes loading. CSS still drives the rendered size; these are
// aspect hints only.
const ANIMATED_WIDTH = 834;
const ANIMATED_HEIGHT = 313;

// opening: backdrop fades in; media not yet rendered.
// playing: animated image loops (or MP4 plays once) over the dimmer.
// hold:    image/video stays on its last frame for HOLD_MS.
// landing: media slides from viewport center to the header slot while the
//          image/video fades out and the SVG fades in.
// done:    React overlay is unmounted and the native Rails-rendered <img>
//          in the scrolling header takes over as the visible logo.
type Phase = 'opening' | 'playing' | 'hold' | 'landing' | 'done';

type Rect = {top: number; left: number; width: number; height: number};

const LogoTransition: React.FC<LogoTransitionProps> = ({
  animatedSrc,
  webmSrc,
  mp4Src,
  svgSrc,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRectRef = useRef<Rect | null>(null);
  const [phase, setPhase] = useState<Phase>('opening');

  // Honor ?logo-mp4=true: play the video once and advance phase on the
  // actual 'ended' event instead of a timer. The video element offers
  // WebM and MP4; the browser picks the first source it can decode.
  const [useVideo] = useState<boolean>(() => {
    if (typeof window === 'undefined' || (!webmSrc && !mp4Src)) return false;
    return (
      new URLSearchParams(window.location.search).get('logo-mp4') === 'true'
    );
  });

  // Flipped on after the first paint. While false: CSS transitions on the
  // card are suppressed (so the initial size jump doesn't animate) and the
  // backdrop + card render at opacity 0 (so the fade-in has somewhere to
  // start from). After raf: transitions enabled, opacity targets reach 1,
  // and the open fade-in plays.
  const [entered, setEntered] = useState(false);

  const [mountTarget] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>(HEADER_LOGO_SELECTOR)
      : null
  );

  // Synchronously (before first paint): take over visibility management
  // from Rails, capture the native <img>'s viewport rect as the landing
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

    // Enable transitions and trigger the open fade-in on the next frame.
    const rafId = window.requestAnimationFrame(() => setEntered(true));

    return () => {
      window.cancelAnimationFrame(rafId);
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
    };
  }, [mountTarget]);

  // Hold in the opening phase long enough for the backdrop + card fade-in
  // to finish, then advance to 'playing' so the <img>/<video> is mounted
  // and starts loading/playing.
  useEffect(() => {
    if (phase !== 'opening') return;
    const t = window.setTimeout(() => setPhase('playing'), OPEN_FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Drive the play phase. With ?logo-mp4=true we wait on the <video>'s
  // 'ended' event; otherwise on a calibrated timer for the looping
  // animated image.
  useEffect(() => {
    if (phase !== 'playing') return;
    if (useVideo) {
      // Some browsers refuse autoplay even with muted+playsinline if the
      // play() call is deferred too long; kick it off explicitly here.
      videoRef.current?.play().catch(() => {});
      return;
    }
    const t = window.setTimeout(() => setPhase('hold'), ANIMATED_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase, useVideo]);

  useEffect(() => {
    if (phase !== 'hold') return;
    const t = window.setTimeout(() => setPhase('landing'), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'landing') return;
    if (cardRef.current && targetRectRef.current) {
      const r = targetRectRef.current;
      cardRef.current.style.top = `${r.top}px`;
      cardRef.current.style.left = `${r.left}px`;
      cardRef.current.style.width = `${r.width}px`;
      cardRef.current.style.height = `${r.height}px`;
    }
    const t = window.setTimeout(() => {
      // Hand off to the Rails-rendered <img>: clearing our inline
      // visibility:hidden lets the native logo (which lives inside the
      // scrolling header, wrapped in #logo_home_link) take over. We then
      // unmount the React overlay so what users see — and scroll, and
      // click — is the same logo Rails renders site-wide.
      const nativeImg = mountTarget?.querySelector<HTMLImageElement>('img');
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
      setPhase('done');
    }, LAND_MS);
    return () => window.clearTimeout(t);
  }, [phase, mountTarget]);

  const handleVideoEnded = () => {
    setPhase('hold');
  };

  if (!mountTarget || phase === 'done') return null;

  const showMedia = phase !== 'opening';
  const animatedHidden = phase !== 'playing' && phase !== 'hold';
  // Hold the SVG hidden through the opening, play, and end-of-play hold;
  // it only starts fading in once the card begins sliding, so the final
  // logo appears together with the slide rather than blooming inside the
  // still-modal-sized card.
  const svgHidden =
    phase === 'opening' || phase === 'playing' || phase === 'hold';
  const backdropFading = phase === 'landing';

  const backdropClassName = [
    styles.backdrop,
    !entered && styles.backdropOpening,
    backdropFading && styles.backdropFading,
  ]
    .filter(Boolean)
    .join(' ');

  const cardClassName = [
    styles.card,
    !entered && styles.cardNoTransition,
    !entered && styles.cardOpening,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {createPortal(<div className={backdropClassName} />, document.body)}
      {createPortal(
        <div ref={cardRef} className={cardClassName}>
          {showMedia &&
            (useVideo && (webmSrc || mp4Src) ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className={`${styles.image} ${styles.imageAnimated} ${
                  animatedHidden ? styles.imageHidden : ''
                }`}
              >
                {webmSrc && <source src={webmSrc} type="video/webm" />}
                {mp4Src && <source src={mp4Src} type="video/mp4" />}
              </video>
            ) : (
              <img
                src={animatedSrc}
                alt=""
                width={ANIMATED_WIDTH}
                height={ANIMATED_HEIGHT}
                className={`${styles.image} ${styles.imageAnimated} ${
                  animatedHidden ? styles.imageHidden : ''
                }`}
              />
            ))}
          <img
            src={svgSrc}
            alt=""
            className={`${styles.image} ${styles.imageSvg} ${
              svgHidden ? styles.imageHidden : ''
            }`}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default LogoTransition;
