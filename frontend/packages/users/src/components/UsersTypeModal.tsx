import {Button, DialogContentText} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUpdateUserType,
  type EmailOptIn,
  type UserType,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import EmailOptInField from './EmailOptInField';
import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

/**
 * Confirmation alertdialog for an account-type change. Committed only on
 * confirm; dismissing leaves the account unchanged. Educator accounts require a
 * cleartext email and, like legacy, an answer to the email opt-in question, so
 * becoming one prompts for both and blocks confirm until given.
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
  const [emailOptIn, setEmailOptIn] = useState<EmailOptIn>('');
  const [optInTouched, setOptInTouched] = useState(false);

  const isChangingToEducator = prospectiveType === 'teacher';
  const optInUnanswered = isChangingToEducator && emailOptIn === '';

  const close = () => {
    setEmail('');
    setEmailOptIn('');
    setOptInTouched(false);
    resetErrors();
    onClose();
  };

  // Stay open and show the error on failure; close only once the change commits.
  const handleSubmit = onSubmit(async () => {
    if (!prospectiveType) return;
    await mutation.mutateAsync(
      isChangingToEducator
        ? {
            userType: 'teacher',
            email,
            hashedEmail: hashEmail(email),
            emailOptIn,
          }
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
              email field, or on the safe Cancel — never on Confirm. */}
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              mutation.isPending ||
              (isChangingToEducator && email.trim().length === 0) ||
              optInUnanswered
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
      {isChangingToEducator && (
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
      {isChangingToEducator && (
        <EmailOptInField
          value={emailOptIn}
          onChange={setEmailOptIn}
          touched={optInTouched}
          onTouched={() => setOptInTouched(true)}
          disabled={mutation.isPending}
        />
      )}
    </FormDialog>
  );
}
