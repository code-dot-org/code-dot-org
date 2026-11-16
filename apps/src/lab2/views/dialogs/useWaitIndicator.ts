import {useEffect, useRef, useState} from 'react';

// A wait shorter than this shows no indicator at all.
export const WAIT_INDICATOR_DELAY_MS = 300;
// Once shown, the indicator stays this long, so it never blinks.
export const WAIT_INDICATOR_MIN_MS = 500;

export interface WaitIndicator {
  /** The controls that depend on the wait stay inactive. */
  held: boolean;
  /** The wait has run long enough to show that something is happening. */
  indicator: boolean;
}

/** How to present a short wait without a flicker: nothing shows for a quick
    one, and an indicator that does show stays for a minimum time. */
export default function useWaitIndicator(waiting: boolean): WaitIndicator {
  const [indicator, setIndicator] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (waiting && indicator) {
      return;
    }
    if (waiting) {
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setIndicator(true);
      }, WAIT_INDICATOR_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (!indicator) {
      return;
    }
    const left = shownAtRef.current + WAIT_INDICATOR_MIN_MS - Date.now();
    const timer = setTimeout(() => setIndicator(false), Math.max(0, left));
    return () => clearTimeout(timer);
  }, [waiting, indicator]);

  // The timer above clears the indicator a moment late. Checking the time
  // here too makes the controls active in the same render in which the wait
  // ends.
  const showing =
    indicator &&
    (waiting || Date.now() < shownAtRef.current + WAIT_INDICATOR_MIN_MS);
  return {held: waiting || showing, indicator: showing};
}
