import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import {
  DashboardApiClient,
  useSignOutOtherSessions,
} from '@code-dot-org/core/api';

import {focusFirstControl, formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useToast} from './Toast';
import {useModalForm} from './useModalForm';

/**
 * Confirms signing out every other browser/device. Reversible, so the confirm
 * button is neutral (not destructive) and Cancel takes initial focus.
 */
export default function SignOutOtherSessionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useSignOutOtherSessions(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();

  const close = () => {
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync();
    toast('Signed out of all other sessions.');
    close();
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="sign-out-sessions-title"
      aria-describedby="sign-out-sessions-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
      TransitionProps={{onEntered: focusFirstControl}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="sign-out-sessions-title">
          Sign out all other sessions
        </DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          <DialogContentText id="sign-out-sessions-desc">
            This signs you out on every other browser and device. You’ll stay
            signed in here.
          </DialogContentText>
          <FormError message={errors.formError} />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Sign out all other sessions
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
