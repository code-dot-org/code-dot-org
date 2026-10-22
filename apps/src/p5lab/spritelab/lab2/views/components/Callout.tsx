import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {reducedMotion} from '@cdo/apps/p5lab/spritelab/lab2/reducedMotion';
import arrowImage from '@cdo/static/spritelab_lab2/callout-arrow.png';

import styles from './callout.module.scss';

export type CalloutDirection = 'up' | 'down' | 'left';

interface CalloutProps {
  /** The element the arrow points at. */
  selector: string;
  /** Which way the arrow points; it sits on the opposite side of the element. */
  direction?: CalloutDirection;
  /** Gap in px between the element's edge and the arrow. */
  offset?: number;
}

interface TargetRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// Blockly and tab switches move elements without firing any event.
const POLL_INTERVAL_MS = 500;
const DEFAULT_OFFSET = 4;

const DIRECTION_CLASS: Record<CalloutDirection, string> = {
  up: styles.up,
  down: styles.down,
  left: styles.left,
};

const sameRect = (a: TargetRect | null, b: TargetRect | null) =>
  a === b ||
  (!!a &&
    !!b &&
    a.left === b.left &&
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom);

/** Where the arrow's box anchors; the direction's transform does the rest. */
const anchorFor = (
  rect: TargetRect,
  direction: CalloutDirection,
  offset: number
) => {
  switch (direction) {
    case 'left':
      return {left: rect.right + offset, top: (rect.top + rect.bottom) / 2};
    case 'down':
      return {left: (rect.left + rect.right) / 2, top: rect.top - offset};
    default:
      return {left: (rect.left + rect.right) / 2, top: rect.bottom + offset};
  }
};

/** A bouncing arrow fixed beside the element `selector` matches, for as
    long as the element is on the page. Nothing renders while it is absent. */
const Callout: React.FunctionComponent<CalloutProps> = ({
  selector,
  direction = 'up',
  offset = DEFAULT_OFFSET,
}) => {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    let observed: Element | null = null;
    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => measure())
        : null;

    const measure = () => {
      const element = document.querySelector(selector);
      if (observer && element !== observed) {
        observer.disconnect();
        if (element) {
          observer.observe(element);
        }
        observed = element;
      }
      const box = element?.getBoundingClientRect();
      const next =
        box && box.width > 0 && box.height > 0
          ? {left: box.left, top: box.top, right: box.right, bottom: box.bottom}
          : null;
      setRect(prev => (sameRect(prev, next) ? prev : next));
    };

    measure();
    const interval = window.setInterval(measure, POLL_INTERVAL_MS);
    window.addEventListener('resize', measure);
    // Capture phase: a scrolling pane does not bubble its scroll event.
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      observer?.disconnect();
    };
  }, [selector]);

  if (!rect) {
    return null;
  }

  return (
    <div
      className={classNames(styles.callout, DIRECTION_CLASS[direction])}
      style={anchorFor(rect, direction, offset)}
      aria-hidden="true"
    >
      <div
        className={classNames(styles.arrow, !reducedMotion() && styles.bounce)}
      >
        <img src={arrowImage} alt="" />
      </div>
    </div>
  );
};

export default Callout;
