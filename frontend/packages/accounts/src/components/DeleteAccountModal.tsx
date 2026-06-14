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
} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useDeleteAccount,
  type AccountSettings,
} from '@code-dot-org/core/api';

import {formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useModalForm} from './useModalForm';

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
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [password, setPassword] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const requiresPassword = settings.hasPassword;
  const canDelete = acknowledged && (!requiresPassword || password.length > 0);

  const close = () => {
    setPassword('');
    setAcknowledged(false);
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync(requiresPassword ? {password} : {});
    // The server signs the user out; leave the SPA.
    window.location.assign('/');
  });

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
          <FormError message={errors.formError} />
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
