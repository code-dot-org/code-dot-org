// A character set's frames as toggle buttons grouped under their poses'
// names.

import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {
  AnimationPoses,
  FrameSize,
} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';
import StripFrame from '@cdo/apps/p5lab/spritelab/lab2/views/StripFrame';

import {FRAME_LABELS, frameGroups} from './frames';

import styles from './images-tab.module.scss';

interface FrameRowProps {
  sheetSrc: string;
  frameSize: FrameSize;
  poses: AnimationPoses;
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const FrameRow: React.FunctionComponent<FrameRowProps> = ({
  sheetSrc,
  frameSize,
  poses,
  count,
  selected,
  onSelect,
  disabled,
}) => (
  <div className={styles.frameStrip} role="group" aria-label="Frames">
    {frameGroups(poses, count).map(group => (
      <div
        key={group.key}
        className={styles.frameGroup}
        role="group"
        aria-label={group.title}
      >
        <MuiTypography
          variant="overline2"
          className={styles.frameGroupTitle}
          aria-hidden
        >
          {group.title}
        </MuiTypography>
        <div className={styles.frameGroupTiles}>
          {group.frames.map(index => {
            const chosen = index === selected;
            return (
              <button
                key={index}
                type="button"
                className={classNames(
                  styles.frameTile,
                  chosen && styles.frameTileChosen
                )}
                aria-pressed={chosen}
                aria-label={FRAME_LABELS[index] ?? `Frame ${index + 1}`}
                disabled={disabled}
                onClick={() => onSelect(index)}
              >
                <span className={styles.frameTilePicture}>
                  <StripFrame
                    sheetSrc={sheetSrc}
                    frameSize={frameSize}
                    index={index}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

export default FrameRow;
