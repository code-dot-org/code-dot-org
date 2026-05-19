/**
 * useAutoScroll — auto-scrolls the journey map to the current-level bubble.
 *
 * Fires on:
 *   - Mount (initial render after progress loads)
 *   - `journeyReturn` custom event (emitted by lesson screen on back-navigate)
 *
 * Scroll behaviour: 400 ms ease-out via `scrollIntoView`.
 * Reads currentLevelId from progress; finds the DOM element via
 * `data-level-id` attribute on JourneyBubble containers.
 *
 * The `containerRef` must point to the scrollable JourneyPath outer Box.
 */

import {type RefObject, useEffect} from 'react';

import type {JourneyProgress} from '../seats/types';

/** Custom event name fired when returning to the journey map. */
export const JOURNEY_RETURN_EVENT = 'journeyReturn';

/**
 * Scrolls the element with `data-level-id={currentLevelId}` into the
 * center of the scroll container.
 *
 * @param currentLevelId - Level id to scroll to.
 */
function scrollToCurrentLevel(currentLevelId: string): void {
  const el = document.querySelector<HTMLElement>(
    `[data-level-id="${CSS.escape(currentLevelId)}"]`,
  );
  if (el) {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
}

/**
 * Registers scroll-to-current behavior on mount and on journeyReturn events.
 *
 * @param containerRef - Ref to the scrollable JourneyPath container.
 * @param progress - Current seat journey progress.
 */
export function useAutoScroll(
  containerRef: RefObject<HTMLElement | null>,
  progress: JourneyProgress | null,
): void {
  const currentLevelId = progress?.currentLevelId ?? null;

  // Scroll on mount once progress is loaded (delay one frame for layout).
  useEffect(() => {
    if (currentLevelId === null) return;
    const rafId = requestAnimationFrame(() => {
      scrollToCurrentLevel(currentLevelId);
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentLevelId]);

  // Scroll on journeyReturn event (fired when returning from a lesson).
  useEffect(() => {
    if (currentLevelId === null) return;
    const container = containerRef.current;
    if (!container) return;

    function handleReturn() {
      if (currentLevelId !== null) {
        scrollToCurrentLevel(currentLevelId);
      }
    }

    window.addEventListener(JOURNEY_RETURN_EVENT, handleReturn);
    return () => window.removeEventListener(JOURNEY_RETURN_EVENT, handleReturn);
  }, [containerRef, currentLevelId]);
}
