import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import type {FormEventHandler, ReactNode} from 'react';
import {tabbable} from 'tabbable';

import styles from './FormDialog.module.css';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Title element id, wired to aria-labelledby. */
  titleId: string;
  title: ReactNode;
  /** Describing element id, wired to aria-describedby. */
  describedById?: string;
  /** Render the paper as role="alertdialog" for destructive/confirmation flows. */
  alert?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** DialogActions content (buttons). */
  actions: ReactNode;
  /** DialogContent body (fields or description). */
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
        // MUI's FocusTrap focuses the dialog's presentation container on open,
        // not a control in the labelled role="dialog" Paper, so a screen reader
        // may not announce it; autoFocus races the trap (mui#33004). onEntered
        // fires after the trap settles -- focus the first tabbable element then.
        // displayCheck:'none' skips tabbable's visibility test, which a layout-
        // less DOM (jsdom) fails, so the same shim runs under test and browser.
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
