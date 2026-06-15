import {Button, DialogContentText} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUpdateUserType,
  type UserType,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import FormDialog from './FormDialog';
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
    <FormDialog
      open={open}
      onClose={close}
      titleId="account-type-title"
      title="Change account type?"
      describedById="account-type-desc"
      alert
      onSubmit={handleSubmit}
      actions={
        <>
          {/* Cancel precedes Confirm so the dialog's initial focus lands on the
              email field (when upgrading) or the safe Cancel — never Confirm. */}
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
        </>
      }
    >
      <DialogContentText id="account-type-desc">
        Changing your account type
        {prospectiveType ? ` to ${TYPE_LABEL[prospectiveType]}` : ''} can affect
        your sections, students, and other account data, and may not be
        reversible.
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
    </FormDialog>
  );
}
