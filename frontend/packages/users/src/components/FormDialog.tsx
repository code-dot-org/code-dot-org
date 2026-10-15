import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import type {FormEventHandler, ReactNode} from 'react';
import {tabbable} from 'tabbable';

import styles from './FormDialog.module.css';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: ReactNode;
  describedById?: string;
  /** Renders the paper as role="alertdialog", for destructive confirmations. */
  alert?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  actions: ReactNode;
  children: ReactNode;
}

/**
 * A form modal: a MUI Dialog with the standard title / stretched-content /
 * actions layout shared by the account modals, focusing the first field on open.
 */
export default function FormDialog({
  open,
  onClose,
  titleId,
  title,
  describedById,
  alert = false,
  onSubmit,
  actions,
  children,
}: FormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      aria-describedby={describedById}
      slotProps={{
        ...(alert && {paper: {role: 'alertdialog'}}),
        // MUI's FocusTrap focuses the presentation container, not a control in
        // the labelled Paper, so a screen reader may not announce the dialog;
        // autoFocus races the trap (mui#33004), but onEntered fires after it
        // settles. displayCheck:'none' skips tabbable's visibility test, which
        // a layout-less DOM (jsdom) fails, so one shim serves test and browser.
        transition: {
          onEntered: node => tabbable(node, {displayCheck: 'none'})[0]?.focus(),
        },
      }}
    >
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogContent className={styles.content}>{children}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </form>
    </Dialog>
  );
}
