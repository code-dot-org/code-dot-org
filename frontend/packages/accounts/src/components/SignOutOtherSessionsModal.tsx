import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useState, type FormEvent} from 'react';

import {
  DashboardApiClient,
  useSignOutOtherSessions,
} from '@code-dot-org/core/api';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';
import {useToast} from './Toast';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

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
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const close = () => {
    setErrors(NO_ERRORS);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation(); // keep this submit off the page form (portal bubbles)
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync();
      toast('Signed out of all other sessions.');
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="sign-out-sessions-title"
      aria-describedby="sign-out-sessions-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
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
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
              {errors.formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {/* First in DOM order, so MUI's focus trap lands here on open. */}
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
