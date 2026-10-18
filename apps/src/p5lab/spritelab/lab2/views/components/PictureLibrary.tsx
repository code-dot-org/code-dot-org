import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {ImageType} from '../../ai/images/types';
import {AnimationPoses} from '../../characterAnimations';
import AnimatedSheetPreview from '../AnimatedSheetPreview';
import ImagePaneButton from '../ImagePaneButton';

import moduleStyles from './picture-library.module.scss';
import dialogStyles from '../image-details-dialog.module.scss';

export interface LibraryPicture {
  key: string;
  name?: string;
  /** The small image for its tile. */
  thumb?: string;
  /** The full image for the jumbo. */
  src?: string;
  /** Pixel art upscales with hard edges. */
  pixelated?: boolean;
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
  /** Delete the chosen picture; absent with nothing chosen. */
  onDelete?: () => void;
  /** Which side the jumbo takes; the strips take the other. */
  jumboSide?: 'left' | 'right';
}

// The pane's padding, the gap between the halves, and the least the strips
// keep: the jumbo takes what is left, up to the pane's height and to its
// share of the width, so a tall window does not starve the library.
const PAD_PX = 16;
const GAP_PX = 24;
const STRIPS_MIN_PX = 320;
const JUMBO_MIN_PX = 160;
const JUMBO_MAX_SHARE = 0.4;
// Under the jumbo: the Delete row.
const ACTIONS_PX = 48;
// A tile, the gap between tiles, and the gap between groups on a row
// (picture-library.module.scss).
const TILE_PX = 104;
const TILE_GAP_PX = 10;
const GROUP_GAP_PX = 32;

/**
 * The Images editor: the chosen picture large on one side, and on the
 * other every picture as tiles in a strip per kind, under a New image
 * button, scrolling when they run past the bottom.
 */
const PictureLibrary: React.FunctionComponent<PictureLibraryProps> = ({
  groups,
  chosenKey,
  onChoose,
  onNew,
  onPaint,
  onDelete,
  jumboSide = 'right',
}) => {
  // The jumbo is the image dialog's pane, whose chrome colors follow the
  // theme it is given.
  // Without a provider (tests) the pane keeps the light chrome.
  const {theme} = useTheme(true);
  const mode = theme === 'Dark' ? 'dark' : 'light';
  // Delete asks once; a new choice withdraws the question.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  useEffect(() => setConfirmingDelete(false), [chosenKey]);
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
    ? Math.max(
        JUMBO_MIN_PX,
        Math.min(
          size.h - ACTIONS_PX,
          size.w - GAP_PX - STRIPS_MIN_PX,
          Math.floor(size.w * JUMBO_MAX_SHARE)
        )
      )
    : undefined;
  const chosen = groups
    .flatMap(group => group.pictures)
    .find(picture => picture.key === chosenKey);
  // With the jumbo at the right the strips take the width their rows fill,
  // so the jumbo sits against the last tile: a wrapped flex box keeps the
  // width it shrank to, not the width its groups use. The groups are packed
  // as the browser packs them, greedily into rows of the room.
  let stripsWidth: number | undefined;
  if (jumboSide === 'right' && jumboPx !== undefined) {
    const room = size.w - GAP_PX - jumboPx;
    const perRow = Math.max(
      1,
      Math.floor((room + TILE_GAP_PX) / (TILE_PX + TILE_GAP_PX))
    );
    const widths = groups.map(group => {
      const columns = Math.min(perRow, Math.max(1, group.pictures.length));
      return columns * TILE_PX + (columns - 1) * TILE_GAP_PX;
    });
    let row = 0;
    stripsWidth = 0;
    widths.forEach(width => {
      const next = row ? row + GROUP_GAP_PX + width : width;
      row = next <= room ? next : width;
      stripsWidth = Math.max(stripsWidth ?? 0, row);
    });
    stripsWidth = Math.max(stripsWidth, TILE_PX);
  }

  return (
    <div
      ref={rootRef}
      className={classNames(
        moduleStyles.library,
        jumboSide === 'right' && moduleStyles.libraryJumboRight
      )}
      style={{padding: PAD_PX, gap: GAP_PX}}
    >
      <div className={moduleStyles.jumboColumn}>
        {/* The dialog's pane, at the jumbo's side: a button into paint
            where the picture can be painted, a plain pane otherwise. */}
        <div
          className={classNames(dialogStyles.dialogHost, moduleStyles.jumbo)}
          data-theme={mode}
          style={{'--jumbo-side': `${jumboPx ?? 0}px`} as React.CSSProperties}
        >
          {chosen && onPaint ? (
            <ImagePaneButton
              thumb={chosen.src}
              pixelated={chosen.pixelated}
              iconName="pen"
              label="Edit with paint tools"
              onClick={onPaint}
            />
          ) : (
            <div
              className={classNames(
                dialogStyles.imagePane,
                chosen && dialogStyles.imagePaneChecker
              )}
              role="img"
              aria-label={chosen?.name ?? 'No picture chosen'}
            >
              {chosen?.sheet ? (
                <AnimatedSheetPreview {...chosen.sheet} />
              ) : (
                chosen?.src && (
                  <img
                    src={chosen.src}
                    alt=""
                    className={classNames(
                      chosen.pixelated && dialogStyles.pixelArt
                    )}
                  />
                )
              )}
            </div>
          )}
        </div>
        {chosen && onDelete && (
          <div className={moduleStyles.jumboActions}>
            {confirmingDelete ? (
              <>
                <span>Delete this picture?</span>
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </MuiButton>
                <MuiButton
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={onDelete}
                >
                  Delete
                </MuiButton>
              </>
            ) : (
              <MuiButton
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete
              </MuiButton>
            )}
          </div>
        )}
      </div>
      <div className={moduleStyles.strips} style={{width: stripsWidth}}>
        <div>
          <MuiButton
            variant="outlined"
            color="secondary"
            className={moduleStyles.newButton}
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
