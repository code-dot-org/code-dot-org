import {Button} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {DashboardApiClient, useCreatePassword} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
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
    <FormDialog
      open={open}
      onClose={close}
      titleId="create-password-title"
      title="Create password"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Create password
          </Button>
        </>
      }
    >
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
    </FormDialog>
  );
}
