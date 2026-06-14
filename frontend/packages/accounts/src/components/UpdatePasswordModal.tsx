import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import {updatePassword} from '../api/accounts.api';

import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Update-password modal. A validation error stays open and shows against the
 * offending field; a network failure shows a form-level message, input preserved.
 */
export default function UpdatePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useMutation({mutationFn: updatePassword});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const close = () => {
    setCurrentPassword('');
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
        currentPassword,
        newPassword,
        newPasswordConfirmation: confirmPassword,
      });
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  return (
    <Dialog open={open} onClose={close} aria-labelledby="update-password-title">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="update-password-title">Update password</DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
              {errors.formError}
            </Typography>
          )}
          <TextField
            label="Current password"
            name="current_password"
            inputType="password"
            value={currentPassword}
            onChange={event => setCurrentPassword(event.target.value)}
            errorMessage={errors.fieldErrors.current_password?.[0]}
            aria-invalid={
              errors.fieldErrors.current_password ? true : undefined
            }
          />
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
            Update password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
