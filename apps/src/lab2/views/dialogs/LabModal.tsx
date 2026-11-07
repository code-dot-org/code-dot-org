// The design file's Modal on the library's dialog shell: a title row with the
// close x, the content between two edge-to-edge hairlines, and the buttons
// at the end edge. The library's own Modal caps its content at a fixed
// height and keeps its hairlines inside the padding, which the lab dialogs
// cannot live with.

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React, {useId} from 'react';

import styles from './lab-modal.module.scss';

export interface LabModalProps {
  /** The title, an h2 that names the dialog. */
  title: string;
  /** The content between the hairlines; it scrolls when the window is
      short. One element in it should carry id="dsco-dialog-description",
      which the shell reads as the dialog's description. */
  children: React.ReactNode;
  /** Spread on the contained button, last in the row. */
  primaryButtonProps: MuiButtonProps;
  /** Spread on an outlined button before the primary; none without it. */
  secondaryButtonProps?: MuiButtonProps;
  /** Closes the dialog from the corner x and Escape. Without it there is
      neither: the dialog is read to the end, through its buttons. */
  onClose?: () => void;
  /** The x's name; the shell's "Close dialog" when unset. */
  closeLabel?: string;
  /** Added to the panel, to size it. */
  className?: string;
}

const LabModal: React.FunctionComponent<LabModalProps> = ({
  title,
  children,
  primaryButtonProps,
  secondaryButtonProps,
  onClose,
  closeLabel,
  className,
}) => {
  const titleId = useId();
  return (
    <MuiCustomDialog
      className={classNames(styles.modal, className)}
      onClose={onClose}
      closeLabel={closeLabel}
      aria-labelledby={titleId}
    >
      <div className={classNames(styles.header, onClose && styles.closable)}>
        <MuiTypography
          id={titleId}
          component="h2"
          variant="h4"
          className={styles.title}
        >
          {title}
        </MuiTypography>
      </div>
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>
        {secondaryButtonProps && (
          <MuiButton
            variant="outlined"
            color="secondary"
            {...secondaryButtonProps}
          />
        )}
        <MuiButton
          variant="contained"
          color="primary"
          {...primaryButtonProps}
        />
      </div>
    </MuiCustomDialog>
  );
};

export default LabModal;
