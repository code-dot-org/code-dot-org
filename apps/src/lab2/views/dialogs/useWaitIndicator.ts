import {useEffect, useRef, useState} from 'react';

// A wait shorter than this shows no indicator at all.
export const WAIT_INDICATOR_DELAY_MS = 300;
// Once shown, the indicator stays this long, so it never blinks.
export const WAIT_INDICATOR_MIN_MS = 500;

export interface WaitIndicator {
  /** What needs the answer, like a share link, is withheld: true until the
      answer arrives and any spinner has had its minimum time. */
  held: boolean;
  /** Whether to show the spinner now. */
  showSpinner: boolean;
}

/** When to show a spinner for a wait that may be short: not during the first
    300 ms, so a quick wait shows none, and once shown, for at least 500 ms,
    so it never blinks. */
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

  // The timer above turns the spinner off one render after the wait ends.
  // Checking the time here too turns it off, and enables the buttons, in the
  // render that ends the wait.
  const showing =
    indicator &&
    (waiting || Date.now() < shownAtRef.current + WAIT_INDICATOR_MIN_MS);
  return {held: waiting || showing, showSpinner: showing};
}
