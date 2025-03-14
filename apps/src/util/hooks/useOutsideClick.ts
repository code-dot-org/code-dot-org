import {useCallback, useEffect, useRef} from 'react';

// Hook to call the given callback when a click occurs outside the given element.
// Useful for closing elements when clicking outside of them.
export default function useOutsideClick<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
        document.removeEventListener('click', handleOutsideClick);
      }
    },
    [callback]
  );

  // When the element is opened, add an event listener to close it when clicking outside
  // the element.
  // Remove the event listener when the element is closed.
  useEffect(() => {
    // We want to defer adding the close handler until the next tick of the event loop,
    // otherwise it'll fire immediately and re-close the pop up.
    setTimeout(() => document.addEventListener('click', handleOutsideClick), 0);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);
  return ref;
}
