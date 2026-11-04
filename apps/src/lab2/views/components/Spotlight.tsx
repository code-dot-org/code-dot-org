import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import moduleStyles from './spotlight.module.scss';

const VISIBLE_MS = 4000;
const FADE_MS = 300;

type Rect = Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>;

const sameRect = (a: Rect | undefined, b: Rect) =>
  !!a &&
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.height === b.height;

interface SpotlightProps {
  target: React.RefObject<HTMLElement>;
  onDone: () => void;
}

/**
 * Dims the page around the target for a few seconds, then fades out. Any
 * click or keypress ends it early; the page beneath stays interactive.
 */
const Spotlight: React.FunctionComponent<SpotlightProps> = ({
  target,
  onDone,
}) => {
  const [rect, setRect] = useState<Rect>();
  const [fading, setFading] = useState(false);

  // Follow the target each frame: it may still be animating open.
  useEffect(() => {
    let frame: number;
    const track = () => {
      if (target.current) {
        const {top, left, width, height} =
          target.current.getBoundingClientRect();
        const next = {top, left, width, height};
        setRect(previous => (sameRect(previous, next) ? previous : next));
      }
      frame = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frame);
  }, [target]);

  // Start the fade-out timer and listen for early dismissal events.
  useEffect(() => {
    const fade = () => setFading(true);
    const timer = setTimeout(fade, VISIBLE_MS);
    window.addEventListener('pointerdown', fade, true);
    window.addEventListener('keydown', fade, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', fade, true);
      window.removeEventListener('keydown', fade, true);
    };
  }, []);

  // Unmount after fade
  useEffect(() => {
    if (!fading) {
      return;
    }
    const timer = setTimeout(onDone, FADE_MS);
    return () => clearTimeout(timer);
  }, [fading, onDone]);

  if (!rect || rect.width === 0 || rect.height === 0) {
    return null;
  }

  return createPortal(
    <div
      className={classNames(
        moduleStyles.spotlight,
        fading && moduleStyles.fading
      )}
      style={rect}
      aria-hidden
    />,
    document.body
  );
};

export default Spotlight;
