import {RefObject, useLayoutEffect} from 'react';

/**
 * Makes a scrolling element a tab stop while its content overflows, so the
 * keyboard can scroll it; Safari gives such an element no tab stop of its own.
 * Out of overflow it keeps tabindex="-1": dropping the attribute would blur it
 * if it held focus. A layout effect, so the tab stop exists before the dialog
 * picks its first focus.
 */
const useTabStopWhileOverflowing = (ref: RefObject<HTMLElement>) => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      el.tabIndex = el.scrollHeight - el.clientHeight > 1 ? 0 : -1;
    };
    sync();
    if (typeof ResizeObserver === 'undefined') return;

    // The element's own box stops growing at its cap, so watch the children too.
    const resizes = new ResizeObserver(sync);
    const observeAll = () => {
      resizes.disconnect();
      resizes.observe(el);
      Array.from(el.children).forEach(child => resizes.observe(child));
    };
    const childChanges = new MutationObserver(() => {
      observeAll();
      sync();
    });
    observeAll();
    childChanges.observe(el, {childList: true});
    return () => {
      resizes.disconnect();
      childChanges.disconnect();
    };
  }, [ref]);
};

export default useTabStopWhileOverflowing;
