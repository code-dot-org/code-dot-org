import React, {useEffect, useRef, useState} from 'react';

import moduleStyles from './sprite-lab2-view.module.scss';

export type PlayspaceMode = 'preview' | 'play' | 'hidden';

// The engine's p5 canvas is a fixed 400x400 (p5lab APP_WIDTH/HEIGHT); we scale
// it with a CSS transform to fit either the corner preview or the centered
// play area.
const CANVAS = 400;
const MARGIN = 12;
const PREVIEW_SCALE = 0.32;

interface PlayspaceProps {
  mode: PlayspaceMode;
}

/**
 * The single, persistent playspace. #divGameLab is rendered once here (the
 * engine binds to it for the lab's lifetime) and this overlay animates it
 * between a small top-right preview (Code tab) and a large centered view (Play
 * tab). Because it's always mounted, switching tabs only moves/scales it — the
 * engine keeps running, so the preview is always live without pressing Run.
 */
const Playspace: React.FunctionComponent<PlayspaceProps> = ({mode}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});

  // Only animate the move/scale when going directly between the two visible
  // placements (Code preview <-> Play). Appearing from or disappearing to a tab
  // without the playspace (Images/World) should be instant, not a slide.
  const prevMode = useRef<PlayspaceMode>(mode);
  const animate = prevMode.current !== 'hidden' && mode !== 'hidden';
  useEffect(() => {
    prevMode.current = mode;
  }, [mode]);

  // Track the overlay's size so we can center/scale the canvas to fit.
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({w: rect.width, h: rect.height});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let transform: string;
  if (mode === 'play') {
    const scale = Math.max(
      0.1,
      (Math.min(size.w, size.h) - 2 * MARGIN) / CANVAS
    );
    const x = (size.w - CANVAS * scale) / 2;
    const y = (size.h - CANVAS * scale) / 2;
    transform = `translate(${x}px, ${y}px) scale(${scale})`;
  } else {
    // Preview: small box pinned to the top-right corner.
    const x = Math.max(MARGIN, size.w - CANVAS * PREVIEW_SCALE - MARGIN);
    transform = `translate(${x}px, ${MARGIN}px) scale(${PREVIEW_SCALE})`;
  }

  return (
    <div
      ref={overlayRef}
      className={moduleStyles.playspaceOverlay}
      style={{display: mode === 'hidden' ? 'none' : 'block'}}
    >
      <div
        className={moduleStyles.playspaceBox}
        style={{
          transform,
          transition: animate ? undefined : 'none',
          pointerEvents: mode === 'play' ? 'auto' : 'none',
        }}
      >
        {/* The id is hardcoded in P5Wrapper.startExecution. */}
        <div id="divGameLab" className={moduleStyles.playspaceCanvas} />
      </div>
    </div>
  );
};

export default Playspace;
