import React, {useEffect, useRef} from 'react';

const animationFramesPerSecond = 60;

// EaseIntoView: This component does an eased scroll of the container's content,
// starting from a distance below the top, and scrolling to the top.  It's useful
// to show the user that some new content is scrollable.

interface EaseIntoViewProps {
  id?: string;
  className?: string;
  doEase: boolean;
  delay: number;
  frames: number;
  distanceY: number;
  children: React.ReactNode;
}

const EaseIntoView: React.FunctionComponent<EaseIntoViewProps> = ({
  id,
  className,
  doEase,
  delay,
  frames,
  distanceY,
  children,
}) => {
  const scrollStep = useRef<number | undefined>(0);
  const lastScrollPosition = useRef<number | undefined>(undefined);
  const containerRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

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

    setInterval(() => {
      const manualScrollDetectionThreshold = 5;

      if (scrollStep.current !== undefined && containerRef.current) {
        if (
          lastScrollPosition.current &&
          Math.abs(
            containerRef.current?.scrollTop - lastScrollPosition.current
          ) > manualScrollDetectionThreshold
        ) {
          // The user appears to have scrolled manually, so stop doing the
          // automatic scroll now.
          scrollStep.current = undefined;
        } else {
          // Update the automatic scroll.
          const progress = Math.max(0, (scrollStep.current - delay) / frames);
          const scrollPosition = distanceY - distanceY * easeOutSine(progress);

          containerRef.current?.scroll(0, scrollPosition);

          lastScrollPosition.current = scrollPosition;

          scrollStep.current++;

          if (scrollStep.current > delay + frames) {
            // The automatic scroll has reached its destination.
            scrollStep.current = undefined;
          }
        }
      }
    }, 1000 / animationFramesPerSecond);
  }, [delay, distanceY, doEase, frames]);

  return (
    <div id={id} className={className} ref={containerRefCallback}>
      {children}
    </div>
  );
};

export default EaseIntoView;
