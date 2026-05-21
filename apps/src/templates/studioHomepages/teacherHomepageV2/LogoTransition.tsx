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

  // Keep the Rails-rendered <img> hidden for as long as LogoTransition is
  // mounted: the React card IS the visible logo from the moment the page
  // loads (the pre-hide <style> in show.html.haml suppresses the initial
  // flash) through the end of the morph (the card lands in place). On
  // unmount (user navigates away from /home), clear the inline hide and
  // remove the pre-hide style tag so the native logo takes over again.
  useEffect(() => {
    if (!mountTarget) return;
    const nativeImg = mountTarget.querySelector<HTMLImageElement>('img');
    if (nativeImg) {
      nativeImg.style.visibility = 'hidden';
    }
    return () => {
      if (nativeImg) {
        nativeImg.style.visibility = '';
      }
      document.getElementById(PRE_HIDE_STYLE_ID)?.remove();
    };
  }, [mountTarget]);

  // Before first paint, displace and scale the card from its natural rect
  // inside .header_logo out to a centered modal-sized rect in the viewport.
  // Non-uniform scale gives the modal a friendlier aspect ratio than the
  // narrow header slot would imply; the image inside uses object-fit:contain
  // so it stays undistorted while the white card background morphs.
  useLayoutEffect(() => {
    if (!mountTarget || !cardRef.current) return;
    const rect = mountTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const modalWidth = Math.min(window.innerWidth * 0.6, 600);
    const modalHeight = Math.min(window.innerHeight * 0.4, 300);
    const scaleX = modalWidth / rect.width;
    const scaleY = modalHeight / rect.height;
    const sourceCx = rect.left + rect.width / 2;
    const sourceCy = rect.top + rect.height / 2;
    const tx = window.innerWidth / 2 - sourceCx;
    const ty = window.innerHeight / 2 - sourceCy;

    cardRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;
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
