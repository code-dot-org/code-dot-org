import {Box, Button, DialogContentText, Typography} from '@mui/material';
import {useState} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import Link from '@code-dot-org/component-library/link';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {
  DashboardApiClient,
  useUpdateUserType,
  type EmailOptIn,
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
 * confirm; dismissing leaves the account unchanged. Educator accounts require a
 * cleartext email, so becoming one prompts for it and blocks confirm until given.
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

  const isChangingToEducator = prospectiveType === 'teacher';

  const close = () => {
    setEmail('');
    setEmailOptIn('');
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
              (isChangingToEducator &&
                (email.trim().length === 0 || emailOptIn === ''))
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
        /* A radiogroup named by the question, not a fieldset/legend: the
           privacy link inside a legend would be flattened into the group's name
           and announced with every radio. The link follows the group so reading
           and tab order reach the answer before the aside. */
        <Box>
          <Typography
            id="account-type-optin-question"
            variant="body2"
            component="div"
            sx={{mb: 1}}
          >
            Can we email you about updates to our courses, local opportunities,
            or other computer science news?
          </Typography>
          <Box
            role="radiogroup"
            aria-labelledby="account-type-optin-question"
            sx={{display: 'flex', gap: 3}}
          >
            <RadioButton
              name="email_preference_opt_in"
              value="yes"
              label="Yes"
              checked={emailOptIn === 'yes'}
              onChange={event =>
                setEmailOptIn(event.target.value as EmailOptIn)
              }
              disabled={mutation.isPending}
            />
            <RadioButton
              name="email_preference_opt_in"
              value="no"
              label="No"
              checked={emailOptIn === 'no'}
              onChange={event =>
                setEmailOptIn(event.target.value as EmailOptIn)
              }
              disabled={mutation.isPending}
            />
          </Box>
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
