import {RefObject, useLayoutEffect} from 'react';

// Safari gives a scrolling element with no focusable child no tab stop, so the keyboard cannot scroll it.
const useTabStopWhileOverflowing = (ref: RefObject<HTMLElement>) => {
  // A layout effect, so the tab stop exists before the dialog picks its first focus.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      // -1, not no attribute, when it fits: removing tabindex would blur it if it held focus.
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
