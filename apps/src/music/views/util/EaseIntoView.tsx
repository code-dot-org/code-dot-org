import React, {useEffect, useRef} from 'react';

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
          const scrollPosition =
            scrollStart - (scrollStart - scrollEnd) * easeOutSine(progress);

          containerRef.current?.scroll(0, scrollPosition);

          lastScrollPosition.current = scrollPosition;

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
    <div id={id} className={className} ref={containerRefCallback}>
      {children}
    </div>
  );
};

export default EaseIntoView;
