// The tab's right column while a picture is drawn. By default the tools
// are simply how the student's own work is shown: every pause saves, so
// there is nothing to finish, and the one button leads to the words that
// would replace the work. In the older modes the pane holds Done.

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
  /** A stroke has landed since the drawing opened. */
  edited: boolean;
  /** The tools are the image's own view: no Done, Replace image instead. */
  paints?: boolean;
  /** Words for the top of the pane instead of the usual ones. */
  headline?: string;
  /** Keep what is drawn and leave the tools. */
  onDone: () => void;
  /** Leave the tools for the words, to make a picture in this one's place. */
  onReplace?: () => void;
}

const DrawPane: React.FunctionComponent<DrawPaneProps> = ({
  width,
  kind,
  editing,
  edited,
  paints,
  headline,
  onDone,
  onReplace,
}) => {
  const kindLabel = imageKindLabel(kind.imageType, kind.subject).toLowerCase();
  return (
    <section
      className={styles.pane}
      style={{width}}
      aria-label={editing ? 'Edit your picture' : 'Draw your picture'}
    >
      <p className={styles.headline}>
        {headline ?? (editing ? 'Edit this image.' : `Draw your ${kindLabel}.`)}
      </p>
      <div className={styles.paneBottom}>
        {paints ? (
          onReplace && (
            <MuiButton
              variant="outlined"
              color="secondary"
              className={styles.drawButton}
              startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
              onClick={onReplace}
            >
              {editing ? 'Replace image' : 'Use words instead'}
            </MuiButton>
          )
        ) : (
          <MuiButton
            variant="contained"
            color="primary"
            className={styles.generateButton}
            startIcon={<FontAwesomeV6Icon iconName="check" aria-hidden />}
            disabled={!editing && !edited}
            onClick={onDone}
          >
            {editing ? 'Done editing' : 'Done drawing'}
          </MuiButton>
        )}
      </div>
    </section>
  );
};

export default DrawPane;
