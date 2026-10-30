import {useCallback, useRef, useState} from 'react';

/**
 * Drive an aria-live region. React skips updates when a new string is
 * `===` to the previous one, so identical consecutive announcements
 * (e.g. resizing a node twice) would not re-announce. We append a
 * trailing zero-width-space whose count alternates each call, making
 * every emitted string unique while remaining invisible to readers.
 */
export function useAriaAnnouncer() {
  const [announcement, setAnnouncement] = useState('');
  const counterRef = useRef(0);

  const announce = useCallback((message: string) => {
    counterRef.current += 1;
    const padding = '\u200B'.repeat(counterRef.current % 2 === 0 ? 1 : 2);
    setAnnouncement(message + padding);
  }, []);

  return {announcement, announce};
}
