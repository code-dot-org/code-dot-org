import React, {useEffect, useState} from 'react';

import {TourTarget} from '../freeplayTour';

import moduleStyles from './tour-arrow.module.scss';

// Music Lab's callout arrow.
const arrowImage = require('@cdo/static/music/music-callout-arrow-outline.png');

// The target can appear a moment after the step does (a menu opening), so
// the position is re-read on these delays, then on every resize.
const REMEASURE_DELAYS_MS = [0, 80, 250, 600];
const GAP_PX = 4;

/**
 * A bobbing arrow pointing at an element: from below, pointing up, or from
 * the right, pointing left.
 */
const TourArrow: React.FunctionComponent<{target: TourTarget}> = ({target}) => {
  const [position, setPosition] = useState<{left: number; top: number}>();

  useEffect(() => {
    const measure = () => {
      const element = document.querySelector(target.selector);
      const rect = element?.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        setPosition(undefined);
        return;
      }
      setPosition(
        target.direction === 'left'
          ? {left: rect.right + GAP_PX, top: rect.top + rect.height / 2}
          : {left: rect.left + rect.width / 2, top: rect.bottom + GAP_PX}
      );
    };
    const timers = REMEASURE_DELAYS_MS.map(ms =>
      window.setTimeout(measure, ms)
    );
    window.addEventListener('resize', measure);
    return () => {
      timers.forEach(handle => window.clearTimeout(handle));
      window.removeEventListener('resize', measure);
    };
  }, [target]);

  if (!position) {
    return null;
  }
  return (
    <div
      className={
        target.direction === 'left'
          ? moduleStyles.arrowLeft
          : moduleStyles.arrowUp
      }
      style={position}
      aria-hidden
    >
      <img src={arrowImage} alt="" className={moduleStyles.arrowImage} />
    </div>
  );
};

export default TourArrow;
