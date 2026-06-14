import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {DashboardApiClient, useCreatePassword} from '@code-dot-org/core/api';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';
import {useToast} from './Toast';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/** Create-password modal for SSO-only accounts (no current password to confirm). */
export default function CreatePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useCreatePassword(DashboardApiClient);
  const toast = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const close = () => {
    setNewPassword('');
    setConfirmPassword('');
    setErrors(NO_ERRORS);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync({
        newPassword,
        newPasswordConfirmation: confirmPassword,
      });
      toast('Password created.');
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
      aria-labelledby="create-password-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="create-password-title">Create password</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
              {errors.formError}
            </Typography>
          )}
          <TextField
            label="New password"
            name="password"
            inputType="password"
            value={newPassword}
            onChange={event => setNewPassword(event.target.value)}
            errorMessage={errors.fieldErrors.password?.[0]}
            aria-invalid={errors.fieldErrors.password ? true : undefined}
          />
          <TextField
            label="Confirm new password"
            name="password_confirmation"
            inputType="password"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            errorMessage={errors.fieldErrors.password_confirmation?.[0]}
            aria-invalid={
              errors.fieldErrors.password_confirmation ? true : undefined
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Create password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
