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
import {DashboardApiClient, useUpdateEmail} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';
import {useToast} from './Toast';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

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
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const close = () => {
    setEmail('');
    setCurrentPassword('');
    setErrors(NO_ERRORS);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation(); // keep this submit off the page form (portal bubbles)
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync({
        newEmail: email,
        hashedEmail: hashEmail(email),
        currentPassword,
      });
      toast('Email updated.');
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
      aria-labelledby="update-email-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="update-email-title">Update email</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
              {errors.formError}
            </Typography>
          )}
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
