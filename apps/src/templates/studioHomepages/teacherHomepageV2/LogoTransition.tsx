import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

interface LogoTransitionProps {
  gifSrc: string;
  svgSrc: string;
}

// GIFs do not fire an "ended" event, so the play duration is calibrated to
// the asset's animation length.
const GIF_DURATION_MS = 2500;
const CROSSFADE_MS = 500;
const MORPH_MS = 700;

// The .header_logo container in the Rails-rendered site header; also where
// the morphed card lands.
const HEADER_LOGO_SELECTOR = '#header_logo_container';

// Style tag id used by show.html.haml to pre-hide the native logo <img>
// before React mounts. Removed when LogoTransition unmounts so the native
// logo can show again on other routes.
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';

type Phase = 'gif' | 'crossfade' | 'morphing' | 'done';

const LogoTransition: React.FC<LogoTransitionProps> = ({gifSrc, svgSrc}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('gif');
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
  // mounts. That selector matches the React card's <img>s too, so we
  // must remove the style tag as soon as React has rendered — otherwise
  // the GIF and final SVG render hidden. We replace it with an inline
  // visibility:hidden on the native <img> only, then clear that inline
  // style on unmount so other routes show the native logo again.
  //
  // The card's natural rect is set from the native <img>'s bounding rect
  // (relative to the container), so when the morph transform clears, the
  // card lands precisely on the hidden native logo. A uniform scale to
  // a modal-sized width keeps the GIF and SVG undistorted throughout.
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

    return () => {
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
    };
  }, [mountTarget]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('crossfade'), GIF_DURATION_MS);
    const t2 = window.setTimeout(
      () => setPhase('morphing'),
      GIF_DURATION_MS + CROSSFADE_MS
    );
    const t3 = window.setTimeout(
      () => setPhase('done'),
      GIF_DURATION_MS + CROSSFADE_MS + MORPH_MS
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  // Clearing the transform lets the CSS transition glide the card from the
  // viewport center back to its natural rect inside .header_logo, while the
  // .cardLanded class fades out the white fill/shadow in lockstep.
  useEffect(() => {
    if (phase === 'morphing' && cardRef.current) {
      cardRef.current.style.transform = '';
    }
  }, [phase]);

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
          className={`${styles.card} ${cardLanded ? styles.cardLanded : ''}`}
        >
          <img
            src={gifSrc}
            alt=""
            className={`${styles.image} ${gifHidden ? styles.imageHidden : ''}`}
          />
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
