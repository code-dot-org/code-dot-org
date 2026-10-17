import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import IconButtonWithTooltip from '@cdo/apps/lab2/views/components/IconButtonWithTooltip';

import {ImageType} from '../../ai/images/types';
import {AnimationPoses} from '../../characterAnimations';
import AnimatedSheetPreview from '../AnimatedSheetPreview';

import moduleStyles from './picture-library.module.scss';

export interface LibraryPicture {
  key: string;
  name?: string;
  /** The small image for its tile. */
  thumb?: string;
  /** The full image for the jumbo. */
  src?: string;
  /** Set for a character set: its sheet, played in the jumbo. */
  sheet?: {
    src: string;
    frameSize: {x: number; y: number};
    poses: AnimationPoses;
  };
}

export interface LibraryGroup {
  type: ImageType;
  title: string;
  pictures: LibraryPicture[];
}

interface PictureLibraryProps {
  groups: LibraryGroup[];
  chosenKey: string | null;
  onChoose: (key: string) => void;
  /** The New image button. */
  onNew: (event: React.MouseEvent<HTMLElement>) => void;
  /** Paint the chosen picture; absent when it cannot be painted. */
  onPaint?: () => void;
  /** Which side the jumbo takes; the strips take the other. */
  jumboSide?: 'left' | 'right';
}

// The pane's padding, the gap between the halves, and the least the strips
// keep: the jumbo takes what is left, up to the pane's height.
const PAD_PX = 16;
const GAP_PX = 24;
const STRIPS_MIN_PX = 320;
const JUMBO_MIN_PX = 160;

/**
 * The Pictures editor: the chosen picture large on one side, and on the
 * other every picture as tiles in a strip per kind, under a New image
 * button, scrolling when they run past the bottom.
 */
const PictureLibrary: React.FunctionComponent<PictureLibraryProps> = ({
  groups,
  chosenKey,
  onChoose,
  onNew,
  onPaint,
  jumboSide = 'left',
}) => {
  // Measured: the jumbo is a square sized from the pane, which a flex
  // item's percentage height cannot give before layout.
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({w: 0, h: 0});
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const {width, height} = entries[0].contentRect;
      setSize({w: Math.floor(width), h: Math.floor(height)});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const jumboPx = size.w
    ? Math.max(JUMBO_MIN_PX, Math.min(size.h, size.w - GAP_PX - STRIPS_MIN_PX))
    : undefined;
  const chosen = groups
    .flatMap(group => group.pictures)
    .find(picture => picture.key === chosenKey);

  return (
    <div
      ref={rootRef}
      className={classNames(
        moduleStyles.library,
        jumboSide === 'right' && moduleStyles.libraryJumboRight
      )}
      style={{padding: PAD_PX, gap: GAP_PX}}
    >
      <div
        className={moduleStyles.jumbo}
        style={{width: jumboPx, height: jumboPx}}
        role="img"
        aria-label={chosen?.name ?? 'No picture chosen'}
      >
        {chosen?.sheet ? (
          <AnimatedSheetPreview {...chosen.sheet} />
        ) : (
          chosen?.src && <img src={chosen.src} alt="" />
        )}
        {chosen && onPaint && (
          <div className={moduleStyles.jumboPaint}>
            <IconButtonWithTooltip
              id="spritelab2-paint-picture"
              label="Edit with paint tools"
              icon={{iconName: 'paintbrush', iconStyle: 'solid'}}
              variant="contained"
              color="secondary"
              size="small"
              tooltipDirection="onBottom"
              hideTooltipTail
              onClick={onPaint}
            />
          </div>
        )}
      </div>
      <div className={moduleStyles.strips}>
        <div>
          <MuiButton
            variant="outlined"
            color="secondary"
            startIcon={<FontAwesomeV6Icon iconName="plus" iconStyle="solid" />}
            onClick={onNew}
          >
            New image
          </MuiButton>
        </div>
        {groups.map(group => (
          <section
            key={group.type}
            className={moduleStyles.group}
            aria-label={group.title}
          >
            <MuiTypography
              component="h3"
              variant="overline2"
              className={moduleStyles.groupTitle}
            >
              {group.title}
            </MuiTypography>
            <div className={moduleStyles.strip}>
              {group.pictures.map(picture => {
                const isChosen = picture.key === chosenKey;
                return (
                  <button
                    key={picture.key}
                    type="button"
                    className={classNames(
                      moduleStyles.tile,
                      isChosen && moduleStyles.tileChosen
                    )}
                    aria-pressed={isChosen}
                    aria-label={picture.name || 'image'}
                    onClick={() => onChoose(picture.key)}
                  >
                    {picture.thumb && <img src={picture.thumb} alt="" />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PictureLibrary;
