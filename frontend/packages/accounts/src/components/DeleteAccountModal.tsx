import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import {deleteAccount} from '../api/accounts.api';
import type {AccountSettings} from '../api/accounts.types';

import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Destructive delete-account alertdialog. Requires explicit acknowledgment (and
 * the password where the account has one) before DELETE /users; warns about
 * dependent students. role="alertdialog", heading as label and warning as
 * description, the password field (or checkbox) takes initial focus — not the
 * destructive button — and that button's name states the consequence.
 */
export default function DeleteAccountModal({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: AccountSettings;
}) {
  const mutation = useMutation({mutationFn: deleteAccount});
  const [password, setPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const requiresPassword = settings.hasPassword;
  const canDelete = acknowledged && (!requiresPassword || password.length > 0);

  const close = () => {
    setPassword('');
    setAcknowledged(false);
    setErrors(NO_ERRORS);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync(requiresPassword ? {password} : {});
      // The server signs the user out; leave the SPA.
      window.location.assign('/');
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  const dependents = settings.dependentStudentsCount;

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Typography variant="h2" component="h2" id="delete-account-title">
            Delete my account
          </Typography>
          <DialogContentText id="delete-account-desc">
            This permanently deletes your account
            {dependents > 0
              ? ` and the ${dependents} dependent student account${dependents === 1 ? '' : 's'} you manage`
              : ''}
            . This can’t be undone.
          </DialogContentText>
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
              {errors.formError}
            </Typography>
          )}
          {requiresPassword && (
            <TextField
              label="Password"
              name="password_confirmation"
              inputType="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              errorMessage={errors.fieldErrors.current_password?.[0]}
              aria-invalid={
                errors.fieldErrors.current_password ? true : undefined
              }
            />
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={event => setAcknowledged(event.target.checked)}
              />
            }
            label="I understand this is permanent."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={!canDelete || mutation.isPending}
          >
            Delete my account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
