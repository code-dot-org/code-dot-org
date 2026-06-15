import {Button} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {DashboardApiClient, useUpdateEmail} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/**
 * Update-email modal. On success the settings query is invalidated so the
 * displayed email refreshes; on failure it stays open with the server's error
 * and the input preserved.
 */
export default function UpdateEmailModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useUpdateEmail(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const close = () => {
    setEmail('');
    setCurrentPassword('');
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync({
      newEmail: email,
      hashedEmail: hashEmail(email),
      currentPassword,
    });
    toast('Email updated.');
    close();
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="update-email-title"
      title="Update email"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Update email
          </Button>
        </>
      }
    >
      <FormError message={errors.formError} />
      <TextField
        label="New email"
        name="email"
        inputType="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        errorMessage={errors.fieldErrors.email?.[0]}
        aria-invalid={errors.fieldErrors.email ? true : undefined}
      />
      <TextField
        label="Current password"
        name="current_password"
        inputType="password"
        value={currentPassword}
        onChange={event => setCurrentPassword(event.target.value)}
        errorMessage={errors.fieldErrors.current_password?.[0]}
        aria-invalid={errors.fieldErrors.current_password ? true : undefined}
      />
    </FormDialog>
  );
}
