/* eslint-disable jsx-a11y/no-autofocus -- this modal moves initial focus to a control inside the dialog on open (WAI-ARIA dialog pattern); MUI's default focuses an unannounced wrapper outside role="dialog" */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useDeleteAccount,
  type AccountSettings,
} from '@code-dot-org/core/api';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Destructive delete-account alertdialog. Requires explicit acknowledgment (and
 * the password where the account has one) before DELETE /users. The password
 * field or checkbox takes initial focus, never the destructive button, whose
 * name states the consequence.
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
  const mutation = useDeleteAccount(DashboardApiClient);
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
    event.stopPropagation(); // keep this submit off the page form (portal bubbles)
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
      fullWidth
      maxWidth="xs"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="delete-account-title">Delete my account</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
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
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              errorMessage={errors.fieldErrors.current_password?.[0]}
              aria-invalid={
                errors.fieldErrors.current_password ? true : undefined
              }
              autoFocus
            />
          )}
          {/* Initial focus lands inside the dialog (so it's announced) on a safe
              control — the password or this checkbox, never the delete button. */}
          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={event => setAcknowledged(event.target.checked)}
                autoFocus={!requiresPassword}
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
