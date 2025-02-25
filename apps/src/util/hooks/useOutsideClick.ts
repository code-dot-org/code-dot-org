import {useRef, useEffect} from 'react';

// Hook to call the given callback when a click occurs outside the given element.
// Useful for closing elements when clicking outside of them.
export default function useOutsideClick<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    // React 17 changed the location where clickhandlers are added, so we want to defer adding the close
    // handler until the next tick of the event loop, otherwise it'll fire immediately and re-close the pop up.'
    setTimeout(() => document.addEventListener('click', handleClick), 0);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, callback]);

  return ref;
}
