import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useUpdateParentEmail,
  type ParentEmailOptIn,
} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

const MISMATCH = 'The email addresses don’t match.';

/**
 * Adds or updates a student's parent/guardian email. The two address fields
 * must match before the request fires; the opt-in question is left to the
 * parent and defaults to unanswered.
 */
export default function ParentEmailModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useUpdateParentEmail(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [optIn, setOptIn] = useState<ParentEmailOptIn>('');
  const [mismatch, setMismatch] = useState(false);

  const close = () => {
    setEmail('');
    setConfirmEmail('');
    setOptIn('');
    resetErrors();
    setMismatch(false);
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    if (email !== confirmEmail) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    await mutation.mutateAsync({parentEmail: email, optIn});
    toast('Parent/guardian email updated.');
    close();
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="parent-email-title"
      title="Update parent/guardian email address"
      describedById="parent-email-desc"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Update
          </Button>
        </>
      }
    >
      <Typography id="parent-email-desc" variant="body2">
        This email address will have the ability to recover or reset this
        account’s password.
      </Typography>
      <FormError message={errors.formError} />
      <TextField
        label="Parent/guardian email address"
        name="parent_email"
        inputType="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        errorMessage={errors.fieldErrors.parent_email?.[0]}
        aria-invalid={errors.fieldErrors.parent_email ? true : undefined}
        autoComplete="off"
        data-1p-ignore
      />
      <TextField
        label="Confirm parent/guardian email address"
        name="parent_email_confirmation"
        inputType="email"
        value={confirmEmail}
        onChange={event => setConfirmEmail(event.target.value)}
        errorMessage={mismatch ? MISMATCH : undefined}
        aria-invalid={mismatch || undefined}
        autoComplete="off"
        data-1p-ignore
      />
      {/* radiogroup named by BOTH the qualifier and the consent question,
          so a screen reader hears what it's answering — not just the
          "For parent/guardian only" qualifier. */}
      <Box>
        <Typography
          id="parent-optin-qualifier"
          variant="body2"
          sx={{fontWeight: 600, mb: 0.5}}
        >
          For parent/guardian only
        </Typography>
        <Typography id="parent-optin-question" variant="body2" sx={{mb: 1}}>
          Only answer the question below if the email address above belongs to
          you. Can we email you with occasional updates on your child’s
          progress, projects, and course?
        </Typography>
        <Box
          role="radiogroup"
          aria-labelledby="parent-optin-qualifier parent-optin-question"
          sx={{display: 'flex', gap: 3}}
        >
          <RadioButton
            name="parent_email_opt_in"
            value="yes"
            label="Yes"
            checked={optIn === 'yes'}
            onChange={event => setOptIn(event.target.value as ParentEmailOptIn)}
          />
          <RadioButton
            name="parent_email_opt_in"
            value="no"
            label="No"
            checked={optIn === 'no'}
            onChange={event => setOptIn(event.target.value as ParentEmailOptIn)}
          />
        </Box>
      </Box>
    </FormDialog>
  );
}
