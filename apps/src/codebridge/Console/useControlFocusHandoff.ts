import {useEffect, useRef} from 'react';

// Keeps focus when one control button is swapped for a different one.
//
// Rendering Run and Stop as separate elements means starting or ending a run
// unmounts whichever button had focus. Focus falls to <body>, and a screen
// reader reads that as the page title. This hands focus to the replacement.
//
// Focus must be tracked from events rather than sampled during render:
// focusing a button renders nothing, so a render-time sample never sees it.
//
// Spread the handlers on the wrapper, put the ref on it, and pass whatever
// value changes when the swap happens.
export default function useControlFocusHandoff<T extends HTMLElement>(
  swappedOn: unknown
) {
  const ref = useRef<T>(null);
  const hadFocus = useRef(false);

  useEffect(() => {
    // Only rescue focus that was really dropped, so a user who moved on in the
    // meantime keeps where they are.
    if (hadFocus.current && document.activeElement === document.body) {
      ref.current?.querySelector('button')?.focus();
    }
  }, [swappedOn]);

  return {
    ref,
    onFocus: () => {
      hadFocus.current = true;
    },
    // Removing a focused element fires no blur, so the flag survives the
    // unmount being recovered from; this clears it only when the user moved.
    onBlur: () => {
      hadFocus.current = false;
    },
  };
}
