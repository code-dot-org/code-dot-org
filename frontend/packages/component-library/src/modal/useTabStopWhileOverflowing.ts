import {RefObject, useLayoutEffect} from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'textarea:not([disabled]), select:not([disabled]), ' +
  '[tabindex]:not([tabindex="-1"])';

// Keyboard users scroll an element by focusing it and pressing the arrow keys.
// Chrome and Firefox let them tab to a scrolling element that has no focusable
// child; Safari does not, so a long, text-only modal could not be scrolled from
// the keyboard there. This hook gives the element a tab stop (tabindex="0")
// while its content overflows, and takes it away once the content fits.
// Content with a control of its own needs no tab stop: tabbing to the control
// scrolls it into view, and in a form the first field should take first focus.
const useTabStopWhileOverflowing = (ref: RefObject<HTMLElement>) => {
  // A layout effect, so the tab stop is set during the first commit. The dialog
  // picks what to focus once its opening transition has entered, after that,
  // which is what lets scrolling content take first focus.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      // When the content fits, set tabindex="-1" instead of removing the
      // attribute. Either way the element leaves the tab order, but if it held
      // focus when the content shrank, removing the attribute would drop focus
      // to the page body, outside the dialog.
      const overflows =
        el.scrollHeight - el.clientHeight > 1 ||
        el.scrollWidth - el.clientWidth > 1;
      el.tabIndex = overflows && !el.querySelector(FOCUSABLE_SELECTOR) ? 0 : -1;
    };
    sync();
    if (typeof ResizeObserver === 'undefined') return;

    // The element's own height stops growing at the panel's cap, so watching
    // only the element would miss content that keeps growing past it. Watch
    // each child too, and re-watch when children are added or removed.
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
