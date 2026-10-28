import {Button} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUpdateEmail,
  type EmailOptIn,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import EmailOptInField from './EmailOptInField';
import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/**
 * Update-email modal; a failure stays open so the typed input survives. Like
 * legacy, a teacher must also answer the email opt-in question.
 */
export default function UpdateEmailModal({
  open,
  onClose,
  isTeacher,
}: {
  open: boolean;
  onClose: () => void;
  isTeacher: boolean;
}) {
  const mutation = useUpdateEmail(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [optIn, setOptIn] = useState<EmailOptIn>('');
  const [optInTouched, setOptInTouched] = useState(false);
  const optInUnanswered = isTeacher && optIn === '';

  const close = () => {
    setEmail('');
    setCurrentPassword('');
    setOptIn('');
    setOptInTouched(false);
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync({
      newEmail: email,
      hashedEmail: hashEmail(email),
      currentPassword,
      emailOptIn: optIn,
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
            disabled={mutation.isPending || optInUnanswered}
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
      {isTeacher && (
        <EmailOptInField
          value={optIn}
          onChange={setOptIn}
          touched={optInTouched}
          onTouched={() => setOptInTouched(true)}
          disabled={mutation.isPending}
        />
      )}
    </FormDialog>
  );
}
