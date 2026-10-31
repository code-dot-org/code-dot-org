// The tab's right column while a picture is drawn: what is being drawn,
// and the way out, done or not.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {imageKindLabel, ImageSubject, ImageType} from '../../ai/images/types';

import styles from './images-tab.module.scss';

interface DrawPaneProps {
  /** The pane's width, px: the preview column's. */
  width: number;
  kind: {imageType: ImageType; subject?: ImageSubject};
  /** The drawing is over an image that exists, not a blank. */
  editing: boolean;
  /** The drawing is one frame of a character set, named for its pose. */
  frameLabel?: string;
  /** A stroke has landed since the drawing opened. */
  edited: boolean;
  saving: boolean;
  /** Keep what is drawn and leave the tools. */
  onDone: () => void;
  /** Leave the tools; a blank is dropped, an image keeps its last save. */
  onCancel: () => void;
}

const DrawPane: React.FunctionComponent<DrawPaneProps> = ({
  width,
  kind,
  editing,
  frameLabel,
  edited,
  saving,
  onDone,
  onCancel,
}) => {
  const kindLabel = imageKindLabel(kind.imageType, kind.subject).toLowerCase();
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
          : `Draw your ${kindLabel}.`}
      </p>
      <div className={styles.paneBottom}>
        <MuiButton
          variant="outlined"
          color="secondary"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          className={styles.generateButton}
          startIcon={<FontAwesomeV6Icon iconName="check" aria-hidden />}
          disabled={saving || (!editing && !edited)}
          onClick={onDone}
        >
          {editing ? 'Done editing' : 'Done drawing'}
        </MuiButton>
      </div>
    </section>
  );
};

export default DrawPane;
