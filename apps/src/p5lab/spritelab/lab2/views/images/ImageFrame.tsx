// The tab's middle: the chosen image large, or the empty frame of the one
// about to be made, with the session's other pictures down its left and
// the way behind the scenes under it.

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
  /** The scene's own frame contents, which win while a picture is being
      made or has just been made. */
  live?: React.ReactNode;
  /** A picture is being made: the frame is the plain box around the
      making, not a picture's checkerboard. */
  generating?: boolean;
  /** The frame holds something to work on, not a picture to look at: no
      image role, and its own class. */
  workspaceClassName?: string;
  /** Above the frame, across the column. */
  above?: React.ReactNode;
  /** Over the frame, positioned by its own class. */
  overlay?: React.ReactNode;
  /** Down the frame's left. */
  beside?: React.ReactNode;
  /** Under the frame. */
  under?: React.ReactNode;
}

// Under the frame when nothing is there yet: a row's worth.
const UNDER_MIN_PX = 48;

const ImageFrame: React.FunctionComponent<ImageFrameProps> = ({
  image,
  frame,
  live,
  generating,
  workspaceClassName,
  above,
  overlay,
  beside,
  under,
}) => {
  // The frame is a square as large as the column allows, which a flex
  // item's percentage height cannot give before layout.
  const columnRef = useRef<HTMLDivElement>(null);
  const aboveRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<number>();
  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column || typeof ResizeObserver !== 'function') {
      return;
    }
    const measure = () =>
      setSide(
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
          <div ref={aboveRef} className={styles.above} style={{width: side}}>
            {above}
          </div>
        )}
        <div className={styles.frameRow} style={{height: side}}>
          {beside && <div className={styles.beside}>{beside}</div>}
          <div
            className={classNames(
              styles.frame,
              filled && styles.frameFilled,
              workspaceClassName
            )}
            style={{width: side, height: side}}
          >
            {/* The picture alone is the image to assistive tech; anything
                else the frame holds stays reachable. */}
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
