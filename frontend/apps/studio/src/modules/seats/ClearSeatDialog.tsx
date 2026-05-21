/**
 * ClearSeatDialog — confirm before clearing a seat and all its progress.
 *
 * Wraps MUI Dialog with a two-button layout: "Cancel" (safe) and "Clear"
 * (destructive, styled in error color).  Caller owns the open/close state.
 */

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export interface ClearSeatDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Display name of the seat being cleared (e.g. "Red", "Blue"). */
  seatLabel: string;
  /** Called when the user confirms the destructive action. */
  onConfirm: () => void;
  /** Called when the user cancels or dismisses. */
  onCancel: () => void;
}

/** Destructive-confirm dialog for clearing a learner seat. */
export function ClearSeatDialog({
  open,
  seatLabel,
  onConfirm,
  onCancel,
}: ClearSeatDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="clear-seat-title">
      <DialogTitle id="clear-seat-title">Clear {seatLabel} seat?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          All progress for this learner will be permanently deleted. This cannot
          be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{padding: 2, gap: 1}}>
        <Button
          variant="outlined"
          onClick={onCancel}
          data-testid="clear-seat-cancel"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          data-testid="clear-seat-confirm"
        >
          Clear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
