// The tab's right column while the student draws: a heading and a Done
// button. There is no Cancel: strokes are kept as made, and the editor's
// undo reverses them.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {
  ImageKind,
  imageKindNoun,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import styles from './images-tab.module.scss';

interface DrawPaneProps {
  /** Width in px; it equals the preview column's width so the pane sits
      under that column's header. */
  width: number;
  kind: ImageKind;
  /** The drawing is over an image that exists, not a blank. */
  editing: boolean;
  /** The drawing is one frame of a character set, named for its pose. */
  frameLabel?: string;
  /** The student has drawn at least one stroke since the tools opened. */
  edited: boolean;
  /** Keep what is drawn and leave the tools. */
  onDone: () => void;
}

const DrawPane: React.FunctionComponent<DrawPaneProps> = ({
  width,
  kind,
  editing,
  frameLabel,
  edited,
  onDone,
}) => {
  const kindNoun = imageKindNoun(kind.imageType, kind.subject);
  return (
    <section
      className={styles.pane}
      style={{width}}
      aria-label={editing ? 'Edit your picture' : 'Draw your picture'}
    >
      <p className={styles.headline}>
        {frameLabel
          ? `Edit the ${frameLabel.toLowerCase()} frame.`
          : editing
          ? 'Edit this image.'
          : `Draw your ${kindNoun}.`}
      </p>
      <div className={styles.paneBottom}>
        <MuiButton
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeV6Icon iconName="check" aria-hidden />}
          disabled={!editing && !edited}
          onClick={onDone}
        >
          {editing ? 'Done editing' : 'Done drawing'}
        </MuiButton>
      </div>
    </section>
  );
};

export default DrawPane;
