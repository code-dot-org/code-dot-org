import React, {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/** The slide's length; the playspace's fade matches it. */
export const PANE_SLIDE_MS = 300;

// parked: off the page, no transition. docked: at the edge, faded out.
// full: across the whole width.
type Stage = 'parked' | 'docked' | 'full';

export interface PaneSlide {
  /** Off the page: the pane's resting state while closed. */
  parked: boolean;
  /** The pane's transform, opacity and transition; none while parked. */
  style: React.CSSProperties | undefined;
  /** For the pane's onTransitionEnd: parks it once it has slid out. */
  onTransitionEnd: (event: React.TransitionEvent<HTMLElement>) => void;
}

/**
 * Slides a pane in from a column's edge to the full width as `active` turns
 * on, fading it in, and back as it turns off, then parks it: parked → docked
 * (at the edge, no transition) → full, and full → docked → parked. The pane
 * moves by a transform, so it holds its full size throughout and its
 * contents lay out once, at that size. `edgePx` is the column's width; its
 * last positive value is the edge, since a hidden column reports none.
 */
export default function usePaneSlide(
  active: boolean,
  edgePx: number,
  paneRef: RefObject<HTMLElement>
): PaneSlide {
  const [stage, setStage] = useState<Stage>('parked');
  const edgeRef = useRef(0);
  useEffect(() => {
    if (edgePx > 0) {
      edgeRef.current = edgePx;
    }
  }, [edgePx]);
  useEffect(() => {
    if (active) {
      setStage(stage => (stage === 'parked' ? 'docked' : 'full'));
    } else {
      setStage(stage => (stage === 'full' ? 'docked' : stage));
    }
  }, [active]);
  // Docked on the way in: let the browser take the docked position, so the
  // slide starts from it rather than from parked.
  useLayoutEffect(() => {
    if (active && stage === 'docked') {
      void paneRef.current?.getBoundingClientRect();
      setStage('full');
    }
  }, [active, stage, paneRef]);
  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLElement>) => {
      if (
        event.target === event.currentTarget &&
        event.propertyName === 'transform' &&
        !active
      ) {
        setStage('parked');
      }
    },
    [active]
  );

  const sliding = stage === 'full' || (stage === 'docked' && !active);
  const docked = stage === 'docked';
  const style: React.CSSProperties | undefined =
    stage === 'parked'
      ? undefined
      : {
          transform: docked ? `translateX(${edgeRef.current}px)` : 'none',
          opacity: docked ? 0 : 1,
          // The contents ease in over the arrival's second half, and out
          // over the departure's first.
          transition: sliding
            ? `transform ${PANE_SLIDE_MS}ms ease, opacity ${
                PANE_SLIDE_MS / 2
              }ms ease ${active ? PANE_SLIDE_MS / 2 : 0}ms`
            : undefined,
        };
  return {parked: stage === 'parked', style, onTransitionEnd};
}
