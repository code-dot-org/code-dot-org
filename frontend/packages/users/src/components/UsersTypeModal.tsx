import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useUpdateUserType,
  type UserType,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import {focusFirstControl, formDialogContentSx} from './formDialog';
import FormError from './FormError';
import {useToast} from './Toast';
import {useModalForm} from './useModalForm';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

/**
 * Confirmation alertdialog for an account-type change. Committed only on
 * confirm; dismissing leaves the account unchanged. Upgrading to an educator
 * account requires a cleartext email, so that case prompts for one.
 */
export default function UsersTypeModal({
  open,
  prospectiveType,
  onClose,
}: {
  open: boolean;
  prospectiveType: UserType | null;
  onClose: () => void;
}) {
  const mutation = useUpdateUserType(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');

  const isUpgrade = prospectiveType === 'teacher';

  const close = () => {
    setEmail('');
    resetErrors();
    onClose();
  };

  // Stay open and show the error on failure; close only once the change commits.
  const handleSubmit = onSubmit(async () => {
    if (!prospectiveType) return;
    await mutation.mutateAsync(
      isUpgrade
        ? {userType: 'teacher', email, hashedEmail: hashEmail(email)}
        : {userType: prospectiveType},
    );
    toast(`Account type changed to ${TYPE_LABEL[prospectiveType]}.`);
    close();
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="account-type-title"
      aria-describedby="account-type-desc"
      slotProps={{
        paper: {role: 'alertdialog'},
        transition: {onEntered: focusFirstControl},
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="account-type-title">Change account type?</DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          <DialogContentText id="account-type-desc">
            Changing your account type
            {prospectiveType ? ` to ${TYPE_LABEL[prospectiveType]}` : ''} can
            affect your sections, students, and other account data, and may not
            be reversible.
          </DialogContentText>
          <FormError message={errors.formError} />
          {isUpgrade && (
            <TextField
              label="Email address"
              name="email"
              inputType="email"
              autoComplete="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              errorMessage={errors.fieldErrors.email?.[0]}
              aria-invalid={errors.fieldErrors.email ? true : undefined}
              helperMessage="Educator accounts need an email address."
            />
          )}
        </DialogContent>
        <DialogActions>
          {/* focusFirstControl lands initial focus on the email field when
              upgrading, otherwise the safe Cancel — never Confirm. */}
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              mutation.isPending || (isUpgrade && email.trim().length === 0)
            }
          >
            {prospectiveType
              ? `Change to ${TYPE_LABEL[prospectiveType]}`
              : 'Confirm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
