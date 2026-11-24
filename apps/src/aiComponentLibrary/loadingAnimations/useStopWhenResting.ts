import {useEffect, useRef, useState} from 'react';

// BOUNCE_MS and EXIT_MS are the durations of `bounce` and `merge` in
// dots.module.scss.
const BOUNCE_MS = 1200;
const EXIT_MS = 400;
// The last dot is back at rest 85% of the way through the first dot's
// bounce: the 60% keyframe of `bounce`, where its landing squash ends, plus
// its 0.3s stagger from Dots.tsx. All three stay at rest until the first
// dot's next bounce starts.
const ALL_RESTING_FROM = 0.85;

// The exit starts this long before the next bounce at the latest, so that a
// late timer does not catch the first dot in the air.
const BEFORE_NEXT_BOUNCE_MS = 30;

/** The longest the dots take to leave once the phase is 'ready', unless a
    larger `targetLeavingMs` is given: the wait for all three to be at rest,
    and then the exit. */
export const MAX_LEAVING_MS = BOUNCE_MS * ALL_RESTING_FROM + EXIT_MS;

/**
 * How long to wait before starting the exit, so that it starts while all
 * three dots are at rest. Without `targetLeavingMs`, the wait ends the first
 * time they are. With `targetLeavingMs`, the wait ends at the latest time
 * they are at rest that lets the exit finish within `targetLeavingMs`; if
 * there is no such time, it ends the first time they are at rest. Returns
 * zero before the first bounce, and where the animation cannot be read, as
 * in jsdom.
 */
function msUntilExit(firstDot: Element | null, targetLeavingMs?: number) {
  const bounce = firstDot?.getAnimations?.()[0];
  if (!bounce?.effect) {
    return 0;
  }
  const beat = Number(bounce.effect.getComputedTiming().duration);
  const sinceFirstBounce =
    Number(bounce.currentTime) - Number(bounce.effect.getTiming().delay ?? 0);
  if (!beat || !(sinceFirstBounce > 0)) {
    return 0;
  }
  const untilResting = beat * ALL_RESTING_FROM - (sinceFirstBounce % beat);
  const latestStart = (targetLeavingMs ?? 0) - EXIT_MS;
  const bouncesToWait = Math.floor((latestStart - untilResting) / beat);
  if (bouncesToWait < 0) {
    return Math.max(0, untilResting);
  }
  const restingFrom = untilResting + bouncesToWait * beat;
  const nextBounce = restingFrom + beat * (1 - ALL_RESTING_FROM);
  return Math.max(
    0,
    restingFrom,
    Math.min(latestStart, nextBounce - BEFORE_NEXT_BOUNCE_MS)
  );
}

/**
 * Drives the exit of Dots. Once `phase` is 'ready' it waits until all three
 * dots are at rest, so none stops in the air, turns `stopping` on to
 * play the exit, and then calls `onStopped`. `stopping` never turns off
 * again: remount the component to show the dots anew.
 *
 * `targetLeavingMs`, read when the phase turns 'ready': the exit ends at
 * this time or at the last rest before it.
 */
export function useStopWhenResting(
  phase: 'thinking' | 'ready',
  onStopped?: () => void,
  targetLeavingMs?: number
) {
  const firstDotRef = useRef<SVGCircleElement>(null);
  const onStoppedRef = useRef(onStopped);
  const targetLeavingMsRef = useRef(targetLeavingMs);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    onStoppedRef.current = onStopped;
    targetLeavingMsRef.current = targetLeavingMs;
  });

  useEffect(() => {
    if (phase !== 'ready') {
      return;
    }
    let exitTimeoutId: number | undefined;
    const restTimeoutId = window.setTimeout(() => {
      setStopping(true);
      exitTimeoutId = window.setTimeout(
        () => onStoppedRef.current?.(),
        EXIT_MS
      );
    }, msUntilExit(firstDotRef.current, targetLeavingMsRef.current));
    return () => {
      window.clearTimeout(restTimeoutId);
      window.clearTimeout(exitTimeoutId);
    };
  }, [phase]);

  return {firstDotRef, stopping};
}
