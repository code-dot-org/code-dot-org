import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import Link from '@code-dot-org/component-library/link';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {
  DashboardApiClient,
  useUpdateEmail,
  type EmailOptIn,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

const OPT_IN_REQUIRED = 'This field is required.';

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
  const {errors, setErrors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [optIn, setOptIn] = useState<EmailOptIn>('');
  const optInError = errors.fieldErrors.email_preference_opt_in?.[0];

  const close = () => {
    setEmail('');
    setCurrentPassword('');
    setOptIn('');
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    if (isTeacher && !optIn) {
      setErrors({
        fieldErrors: {email_preference_opt_in: [OPT_IN_REQUIRED]},
        formError: null,
      });
      return;
    }
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
            disabled={mutation.isPending}
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
        // The privacy link follows the group so it is not folded into the
        // radiogroup's accessible name, as in ParentEmailModal.
        <Box>
          <Typography
            id="email-optin-question"
            variant="body2"
            component="div"
            sx={{mb: 1}}
          >
            Can we email you about updates to our courses, local opportunities,
            or other computer science news?
          </Typography>
          <Box
            role="radiogroup"
            aria-labelledby="email-optin-question"
            aria-describedby={optInError ? 'email-optin-error' : undefined}
            aria-invalid={optInError ? true : undefined}
          >
            <RadioButton
              name="email_opt_in"
              value="yes"
              label="Yes"
              checked={optIn === 'yes'}
              onChange={event => setOptIn(event.target.value as EmailOptIn)}
              disabled={mutation.isPending}
            />
            <RadioButton
              name="email_opt_in"
              value="no"
              label="No"
              checked={optIn === 'no'}
              onChange={event => setOptIn(event.target.value as EmailOptIn)}
              disabled={mutation.isPending}
            />
          </Box>
          {optInError && (
            <Typography
              id="email-optin-error"
              variant="body3"
              component="div"
              sx={{color: 'var(--text-error-primary)', mt: 0.5}}
            >
              {optInError}
            </Typography>
          )}
          <Typography variant="body2" component="div" sx={{mt: 1}}>
            <Link href={siteConfig.marketingUrl('/privacy')} openInNewTab>
              (See our privacy policy)
            </Link>
          </Typography>
        </Box>
      )}
    </FormDialog>
  );
}
