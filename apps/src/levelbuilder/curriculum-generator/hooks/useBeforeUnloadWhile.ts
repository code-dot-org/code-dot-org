import {useEffect} from 'react';

// Wire up a beforeunload listener while `active` is true, so the
// browser prompts the user before they navigate away from the page.
// Used by both generator pages while an async generation or save is
// in flight — the alternative is silent data loss when the user clicks
// a stray link mid-run. The browser's default dialog is the only
// portable way to get this confirmation.

export function useBeforeUnloadWhile(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
