import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {DashboardApiClient, useCreatePassword} from '@code-dot-org/core/api';

import {focusFirstControl, formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useToast} from './Toast';
import {useModalForm} from './useModalForm';

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
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const close = () => {
    setNewPassword('');
    setConfirmPassword('');
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync({
      newPassword,
      newPasswordConfirmation: confirmPassword,
    });
    toast('Password created.');
    close();
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="create-password-title"
      slotProps={{transition: {onEntered: focusFirstControl}}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="create-password-title">Create password</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          <FormError message={errors.formError} />
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
