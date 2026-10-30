import {Button} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {DashboardApiClient, useUpdatePassword} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/** Update-password modal; field errors land inline, everything else form-level. */
export default function UpdatePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useUpdatePassword(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const close = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync({
      currentPassword,
      newPassword,
      newPasswordConfirmation: confirmPassword,
    });
    toast('Password updated.');
    close();
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="update-password-title"
      title="Update password"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Update password
          </Button>
        </>
      }
    >
      <FormError message={errors.formError} />
      <TextField
        label="Current password"
        name="current_password"
        inputType="password"
        value={currentPassword}
        onChange={event => setCurrentPassword(event.target.value)}
        errorMessage={errors.fieldErrors.current_password?.[0]}
        aria-invalid={errors.fieldErrors.current_password ? true : undefined}
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
    </FormDialog>
  );
}
