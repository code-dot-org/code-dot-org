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
const GIF_DURATION_MS = 8000;
const CROSSFADE_MS = 500;
const MORPH_MS = 700;

// The .header_logo container in the Rails-rendered site header; also where
// the morphed card lands.
const HEADER_LOGO_SELECTOR = '#header_logo_container';

// Style tag id used by show.html.haml to pre-hide the native logo <img>
// before React mounts.
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

type Phase = 'gif' | 'crossfade' | 'morphing' | 'done';

const LogoTransition: React.FC<LogoTransitionProps> = ({
  gifSrc,
  mp4Src,
  svgSrc,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('gif');

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
  // from Rails, size the card to exactly overlay the native <img>, and
  // displace it to the viewport center.
  //
  // The Rails-injected <style#logo-transition-pre-hide> uses the selector
  // `#header_logo_container img` to hide the native logo before React
  // mounts. That selector matches the React card's <img>/<video> too, so
  // we remove the style tag as soon as React has rendered and replace it
  // with an inline visibility:hidden on the native <img> only.
  //
  // The card's natural rect is set from the native <img>'s bounding rect
  // (relative to the container), so when the morph transform clears, the
  // card lands precisely on the hidden native logo. A uniform scale to a
  // modal-sized width keeps the media undistorted throughout.
  useLayoutEffect(() => {
    if (!mountTarget) return;

    const nativeImg = mountTarget.querySelector<HTMLImageElement>('img');
    if (nativeImg) {
      nativeImg.style.visibility = 'hidden';
    }
    document.getElementById(PRE_HIDE_STYLE_ID)?.remove();

    if (cardRef.current && nativeImg) {
      const containerRect = mountTarget.getBoundingClientRect();
      const nativeRect = nativeImg.getBoundingClientRect();
      if (nativeRect.width && nativeRect.height) {
        const naturalTop = nativeRect.top - containerRect.top;
        const naturalLeft = nativeRect.left - containerRect.left;
        cardRef.current.style.top = `${naturalTop}px`;
        cardRef.current.style.left = `${naturalLeft}px`;
        cardRef.current.style.width = `${nativeRect.width}px`;
        cardRef.current.style.height = `${nativeRect.height}px`;

        const modalWidth = Math.min(window.innerWidth * 0.6, 600);
        const scale = modalWidth / nativeRect.width;
        const sourceCx = nativeRect.left + nativeRect.width / 2;
        const sourceCy = nativeRect.top + nativeRect.height / 2;
        const tx = window.innerWidth / 2 - sourceCx;
        const ty = window.innerHeight / 2 - sourceCy;
        cardRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
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
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
    const t = window.setTimeout(() => setPhase('done'), MORPH_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const handleVideoEnded = () => {
    setPhase('crossfade');
  };

  if (!mountTarget) return null;

  const gifHidden = phase !== 'gif' && phase !== 'crossfade';
  const svgHidden = phase === 'gif';
  const backdropFading = phase === 'morphing' || phase === 'done';
  const cardLanded = phase === 'morphing' || phase === 'done';

  return (
    <>
      {createPortal(
        <div
          className={`${styles.backdrop} ${
            backdropFading ? styles.backdropFading : ''
          }`}
        />,
        document.body
      )}
      {createPortal(
        <div
          ref={cardRef}
          className={`${styles.card} ${
            transitionsEnabled ? '' : styles.cardNoTransition
          } ${cardLanded ? styles.cardLanded : ''}`}
        >
          {useVideo && mp4Src ? (
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
          )}
          <img
            src={svgSrc}
            alt=""
            className={`${styles.image} ${svgHidden ? styles.imageHidden : ''}`}
          />
        </div>,
        mountTarget
      )}
    </>
  );
};

export default LogoTransition;
