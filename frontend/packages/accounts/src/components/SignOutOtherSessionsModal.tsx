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

import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Confirms signing out every other browser/device. Reversible, so the confirm
 * button is neutral (not destructive) and Cancel takes initial focus.
 */
export default function SignOutOtherSessionsModal({
  open,
  onClose,
  onSignedOut,
}: {
  open: boolean;
  onClose: () => void;
  onSignedOut: () => void;
}) {
  const mutation = useSignOutOtherSessions(DashboardApiClient);
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const close = () => {
    setErrors(NO_ERRORS);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync();
      onSignedOut();
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="sign-out-sessions-title"
      aria-describedby="sign-out-sessions-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="sign-out-sessions-title">
          Sign out all other sessions
        </DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
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
