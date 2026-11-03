// The tab's right column for an image that is the student's own work: drawn
// by hand, or drawn on since a prompt made it. The words that would make a
// new picture stay out of the way, since they would replace that work;
// Replace image brings them back.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import styles from './images-tab.module.scss';

interface OwnWorkPaneProps {
  /** Width in px; it equals the preview column's width so the pane sits
      under that column's header. */
  width: number;
  /** The pixels were drawn on; otherwise the image simply has no prompt. */
  edited: boolean;
  disabled?: boolean;
  /** Bring the words back, to make a new picture in this image's place. */
  onGenerate: () => void;
  /** Open the drawing tools. */
  onDraw?: () => void;
}

const OwnWorkPane: React.FunctionComponent<OwnWorkPaneProps> = ({
  width,
  edited,
  disabled,
  onGenerate,
  onDraw,
}) => (
  <section className={styles.pane} style={{width}} aria-label="Your picture">
    <p className={styles.headline}>
      {edited ? 'Your edited image' : 'Your image'}
    </p>
    <div className={styles.paneBottom}>
      <MuiButton
        variant="outlined"
        color="secondary"
        className={styles.drawButton}
        startIcon={<FontAwesomeV6Icon iconName="sparkles" aria-hidden />}
        disabled={disabled}
        onClick={onGenerate}
      >
        Replace image
      </MuiButton>
      {onDraw && (
        <MuiButton
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeV6Icon iconName="pencil" aria-hidden />}
          disabled={disabled}
          onClick={onDraw}
        >
          Edit this image
        </MuiButton>
      )}
    </div>
  </section>
);

export default OwnWorkPane;
