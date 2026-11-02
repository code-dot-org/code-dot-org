// The lab's dialogs, on the design system's base dialog: a title at a size
// that fits a lab, a body the caller fills, and a footer with the buttons at
// the right. The caller's body carries the element with id
// dsco-dialog-description that the base dialog reads to screen readers.

import {MuiCustomDialog} from '@code-dot-org/component-library/dialog';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './lab-dialog.module.scss';

interface LabDialogProps {
  title: string;
  children: React.ReactNode;
  /** The main button, at the far right. */
  primaryButtonProps: MuiButtonProps;
  /** The other button, left of the main one. */
  secondaryButtonProps?: MuiButtonProps;
  /** The corner x and Escape; absent, the buttons are the only way out. */
  onClose?: () => void;
  className?: string;
}

const LabDialog: React.FunctionComponent<LabDialogProps> = ({
  title,
  children,
  primaryButtonProps,
  secondaryButtonProps,
  onClose,
  className,
}) => (
  <MuiCustomDialog
    role="alertdialog"
    aria-label={title}
    onClose={onClose}
    className={classNames(styles.dialog, className)}
  >
    <MuiTypography component="h2" variant="h5" className={styles.title}>
      {title}
    </MuiTypography>
    <div className={styles.body}>{children}</div>
    <div className={styles.footer}>
      {secondaryButtonProps && (
        <MuiButton
          variant="outlined"
          color="secondary"
          {...secondaryButtonProps}
        />
      )}
      <MuiButton variant="contained" color="primary" {...primaryButtonProps} />
    </div>
  </MuiCustomDialog>
);

export default LabDialog;
