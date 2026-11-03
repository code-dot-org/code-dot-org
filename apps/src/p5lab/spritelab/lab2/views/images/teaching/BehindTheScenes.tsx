// A Behind the scenes button that opens a dialog showing the picture and
// the full prompt the model received; for a character set, a second view
// shows the prompts sent for the other poses.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import {FrameSize} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

import {POSE_MARK, SentPrompts} from '../../sentence/sentPrompts';

import styles from './behind-the-scenes.module.scss';

const TITLE = 'Behind the scenes';
const VIEWS = [
  ['picture', 'First picture'],
  ['poses', 'Other poses'],
] as const;
type View = (typeof VIEWS)[number][0];
// Pose names as students read them.
const POSE_NAMES: Record<string, string> = {idling: 'standing'};

/** The picture the words made, shown small beside them. */
export interface BehindTheScenesPicture {
  src: string;
  pixelated?: boolean;
  /** For a character set the image is a horizontal strip of frames; only
      its first frame is shown, not animated. */
  sheet?: {frameSize: FrameSize} | null;
  /** The prompt, as the thumbnail's name for screen readers. */
  name?: string;
}

interface BehindTheScenesProps {
  sent: SentPrompts;
  picture?: BehindTheScenesPicture;
  disabled?: boolean;
  /** The icon alone, for a header with no room for the title. */
  compact?: boolean;
}

const BehindTheScenes: React.FunctionComponent<BehindTheScenesProps> = ({
  sent,
  picture,
  disabled,
  compact,
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('picture');
  const openDialog = () => {
    setView('picture');
    setOpen(true);
  };
  const triggerProps = {
    variant: 'text',
    color: 'tertiary',
    size: 'small',
    disabled,
    onClick: openDialog,
  } as const;
  const promptView =
    sent.poses && view === 'poses' ? (
      <>
        <p className={styles.promptNote}>
          Then, for each pose, we sent the first picture back with these words.
          Only the part in brackets changed.
        </p>
        <p className={styles.promptCommon}>
          {sent.poses.common.split(POSE_MARK).flatMap((piece, i) =>
            i === 0
              ? [piece]
              : [
                  <mark key={i} className={styles.poseMark}>
                    {POSE_MARK}
                  </mark>,
                  piece,
                ]
          )}
        </p>
        <ul className={styles.poseList}>
          {sent.poses.frames.map(frame => (
            <li key={frame.label}>
              <span className={styles.poseLabel}>
                {POSE_NAMES[frame.label] ?? frame.label}:
              </span>{' '}
              {frame.pose}
            </li>
          ))}
        </ul>
      </>
    ) : (
      <p className={styles.promptCommon}>{sent.picture}</p>
    );
  return (
    <>
      {compact ? (
        <MuiIconButton {...triggerProps} aria-label={TITLE}>
          <FontAwesomeV6Icon iconName="circle-info" aria-hidden />
        </MuiIconButton>
      ) : (
        <MuiButton
          {...triggerProps}
          startIcon={<FontAwesomeV6Icon iconName="circle-info" aria-hidden />}
        >
          {TITLE}
        </MuiButton>
      )}
      {open && (
        <MuiDialog
          title={TITLE}
          className={styles.dialog}
          customContent={
            <div className={styles.body}>
              <div className={styles.lead}>
                {picture && (
                  <div
                    className={classNames(
                      styles.thumb,
                      picture.pixelated && styles.pixelArt,
                      // The strip is scaled so its first frame fills the
                      // box; the later frames fall past the box's right
                      // edge and are clipped.
                      picture.sheet && styles.thumbStrip
                    )}
                    style={{backgroundImage: `url(${picture.src})`}}
                    role="img"
                    aria-label={picture.name ?? 'Your picture'}
                  />
                )}
                <p id="dsco-dialog-description" className={styles.intro}>
                  We sent the AI these words. It made a picture to match them.
                  The first sentence is yours; the rest is what the lab adds
                  every time.
                </p>
              </div>
              {sent.poses && (
                <SegmentedButtons
                  size="s"
                  className={styles.views}
                  buttons={VIEWS.map(([value, label]) => ({value, label}))}
                  selectedButtonValue={view}
                  onChange={value => setView(value as View)}
                />
              )}
              {/* No tabIndex needed: browsers make a scrollable container
                  keyboard-focusable on their own. */}
              <div className={styles.promptFrame}>{promptView}</div>
            </div>
          }
          onClose={() => setOpen(false)}
          primaryButtonProps={{
            children: 'Got it',
            onClick: () => setOpen(false),
          }}
        />
      )}
    </>
  );
};

export default BehindTheScenes;
