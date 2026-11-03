// The tab's middle column: the chosen image at full size, or the empty
// frame of the one about to be made, with an optional toolbar above and a
// row of frames below.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import {standingFrameIndex} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import StripFrame from '@cdo/apps/p5lab/spritelab/lab2/views/StripFrame';

import {ProjectImage} from './projectImages';

import styles from './images-tab.module.scss';

interface ImageFrameProps {
  /** The chosen image, when it exists. */
  image: ProjectImage | null;
  /** Which frame of a character set shows; the standing frame when unset. */
  frame?: number;
  /** Content from the sentence scene that replaces the stored image while
      a picture is generating or a generated one is showing. */
  live?: React.ReactNode;
  /** While a picture is being generated the frame is a plain box, without
      the transparency checkerboard a finished picture gets. */
  generating?: boolean;
  /** The frame holds something to work on, not a picture to look at: no
      image role, and its own class. */
  workspaceClassName?: string;
  /** Above the frame, across the column. */
  above?: React.ReactNode;
  /** Over the frame, positioned by its own class. */
  overlay?: React.ReactNode;
  /** A tip shown over the frame's bottom part while a picture is made. */
  tip?: React.ReactNode;
  /** Under the frame. */
  under?: React.ReactNode;
}

// The height the row under the frame keeps while nothing is rendered there
// (.under's min-height plus its padding), subtracted from the column height
// before the square side is computed.
const UNDER_MIN_PX = Number(styles.underMinPx);

const ImageFrame: React.FunctionComponent<ImageFrameProps> = ({
  image,
  frame,
  live,
  generating,
  workspaceClassName,
  above,
  overlay,
  tip,
  under,
}) => {
  // The frame is a square as large as the column allows. CSS alone cannot
  // size it: a flex item's percentage height is undefined until the column
  // is laid out, so the side is measured.
  const columnRef = useRef<HTMLDivElement>(null);
  const aboveRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);
  const [frameSide, setFrameSide] = useState<number>();
  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column) {
      return;
    }
    const measure = () =>
      setFrameSide(
        Math.max(
          0,
          Math.min(
            column.clientWidth,
            column.clientHeight -
              Math.max(UNDER_MIN_PX, underRef.current?.offsetHeight ?? 0) -
              (aboveRef.current?.offsetHeight ?? 0)
          )
        )
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    if (aboveRef.current) {
      observer.observe(aboveRef.current);
    }
    if (underRef.current) {
      observer.observe(underRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const filled = live ? !generating : !!image;
  return (
    <div className={styles.frameWell}>
      <div ref={columnRef} className={styles.frameColumn}>
        {above && (
          <div
            ref={aboveRef}
            className={styles.above}
            style={{width: frameSide}}
          >
            {above}
          </div>
        )}
        <div className={styles.frameRow} style={{height: frameSide}}>
          <div
            className={classNames(
              styles.frame,
              filled && styles.frameFilled,
              workspaceClassName
            )}
            style={{width: frameSide, height: frameSide}}
          >
            {/* role="img" is on the picture's own box, not the frame, so
                controls the frame holds are not hidden from assistive
                tech. */}
            <div
              className={styles.picture}
              role={workspaceClassName ? undefined : 'img'}
              aria-label={
                workspaceClassName
                  ? undefined
                  : live
                  ? 'Your picture'
                  : image
                  ? image.name
                  : 'No picture yet'
              }
            >
              {live ??
                (image?.sheet ? (
                  <StripFrame
                    sheetSrc={image.sheet.src}
                    frameSize={image.sheet.frameSize}
                    index={frame ?? standingFrameIndex(image.sheet.poses)}
                    className={styles.preview}
                  />
                ) : image?.src ? (
                  <img
                    src={image.src}
                    alt=""
                    className={classNames(
                      styles.preview,
                      image.pixelated && styles.pixelArt
                    )}
                  />
                ) : null)}
            </div>
            {overlay}
            {/* A live region, so a screen reader hears each tip as it
                changes. */}
            {tip && (
              <p className={styles.frameTip} role="status">
                <FontAwesomeV6Icon
                  iconName="lightbulb"
                  className={styles.frameTipIcon}
                  aria-hidden
                />
                <span className={styles.srOnly}>Did you know? </span>
                <span>{tip}</span>
              </p>
            )}
          </div>
        </div>
        <div ref={underRef} className={styles.under}>
          {under}
        </div>
      </div>
    </div>
  );
};

export default ImageFrame;
