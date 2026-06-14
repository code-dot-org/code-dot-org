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
