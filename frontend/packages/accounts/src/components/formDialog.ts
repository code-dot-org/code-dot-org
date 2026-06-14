import type {SxProps, Theme} from '@mui/material';

// DialogContent for a form modal: a column of fields whose DSCO inputs are
// stretched to fill the dialog (they keep a fixed width otherwise). Pair with
// <Dialog fullWidth maxWidth="xs"> so the paper has a stable width to fill.
// :not([type="radio"]) leaves radio controls alone.
export const formDialogContentSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  '&&& > *': {width: '100%', minWidth: 0},
  '&&& input:not([type="radio"])': {width: '100%'},
};

const FOCUSABLE =
  'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// MUI's FocusTrap parks initial focus on the dialog's role="presentation"
// container — outside role="dialog", so screen readers don't announce it. Once
// the open transition settles, move focus to the first control inside the paper
// (in DOM order: the first field, else the checkbox, else the safe Cancel —
// never a destructive action, which always follows Cancel). autoFocus on the
// child loses the race to the trap; this wins. Wire as the Dialog's
// TransitionProps={{onEntered: focusFirstControl}}.
export function focusFirstControl(paper: HTMLElement): void {
  paper.querySelector<HTMLElement>(FOCUSABLE)?.focus();
}
