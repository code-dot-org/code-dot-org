// The tab's middle: the chosen image large, or the outline of the one
// about to be made, with the session's other pictures down its left and
// the way behind the scenes under it.

import classNames from 'classnames';
import React, {useLayoutEffect, useRef, useState} from 'react';

import characterOutline from '@cdo/static/spritelab_lab2/character-outline.svg';

import {ImageSubject, ImageType} from '../../ai/images/types';
import AnimatedSheetPreview from '../AnimatedSheetPreview';

import {ProjectImage} from './projectImages';

import styles from './images-tab.module.scss';

interface ImageFrameProps {
  /** The chosen image, when it exists. */
  image: ProjectImage | null;
  /** The kind being made, for the outline shown before there are pixels. */
  draftKind?: {imageType: ImageType; subject?: ImageSubject};
  /** The scene's own frame contents, which win while a picture is being
      made or has just been made. */
  live?: React.ReactNode;
  /** A picture is being made: the frame is the plain box around the
      making, not a picture's checkerboard. */
  generating?: boolean;
  /** Down the frame's left. */
  beside?: React.ReactNode;
  /** Under the frame. */
  under?: React.ReactNode;
}

// Under the frame: the row the behind-the-scenes button takes.
const UNDER_PX = 56;

const ImageFrame: React.FunctionComponent<ImageFrameProps> = ({
  image,
  draftKind,
  live,
  generating,
  beside,
  under,
}) => {
  // The frame is a square as large as the column allows, which a flex
  // item's percentage height cannot give before layout.
  const columnRef = useRef<HTMLDivElement>(null);
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
          Math.min(column.clientWidth, column.clientHeight - UNDER_PX)
        )
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    return () => observer.disconnect();
  }, []);
  const filled = live ? !generating : !!image;
  const outlineCharacter =
    !filled &&
    draftKind?.imageType === 'sprite' &&
    draftKind.subject !== 'object';
  return (
    <div ref={columnRef} className={styles.frameColumn}>
      <div className={styles.frameRow} style={{height: side}}>
        {beside && <div className={styles.beside}>{beside}</div>}
        <div
          className={classNames(styles.frame, filled && styles.frameFilled)}
          style={{width: side, height: side}}
          role="img"
          aria-label={
            live ? 'Your picture' : image ? image.name : 'No picture yet'
          }
        >
          {live ??
            (image?.sheet ? (
              <AnimatedSheetPreview {...image.sheet} />
            ) : image?.src ? (
              <img
                src={image.src}
                alt=""
                className={classNames(
                  styles.preview,
                  image.pixelated && styles.pixelArt
                )}
              />
            ) : (
              outlineCharacter && (
                <img src={characterOutline} alt="" className={styles.outline} />
              )
            ))}
        </div>
      </div>
      <div className={styles.under}>{under}</div>
    </div>
  );
};

export default ImageFrame;
