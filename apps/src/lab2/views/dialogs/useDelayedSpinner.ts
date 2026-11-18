import {useEffect, useRef, useState} from 'react';

export const SPINNER_DELAY_MS = 300;
export const SPINNER_MIN_MS = 500;

export interface DelayedSpinner {
  isWithheld: boolean;
  showSpinner: boolean;
}

/** When to show a spinner for a wait that may be short: not during the first
    300 ms, so a quick wait shows none, and once shown, for at least 500 ms,
    so it never blinks. */
export default function useDelayedSpinner(waiting: boolean): DelayedSpinner {
  const [spinnerShown, setSpinnerShown] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (waiting && spinnerShown) {
      return;
    }
    if (waiting) {
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setSpinnerShown(true);
      }, SPINNER_DELAY_MS);
      return () => clearTimeout(timer);
    }
    if (!spinnerShown) {
      return;
    }
    const timeLeft = shownAtRef.current + SPINNER_MIN_MS - Date.now();
    const timer = setTimeout(
      () => setSpinnerShown(false),
      Math.max(0, timeLeft)
    );
    return () => clearTimeout(timer);
  }, [waiting, spinnerShown]);

  // The timer above turns the spinner off one render after the wait ends.
  // Checking the time here too turns it off in the render that ends the wait.
  const showing =
    spinnerShown &&
    (waiting || Date.now() < shownAtRef.current + SPINNER_MIN_MS);
  return {isWithheld: waiting || showing, showSpinner: showing};
}
