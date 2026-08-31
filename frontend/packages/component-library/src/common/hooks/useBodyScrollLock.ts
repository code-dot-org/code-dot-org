import {useEffect} from 'react';

/**
 * useBodyScrollLock
 * A hook to toggle `overflow: hidden` on the `<body>` element to prevent scrolling.
 *
 * On release the body's previous inline `overflow` is put back rather than
 * cleared, so a lock the host page set for its own reasons outlives the
 * component. Nested locks unwind correctly for the same reason: each one
 * restores what it found, so the inner one hands control back to the outer.
 *
 * @param isActive - A boolean indicating whether the body scroll should be locked.
 */
const useBodyScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // Lock scroll

    return () => {
      document.body.style.overflow = previousOverflow; // Restore scroll
    };
  }, [isActive]);
};

export default useBodyScrollLock;
