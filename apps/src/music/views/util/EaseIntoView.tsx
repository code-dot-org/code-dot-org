import React, {useEffect, useRef} from 'react';

const clamp = (number: number, min: number, max: number) => {
  return Math.min(Math.max(number, min), max);
};

const animationFramesPerSecond = 60;

// EaseIntoView: This component does an eased scroll of the container's content,
// starting from a distance below the top, and scrolling to the top.  It's useful
// to show the user that some new content is scrollable.

interface EaseIntoViewProps {
  id?: string;
  className?: string;
  /** Whether or not to perform the ease into view */
  doEase: boolean;
  /** Number of frames to animate over */
  frames: number;
  /** Number of frames to delay before scrolling */
  delayFrames?: number;
  /** Scroll position to start scrolling upwards from */
  scrollStart: number;
  /** Scroll position to stop scrolling at */
  scrollEnd?: number;
  /** Aria label for the container */
  ariaLabel?: string;
  children: React.ReactNode;
}

const EaseIntoView: React.FunctionComponent<EaseIntoViewProps> = ({
  id,
  className,
  doEase,
  delayFrames = 0,
  frames,
  scrollStart,
  scrollEnd = 0,
  ariaLabel = 'Scrollable content',
  children,
}) => {
  const scrollStep = useRef<number | undefined>(0);
  const lastScrollPosition = useRef<number | undefined>(undefined);
  const containerRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const containerRefCallback = (ref: HTMLDivElement) => {
    containerRef.current = ref;
  };

  function easeOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2);
  }

  // Initial render.
  useEffect(() => {
    if (!doEase) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const manualScrollDetectionThreshold = 5;

      if (scrollStep.current !== undefined && containerRef.current) {
        if (
          lastScrollPosition.current &&
          Math.abs(
            containerRef.current.scrollTop - lastScrollPosition.current
          ) > manualScrollDetectionThreshold
        ) {
          // The user appears to have scrolled manually, so stop doing the
          // automatic scroll now.
          scrollStep.current = undefined;
          clearInterval(intervalRef.current!);
        } else {
          // Update the automatic scroll.
          const progress = Math.max(
            0,
            (scrollStep.current - delayFrames) / frames
          );
          const desiredScrollPosition =
            scrollStart - (scrollStart - scrollEnd) * easeOutSine(progress);

          const maxScrollPosition =
            containerRef.current?.scrollHeight -
            containerRef.current?.clientHeight;

          // Avoid attempting to over-scroll, which will be misinterpeted as the user scrolling
          // manually by a check above.
          const clampedScrollPosition = clamp(
            desiredScrollPosition,
            -maxScrollPosition,
            maxScrollPosition
          );

          containerRef.current?.scroll({
            top: clampedScrollPosition,
            left: 0,
            behavior: 'instant',
          });

          lastScrollPosition.current = clampedScrollPosition;

          scrollStep.current++;

          if (scrollStep.current > delayFrames + frames) {
            // The automatic scroll has reached its destination.
            scrollStep.current = undefined;
            clearInterval(intervalRef.current!);
          }
        }
      }
    }, 1000 / animationFramesPerSecond);
  }, [delayFrames, scrollStart, scrollEnd, doEase, frames]);

  return (
    <div
      id={id}
      role="tablist"
      tabIndex={0}
      aria-label={ariaLabel}
      className={className}
      ref={containerRefCallback}
    >
      {children}
    </div>
  );
};

export default EaseIntoView;
