// The two halves of an image level: the picture frame on the left, the
// Guide on the right as the controls' panel.

import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import Guide, {
  GUIDE_PADDING_PX,
  GUIDE_RIGHT_OFFSET_PX,
} from '@cdo/apps/lab2/views/components/guide/Guide';

import styles from './sentence-scene.module.scss';

// The narrowest the Guide gets.
const MIN_GUIDE_WIDTH_PX = 240;

interface SentenceSceneLayoutProps {
  frameClassName?: string;
  /** Down the left of the frame, no taller than it. */
  beside?: React.ReactNode;
  /** What the frame shows. */
  frame: React.ReactNode;
  /** Below the frame, right-aligned. */
  underFrame?: React.ReactNode;
  frameAriaLabel: string;
  panelAriaLabel: string;
  /** Focus lands here on a mode change. */
  panelRef?: React.Ref<HTMLElement>;
  /** The panel is at least as tall as the frame, so a row held at its
      bottom ends at the frame's bottom. */
  fillFrameHeight?: boolean;
  children: React.ReactNode;
}

const SentenceSceneLayout: React.FunctionComponent<
  SentenceSceneLayoutProps
> = ({
  frameClassName,
  beside,
  frame,
  underFrame,
  frameAriaLabel,
  panelAriaLabel,
  panelRef,
  fillFrameHeight,
  children,
}) => {
  // The Guide floats at a pixel width inside its half.
  const guideHostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [guideWidth, setGuideWidth] = useState<number | undefined>();
  const [frameHeight, setFrameHeight] = useState<number | undefined>();
  useLayoutEffect(() => {
    const host = guideHostRef.current;
    const frameEl = frameRef.current;
    if (!host || !frameEl || typeof ResizeObserver !== 'function') {
      return;
    }
    const measure = () => {
      setGuideWidth(
        Math.max(MIN_GUIDE_WIDTH_PX, host.clientWidth - GUIDE_RIGHT_OFFSET_PX)
      );
      setFrameHeight(frameEl.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(frameEl);
    return () => observer.disconnect();
  }, []);

  const panelStyle =
    fillFrameHeight && frameHeight !== undefined
      ? {minHeight: frameHeight - 2 * GUIDE_PADDING_PX}
      : undefined;

  return (
    <div className={styles.scene}>
      {beside && (
        <div className={styles.beside} style={{maxHeight: frameHeight}}>
          {beside}
        </div>
      )}
      <section className={styles.imagePane} aria-label={frameAriaLabel}>
        <div className={styles.imageColumn}>
          <div
            ref={frameRef}
            className={classNames(styles.imageFrame, frameClassName)}
          >
            {frame}
          </div>
          {underFrame}
        </div>
      </section>
      <div ref={guideHostRef} className={styles.guideHost}>
        <Guide id="sentence-guide" width={guideWidth}>
          <section
            ref={panelRef}
            tabIndex={-1}
            className={styles.panel}
            style={panelStyle}
            aria-label={panelAriaLabel}
          >
            {children}
          </section>
        </Guide>
      </div>
    </div>
  );
};

export default SentenceSceneLayout;
