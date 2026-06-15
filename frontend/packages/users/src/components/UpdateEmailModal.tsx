import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {DashboardApiClient, useUpdateEmail} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import {focusFirstControl, formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useToast} from './Toast';
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
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="update-email-title"
      slotProps={{transition: {onEntered: focusFirstControl}}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="update-email-title">Update email</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
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
            aria-invalid={
              errors.fieldErrors.current_password ? true : undefined
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
            Update email
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
