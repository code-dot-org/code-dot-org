import cookies from 'js-cookie';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

// The "morph" — old logo transforming into the new wordmark — lives
// inside the WebP/WebM asset. This component plays that asset in a
// centered modal and lands the resulting static SVG into the empty
// header slot. The modal-to-header motion is a slide, not a morph.

const SEEN_COOKIE_NAME = 'hide_codeai_logo_transition';
const SEEN_COOKIE_EXPIRES_DAYS = 180;

// Animated <img>s do not fire an "ended" event, so under
// ?logo-image=true we wait on this timer (started at onLoad, not at
// phase entry); the default video path uses the real onEnded callback.
const OPEN_FADE_MS = 300;
const ANIMATED_DURATION_MS = 8000;
const HOLD_MS = 500;
const LAND_MS = 700;

const HEADER_LOGO_SELECTOR = '#header_logo_container';
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

// WebP canvas dimensions, supplied as <img> width/height to reserve
// box aspect before bytes load and prevent layout shift.
const ANIMATED_WIDTH = 1080;
const ANIMATED_HEIGHT = 313;

interface LogoTransitionProps {
  // Looping animated image, used under ?logo-image=true. AVIF can't serve
  // here because Safari doesn't decode AVIF transparency.
  animatedSrc: string;
  webmSrc?: string;
  svgSrc: string;
}

type Phase = 'opening' | 'playing' | 'hold' | 'landing' | 'done';

type Rect = {top: number; left: number; width: number; height: number};

const LogoTransition: React.FC<LogoTransitionProps> = ({
  animatedSrc,
  webmSrc,
  svgSrc,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRectRef = useRef<Rect | null>(null);
  const [phase, setPhase] = useState<Phase>('opening');

  const [hasSeen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (
      new URLSearchParams(window.location.search).get('logo-force') === 'true'
    ) {
      return false;
    }
    return cookies.get(SEEN_COOKIE_NAME) === 'true';
  });

  const [useVideo] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !webmSrc) return false;
    return (
      new URLSearchParams(window.location.search).get('logo-image') !== 'true'
    );
  });

  // Flipped on the first frame after mount. Until it flips: CSS
  // transitions on the card are suppressed and the backdrop + card sit
  // at opacity 0. raf then enables transitions in the same paint that
  // moves opacity to 1, so the open fade-in plays without the
  // 0x0-to-modal-sized size jump also animating.
  const [entered, setEntered] = useState(false);

  // The WebP's animation only starts playing once the file has been
  // fully fetched and decoded. Track that explicitly so we don't start
  // counting ANIMATED_DURATION_MS until the frames are actually moving;
  // otherwise on slow connections the timer expires mid-load and we
  // hand off to the SVG before the user has seen the morph.
  const [animatedLoaded, setAnimatedLoaded] = useState(false);

  const [mountTarget] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>(HEADER_LOGO_SELECTOR)
      : null
  );

  useLayoutEffect(() => {
    if (!mountTarget) return;

    // Drop the Rails pre-hide style. It uses selector
    // `#header_logo_container img`, which would also hide the React
    // card's <img>/<video> once they portal into this same container.
    document.getElementById(PRE_HIDE_STYLE_ID)?.remove();
    if (hasSeen) return;

    const nativeImg = mountTarget.querySelector<HTMLImageElement>('img');
    if (nativeImg) {
      nativeImg.style.visibility = 'hidden';
    }

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

    const rafId = window.requestAnimationFrame(() => setEntered(true));

    return () => {
      window.cancelAnimationFrame(rafId);
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
    };
  }, [mountTarget, hasSeen]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = window.setTimeout(() => setPhase('playing'), OPEN_FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (useVideo) {
      // Some browsers refuse autoplay even with muted+playsinline if the
      // play() call is deferred; kick it off explicitly.
      videoRef.current?.play().catch(() => {});
      return;
    }
    if (!animatedLoaded) return;
    const t = window.setTimeout(() => setPhase('hold'), ANIMATED_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase, useVideo, animatedLoaded]);

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
      // visibility:hidden lets the native logo (inside the scrolling
      // header, wrapped in #logo_home_link) take over. The React
      // overlay then unmounts, so the visible logo is the same DOM the
      // rest of the site uses — scrolling and click-to-home included.
      const nativeImg = mountTarget?.querySelector<HTMLImageElement>('img');
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
      cookies.set(SEEN_COOKIE_NAME, 'true', {
        expires: SEEN_COOKIE_EXPIRES_DAYS,
        path: '/',
      });
      setPhase('done');
    }, LAND_MS);
    return () => window.clearTimeout(t);
  }, [phase, mountTarget]);

  const handleVideoEnded = () => {
    setPhase('hold');
  };

  if (!mountTarget || hasSeen || phase === 'done') return null;

  const showMedia = phase !== 'opening';
  const animatedHidden = phase !== 'playing' && phase !== 'hold';
  // SVG stays hidden through opening, play, and end-of-play hold; it
  // only fades in once the card begins sliding, so the final logo
  // appears with the slide rather than blooming inside the still-
  // modal-sized card.
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
            (useVideo && webmSrc ? (
              <video
                ref={videoRef}
                src={webmSrc}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className={`${styles.image} ${styles.imageAnimated} ${
                  animatedHidden ? styles.imageHidden : ''
                }`}
              />
            ) : (
              <img
                src={animatedSrc}
                alt=""
                width={ANIMATED_WIDTH}
                height={ANIMATED_HEIGHT}
                onLoad={() => setAnimatedLoaded(true)}
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
