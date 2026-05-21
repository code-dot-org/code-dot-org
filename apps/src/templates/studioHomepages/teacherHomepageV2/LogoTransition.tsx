import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import styles from './logoTransition.module.scss';

interface LogoTransitionProps {
  gifSrc: string;
  svgSrc: string;
}

// Total time the GIF plays before we cross-fade to the static SVG. GIFs do not
// fire an "ended" event, so this is calibrated to the asset's animation length.
const GIF_DURATION_MS = 2500;
const CROSSFADE_MS = 500;
const MORPH_MS = 700;

// Selector for the .header_logo container in the Rails-rendered site header,
// which is also where the morphed logo lands.
const HEADER_LOGO_SELECTOR = '#header_logo_container';

type Phase = 'gif' | 'crossfade' | 'morphing' | 'done';

const LogoTransition: React.FC<LogoTransitionProps> = ({gifSrc, svgSrc}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('gif');
  const [mountTarget] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined'
      ? document.querySelector<HTMLElement>(HEADER_LOGO_SELECTOR)
      : null
  );

  // Hide the Rails-rendered <img> for the duration of the animation; restore
  // visibility once the morph lands so the static logo takes over.
  useEffect(() => {
    if (!mountTarget) return;
    const nativeImg = mountTarget.querySelector<HTMLImageElement>('img');
    if (!nativeImg) return;
    nativeImg.style.visibility = 'hidden';
    return () => {
      nativeImg.style.visibility = '';
    };
  }, [mountTarget]);

  // Before first paint, transform the card from its natural location inside
  // .header_logo to a centered, scaled-up position in the viewport. When the
  // morph phase starts we clear the transform and the CSS transition does the
  // rest, sliding it back to the header.
  useLayoutEffect(() => {
    if (!mountTarget || !cardRef.current) return;
    const rect = mountTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const centeredWidth = Math.min(window.innerWidth * 0.5, 520);
    const scale = centeredWidth / rect.width;
    const sourceCx = rect.left + rect.width / 2;
    const sourceCy = rect.top + rect.height / 2;
    const tx = window.innerWidth / 2 - sourceCx;
    const ty = window.innerHeight / 2 - sourceCy;

    cardRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
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
  // viewport center back to its natural rect inside .header_logo.
  useEffect(() => {
    if (phase === 'morphing' && cardRef.current) {
      cardRef.current.style.transform = '';
    }
  }, [phase]);

  if (!mountTarget || phase === 'done') return null;

  const gifHidden = phase !== 'gif' && phase !== 'crossfade';
  const svgHidden = phase === 'gif';
  const backdropFading = phase === 'morphing';

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
        <div ref={cardRef} className={styles.card}>
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
