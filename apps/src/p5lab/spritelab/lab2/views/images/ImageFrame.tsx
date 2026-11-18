// The tab's middle column: the chosen image at full size, or the empty
// frame of the one about to be made, with an optional toolbar above and a
// row of frames below.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {standingFrameIndex} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import StripFrame from '@cdo/apps/p5lab/spritelab/lab2/views/StripFrame';
import {checkerCellFraction} from '@cdo/apps/pixelEditor/displayGrid';

import PaintPlaceholder from './PaintPlaceholder';
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
  /** Keeps the row above the frame when it is empty, so the frame does not
      move when the paint tools open. */
  reserveAbove?: boolean;
  /** Over the frame, positioned by its own class. */
  overlay?: React.ReactNode;
  /** A tip shown over the frame's bottom part while a picture is made. */
  tip?: React.ReactNode;
  /** Under the frame. */
  under?: React.ReactNode;
  /** A copy of the paint tools' canvas, shown over the picture until the
      picture has been drawn. */
  cover?: HTMLCanvasElement;
  /** The cover is no longer needed. */
  onCoverDone?: () => void;
}

// A canvas is this size until something is drawn on it.
const NEW_CANVAS_SIZE = {width: 300, height: 150};
// A picture that has not been drawn after this many animation frames is
// taken to have failed, and the cover is dropped.
const COVER_MAX_FRAMES = 30;

/** The side of a checkerboard square behind `image` as the paint tools
    draw it, as a fraction of the picture's longer side. */
function checkerFractionOf(image: ProjectImage | null): number | undefined {
  const size = image?.props.frameSize;
  if (!size) {
    return undefined;
  }
  const grid = image.props.pixelGridSize;
  return checkerCellFraction(
    size.x / (grid || 1),
    size.y / (grid || 1),
    !!grid
  );
}

const ImageFrame: React.FunctionComponent<ImageFrameProps> = ({
  image,
  frame,
  live,
  generating,
  workspaceClassName,
  above,
  reserveAbove,
  overlay,
  tip,
  under,
  cover,
  onCoverDone,
}) => {
  // The frame is a square as large as the column allows. CSS alone cannot
  // size it: a flex item's percentage height is undefined until the column
  // is laid out, so the side is measured. The rows above and under it take
  // the column's width, not the frame's, so their heights do not depend on
  // the side being measured and one measurement settles it.
  const columnRef = useRef<HTMLDivElement>(null);
  const aboveRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);
  const [frameSide, setFrameSide] = useState<number>();
  const hasAbove = !!above || !!reserveAbove;
  const hasUnder = !!under;
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
              (underRef.current?.offsetHeight ?? 0) -
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
    // The rows come and go (the tools leave while a picture is made); a
    // row that appears later is watched from then on.
  }, [hasAbove, hasUnder]);
  const filled = live ? !generating : !!image;
  const checkerFraction = checkerFractionOf(image);

  const pictureRef = useRef<HTMLDivElement>(null);
  const onCoverDoneRef = useRef(onCoverDone);
  onCoverDoneRef.current = onCoverDone;
  useEffect(() => {
    if (!cover) {
      return;
    }
    const drawn = () => {
      const picture = pictureRef.current?.querySelector('img, canvas');
      if (picture instanceof HTMLImageElement) {
        return picture.complete;
      }
      if (picture instanceof HTMLCanvasElement) {
        return (
          picture.width !== NEW_CANVAS_SIZE.width ||
          picture.height !== NEW_CANVAS_SIZE.height
        );
      }
      return true;
    };
    let frames = 0;
    let request = 0;
    const check = () => {
      if (drawn() || ++frames > COVER_MAX_FRAMES) {
        onCoverDoneRef.current?.();
        return;
      }
      request = requestAnimationFrame(check);
    };
    request = requestAnimationFrame(check);
    return () => cancelAnimationFrame(request);
  }, [cover]);

  return (
    <div className={styles.frameWell}>
      <div ref={columnRef} className={styles.frameColumn}>
        {hasAbove && (
          <div ref={aboveRef} className={styles.above}>
            {above}
          </div>
        )}
        <div className={styles.frameRow} style={{height: frameSide}}>
          <div
            className={classNames(
              styles.frame,
              filled && styles.frameFilled,
              checkerFraction !== undefined && styles.frameMatched,
              workspaceClassName
            )}
            style={
              {
                width: frameSide,
                height: frameSide,
                // A checkerboard tile is two squares a side.
                ...(checkerFraction !== undefined && {
                  '--checker-tile': `${200 * checkerFraction}%`,
                }),
              } as React.CSSProperties
            }
          >
            {/* role="img" is on the picture's own box, not the frame, so
                controls the frame holds are not hidden from assistive
                tech. */}
            <div
              ref={pictureRef}
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
            {cover && (
              <PaintPlaceholder
                picture={cover}
                src=""
                pixelated={image?.pixelated}
              />
            )}
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
