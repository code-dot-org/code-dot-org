import React, {useEffect, useState} from 'react';

import {TourTarget} from '../freeplayTour';

import moduleStyles from './tour-arrow.module.scss';

// Music Lab's callout arrow.
const arrowImage = require('@cdo/static/music/music-callout-arrow-outline.png');

// The target can appear a moment after the step does (a menu opening), so
// the position is re-read on these delays, then on every resize.
const REMEASURE_DELAYS_MS = [0, 80, 250, 600];
const GAP_PX = 4;
const ARROW_PX = 32;

const CLASS_BY_DIRECTION = {
  up: 'arrowUp',
  left: 'arrowLeft',
  right: 'arrowRight',
} as const;

/** A bobbing arrow pointing at an element from below, its right or its
    left. */
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
      const middle = rect.top + rect.height / 2;
      switch (target.direction) {
        case 'left':
          setPosition({left: rect.right + GAP_PX, top: middle});
          break;
        case 'right':
          setPosition({left: rect.left - GAP_PX - ARROW_PX, top: middle});
          break;
        default:
          setPosition({
            left: rect.left + rect.width / 2,
            top: rect.bottom + GAP_PX,
          });
      }
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
      className={moduleStyles[CLASS_BY_DIRECTION[target.direction]]}
      style={position}
      aria-hidden
    >
      <img src={arrowImage} alt="" className={moduleStyles.arrowImage} />
    </div>
  );
};

export default TourArrow;
