// How the picture came to be, told once over four panels after a student's
// first picture of a kind: nothing closes it but reading to the end.

import {MuiCustomDialog as CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';

import ChunkyPicture from './ChunkyPicture';

import styles from './learning-dialog.module.scss';

export interface LearningPicture {
  src: string;
  /** A sheet's first frame; the whole image when unset. */
  crop?: {width: number; height: number};
}

interface LearningDialogProps {
  picture: LearningPicture;
  /** The student's words. */
  prompt: string;
  onDone: () => void;
}

const TITLE = 'How AI made your image';
// Cells across the picture at each stage of the guess.
const GUESS_STAGES = [4, 12] as const;
// Pictures in the training mosaic.
const MOSAIC_CELLS = 12;

interface PanelContent {
  text: string;
  visual: (picture: LearningPicture, prompt: string) => React.ReactNode;
}

const PANELS: PanelContent[] = [
  {
    text: 'First, the AI learned from millions of pictures. It noticed patterns: what cats look like, what castles look like, what pixel art looks like.',
    visual: () => (
      <div className={styles.mosaic} aria-hidden>
        {Array.from({length: MOSAIC_CELLS}, (_, i) => (
          <span
            key={i}
            className={styles.mosaicCell}
            style={{animationDelay: `${i * 90}ms`}}
          >
            <FontAwesomeV6Icon iconName="image" />
          </span>
        ))}
      </div>
    ),
  },
  {
    text: 'Then it read your words. Every word nudges the picture one way or another.',
    visual: (_, prompt) => (
      <p className={styles.words}>
        <span className={styles.quote}>“</span>
        {prompt}
        <span className={styles.quote}>”</span>
      </p>
    ),
  },
  {
    text: 'It predicted the picture one pixel at a time, from a rough guess to a sharp one.',
    visual: picture => (
      <div className={styles.stages}>
        {GUESS_STAGES.map(cells => (
          <ChunkyPicture
            key={cells}
            src={picture.src}
            cells={cells}
            crop={picture.crop}
          />
        ))}
        <ChunkyPicture src={picture.src} crop={picture.crop} />
      </div>
    ),
  },
  {
    text: 'Every time you press Generate, the AI makes a new guess. The same words can give a different picture.',
    visual: picture => (
      <div className={styles.guess}>
        <ChunkyPicture src={picture.src} crop={picture.crop} />
        <FontAwesomeV6Icon
          iconName="dice"
          className={styles.dice}
          aria-hidden
        />
      </div>
    ),
  },
];

const LearningDialog: React.FunctionComponent<LearningDialogProps> = ({
  picture,
  prompt,
  onDone,
}) => {
  const mode = useThemeMode();
  const [index, setIndex] = useState(0);
  const last = index === PANELS.length - 1;
  const panel = PANELS[index];
  return (
    <div className={styles.host}>
      <CustomDialog aria-label={TITLE} mode={mode} className={styles.dialog}>
        <span id="dsco-dialog-description" className={styles.srOnly}>
          Four short panels on how the AI made your picture. Next moves on; Got
          it closes.
        </span>
        <h2 className={styles.title}>{TITLE}</h2>
        <div key={index} className={styles.panel}>
          <div className={styles.visual}>{panel.visual(picture, prompt)}</div>
          <p className={styles.text}>{panel.text}</p>
        </div>
        <div className={styles.footer}>
          <div className={styles.dots} aria-hidden>
            {PANELS.map((_, i) => (
              <span
                key={i}
                className={classNames(styles.dot, i === index && styles.dotNow)}
              />
            ))}
          </div>
          <span className={styles.srOnly} role="status">
            Step {index + 1} of {PANELS.length}
          </span>
          <div className={styles.buttons}>
            {index > 0 && (
              <MuiButton
                variant="outlined"
                color="secondary"
                onClick={() => setIndex(i => i - 1)}
              >
                Back
              </MuiButton>
            )}
            <MuiButton
              variant="contained"
              color="primary"
              onClick={() => (last ? onDone() : setIndex(i => i + 1))}
            >
              {last ? 'Got it' : 'Next'}
            </MuiButton>
          </div>
        </div>
      </CustomDialog>
    </div>
  );
};

export default LearningDialog;
