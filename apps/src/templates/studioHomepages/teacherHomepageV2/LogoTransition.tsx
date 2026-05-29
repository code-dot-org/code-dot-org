import cookies from 'js-cookie';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

// The morph — old logo transforming into the new wordmark — is driven
// by CSS keyframes on inline SVG shapes (six elements: c, o, d, e,
// triangle, ibar). The CSS lives in logoTransition.module.scss; the
// markup below mirrors https://github.com/code-dot-org/logo-test
// verbatim. The modal-to-header motion is a slide, not a morph.

const SEEN_COOKIE_NAME = 'hide_codeai_logo_transition';
const SEEN_COOKIE_EXPIRES_DAYS = 180;

// The CSS animation's visible morph completes around 45% of its 9.03s
// linear cycle; after that the shapes are still until the cycle would
// repeat. We stop watching at 4500ms — long enough to see the morph,
// short enough that the hold + landing don't drag.
const OPEN_FADE_MS = 300;
const ANIMATED_DURATION_MS = 4500;
const HOLD_MS = 500;
const LAND_MS = 700;

const HEADER_LOGO_SELECTOR = '#header_logo_container';
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

// Phase state machine. Every transition is one-way; there is no path
// back to an earlier phase from a later one.
//
//   opening (OPEN_FADE_MS = 300ms)
//     Backdrop fades 0→1, card fades 0→1. Stage SVG isn't rendered
//     yet, so the CSS animation doesn't start until we're on screen.
//     → playing on setTimeout(OPEN_FADE_MS).
//
//   playing (ANIMATED_DURATION_MS = 4500ms)
//     SVG stage mounts, CSS keyframes drive the six shapes through
//     the morph. CSS animation-fill-mode: forwards holds them at the
//     final wordmark when the keyframes finish.
//     → hold on setTimeout(ANIMATED_DURATION_MS).
//
//   hold (HOLD_MS = 500ms)
//     Shapes sit at the final wordmark; nothing else changes. Gives
//     the user a beat before the slide.
//     → landing on setTimeout(HOLD_MS).
//
//   landing (LAND_MS = 700ms)
//     Card top/left/width/height transition from the modal-centered
//     rect to the native <img>'s viewport rect. SVG scales with the
//     card (viewBox-driven). Backdrop fades out. The setTimeout that
//     fires at the end clears the inline visibility:hidden on the
//     Rails <img> and sets the suppression cookie.
//     → done on setTimeout(LAND_MS).
//
//   done (terminal)
//     Render returns null; React overlay unmounts. The native Rails-
//     rendered <img> in the scrolling header is now the visible logo.
type Phase = 'opening' | 'playing' | 'hold' | 'landing' | 'done';

type Rect = {top: number; left: number; width: number; height: number};

const LogoTransition: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
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

  // Flipped on the first frame after mount. Until it flips: CSS
  // transitions on the card are suppressed and the backdrop + card sit
  // at opacity 0. raf then enables transitions in the same paint that
  // moves opacity to 1, so the open fade-in plays without the
  // 0x0-to-modal-sized size jump also animating.
  const [entered, setEntered] = useState(false);

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
    const t = window.setTimeout(() => setPhase('hold'), ANIMATED_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

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

  if (!mountTarget || hasSeen || phase === 'done') return null;

  const showStage = phase !== 'opening';
  const backdropFading = phase === 'landing';
  const stageLanding = phase === 'landing';

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
          {showStage && (
            <svg
              className={`${styles.stage}${
                stageLanding ? ` ${styles.stageLanding}` : ''
              }`}
              viewBox="0 109 1021 176"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <g className={`${styles.elem} ${styles.square} ${styles.c}`}>
                <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
                <path d="M82,0H18C8.06,0,0,8.06,0,18v64C0,91.94,8.06,100,18,100h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM51.52,66.64c6.83,0,10.34-4.1,11.44-7.74h8.32c-1.37,7.09-7.74,14.82-19.96,14.82-13.07,0-22.49-9.04-22.49-23.73s10.27-23.73,22.49-23.73,18.53,7.67,19.96,14.82h-8.32c-1.1-3.64-4.62-7.74-11.44-7.74-8.12,0-14.04,6.05-14.04,16.64s5.92,16.64,14.04,16.64Z" />
              </g>
              <g className={`${styles.elem} ${styles.square} ${styles.o}`}>
                <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
                <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM50.01,73.72c-12.54,0-23.34-9.43-23.34-23.73s10.79-23.73,23.34-23.73,23.34,9.36,23.34,23.73-10.79,23.73-23.34,23.73Z" />
                <ellipse cx="50.01" cy="50" rx="14.76" ry="16.77" />
              </g>
              <g className={`${styles.elem} ${styles.square} ${styles.d}`}>
                <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
                <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM48.01,72.74h-14.95V27.24h14.95c13.65,0,23.92,9.1,23.92,22.75s-10.27,22.75-23.92,22.75Z" />
                <path d="M47.36,34.2h-6.17v31.59h6.17c10.27,0,16.32-5.72,16.32-15.8s-6.05-15.8-16.32-15.8Z" />
              </g>
              <g className={`${styles.elem} ${styles.square} ${styles.e}`}>
                <rect width="100" height="100" rx="18" ry="18" fill="#fff" />
                <path d="M82,0h-64C8.06,0,0,8.06,0,18v64c0,9.94,8.06,18,18,18h64c9.94,0,18-8.06,18-18V18C100,8.06,91.94,0,82,0ZM66.19,72.74h-32.18V27.24h31.85v6.96h-23.73v11.77h20.15v6.83h-20.15v13h24.05v6.96Z" />
              </g>
              <g className={`${styles.elem} ${styles.triangle}`}>
                <svg
                  x="0"
                  y="0"
                  width="108.22"
                  height="100"
                  viewBox="438 0 108.22 100"
                  overflow="visible"
                >
                  <path
                    className={styles.triOuter}
                    d="M487.36,2.92l-49.15,88.66c-2.1,3.78,0.64,8.42,4.96,8.42h98.3c4.32,0,7.06-4.64,4.96-8.42L497.29,2.92c-2.16-3.9-7.76-3.9-9.92,0Z"
                  />
                  <path
                    className={styles.triInner}
                    d="M487.36,2.92l-49.15,88.66c-2.1,3.78,0.64,8.42,4.96,8.42h98.3c4.32,0,7.06-4.64,4.96-8.42L497.29,2.92c-2.16-3.9-7.76-3.9-9.92,0Z"
                    transform="translate(490.67 67.64) scale(0.55) translate(-490.67 -67.64)"
                  />
                </svg>
              </g>
              <g className={`${styles.elem} ${styles.ibar}`}>
                <svg
                  x="0"
                  y="0"
                  width="33.5"
                  height="100"
                  viewBox="557.65 0 33.5 100"
                  overflow="visible"
                >
                  <rect
                    className={styles.barOuter}
                    x="557.65"
                    width="33.5"
                    height="100"
                    rx="5.5"
                    ry="5.5"
                  />
                  <rect
                    className={styles.barInner}
                    x="566.025"
                    y="25.0"
                    width="16.75"
                    height="50.0"
                    rx="3"
                    ry="3"
                  />
                </svg>
              </g>
            </svg>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default LogoTransition;
