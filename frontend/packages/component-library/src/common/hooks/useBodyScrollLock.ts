import {useEffect} from 'react';

// Shared across every caller, so overlapping locks are counted rather than
// each keeping its own snapshot.
let lockCount = 0;
let hostOverflow: string | null = null;

/**
 * useBodyScrollLock
 * A hook to toggle `overflow: hidden` on the `<body>` element to prevent scrolling.
 *
 * Locks are reference counted: the body is restored only once the last one
 * releases. A per-lock snapshot would instead depend on release order, and
 * sibling dialogs release oldest-first, which leaves the last writer's stale
 * value behind — permanently locked, or unlocked while a dialog is still open.
 *
 * The value restored is whatever the body carried before the first lock, so a
 * lock the host page took for its own reasons outlives the dialogs above it.
 *
 * @param isActive - A boolean indicating whether the body scroll should be locked.
 */
const useBodyScrollLock = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (lockCount === 0) {
      hostOverflow = document.body.style.overflow;
    }
    lockCount += 1;
    document.body.style.overflow = 'hidden'; // Lock scroll

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = hostOverflow ?? ''; // Restore scroll
        hostOverflow = null;
      }
    };
  }, [isActive]);
};

export default useBodyScrollLock;
