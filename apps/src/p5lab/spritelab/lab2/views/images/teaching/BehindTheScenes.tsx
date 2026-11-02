// The way behind a made picture: a button that opens a dialog with the
// picture and the words the model got, and for a set a second view with the
// posed frames' words.

import {MuiDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

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
  /** A character set: the strip's first frame stands for it, still. */
  sheet?: {frameSize: {x: number; y: number}} | null;
}

interface BehindTheScenesProps {
  sent: SentPrompts;
  picture?: BehindTheScenesPicture;
  disabled?: boolean;
  /** The icon alone, for a header with no room for the words. */
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
  const show = () => {
    setView('picture');
    setOpen(true);
  };
  const words =
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
        <MuiIconButton
          variant="text"
          color="tertiary"
          size="small"
          aria-label={TITLE}
          disabled={disabled}
          onClick={show}
        >
          <FontAwesomeV6Icon iconName="circle-info" aria-hidden />
        </MuiIconButton>
      ) : (
        <MuiButton
          variant="text"
          color="tertiary"
          size="small"
          startIcon={<FontAwesomeV6Icon iconName="circle-info" aria-hidden />}
          disabled={disabled}
          onClick={show}
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
                      picture.pixelated && styles.pixelArt
                    )}
                    style={{
                      backgroundImage: `url(${picture.src})`,
                      // A strip's first frame fills the box; the rest lies
                      // off its right edge.
                      backgroundSize: picture.sheet ? 'auto 100%' : 'contain',
                    }}
                    aria-hidden
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
              {/* A scrolling box; the browser lets the keyboard reach it. */}
              <div className={styles.promptFrame}>{words}</div>
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
