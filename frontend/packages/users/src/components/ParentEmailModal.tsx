import {Box, Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';
import {z} from 'zod';

import {FormError} from '@code-dot-org/component-library/form';
import Link from '@code-dot-org/component-library/link';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {useToast} from '@code-dot-org/component-library/toast';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {
  DashboardApiClient,
  useUpdateParentEmail,
  type ParentEmailOptIn,
} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

const REQUIRED = 'An email address is required.';
const INVALID = 'The email address you provided is not valid.';
const MUST_DIFFER = 'New email address must not match old email address.';
const MUST_MATCH = 'Email addresses must match.';
const MAX_LENGTH = 255;

// zod matches the legacy RFC-5322 regex and its domain rules on every case we
// compared, including rejecting `a@localhost` and `a@b.c`.
const EMAIL = z.email();

/** Legacy's rules in legacy's order, so a given input yields the same message. */
function addressError(
  address: string,
  currentParentEmail?: string | null,
): string | null {
  const trimmed = address.trim();
  if (!trimmed) return REQUIRED;
  if (!EMAIL.safeParse(trimmed).success) return INVALID;
  if (currentParentEmail && trimmed === currentParentEmail) return MUST_DIFFER;
  return null;
}

/**
 * Adds or updates a student's parent/guardian email. Both fields start empty —
 * an accepted address has to differ from the one on file, so prefilling the old
 * value would only guarantee the first thing typed is rejected. The address must
 * be entered twice, and the opt-in question defaults to unanswered.
 */
export default function ParentEmailModal({
  open,
  onClose,
  currentParentEmail,
}: {
  open: boolean;
  onClose: () => void;
  currentParentEmail?: string | null;
}) {
  const mutation = useUpdateParentEmail(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [optIn, setOptIn] = useState<ParentEmailOptIn>('');
  const [touched, setTouched] = useState({address: false, confirm: false});
  // Snapshot of the address on file when the dialog opened. A successful save
  // invalidates the settings query, so the prop catches up to what was just
  // submitted; comparing against the live prop would make the saved address fail
  // its own must-differ check while the dialog is still dismissing.
  const [addressOnOpen, setAddressOnOpen] = useState(currentParentEmail ?? '');

  const saving = mutation.isPending;
  const serverAddressError = errors.fieldErrors.parent_email?.[0];
  const localAddressError = addressError(email, addressOnOpen);
  const confirmError = email !== confirmEmail ? MUST_MATCH : null;
  const canSubmit = !localAddressError && !confirmError && !saving;
  // Touching either field reveals the address error, so a prefilled address that
  // is already rejected explains the disabled Update instead of just blocking.
  const showAddressError = touched.address || touched.confirm;

  // Read on open only: a background refetch landing mid-edit must not clobber
  // what the parent is typing.
  const latestAddress = useRef(currentParentEmail);
  latestAddress.current = currentParentEmail;

  // Reopening starts clean, and re-reads what is on file so the must-differ
  // check compares against the current record rather than a stale one.
  useEffect(() => {
    if (!open) return;
    setAddressOnOpen(latestAddress.current ?? '');
    setEmail('');
    setConfirmEmail('');
    setOptIn('');
    setTouched({address: false, confirm: false});
  }, [open]);

  const close = () => {
    // Drop the touched flags before the exit transition, so no field error is
    // left rendering over a dialog that is on its way out.
    setTouched({address: false, confirm: false});
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    if (!canSubmit) return;
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
      // The page behind the dialog is aria-hidden, so the address on file is
      // only perceivable if the dialog says it — and must-differ rejects that
      // exact value. Naming it in the description gets it announced on open.
      describedById="parent-email-desc parent-email-current"
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            Update
          </Button>
        </>
      }
    >
      <Typography id="parent-email-desc" variant="body2">
        This email address will have the ability to recover/reset the password
        of this account.
      </Typography>
      <Typography id="parent-email-current" variant="body2">
        <strong>Current parent/guardian email:</strong>{' '}
        {addressOnOpen || 'None'}
      </Typography>
      <FormError message={errors.formError} />
      <TextField
        label="Parent/guardian email address"
        name="parent_email"
        inputType="email"
        value={email}
        onChange={event => {
          setEmail(event.target.value);
          setTouched(previous => ({...previous, address: true}));
        }}
        errorMessage={
          serverAddressError ??
          (showAddressError ? (localAddressError ?? undefined) : undefined)
        }
        aria-invalid={
          serverAddressError || (showAddressError && localAddressError)
            ? true
            : undefined
        }
        disabled={saving}
        maxLength={MAX_LENGTH}
        autoComplete="off"
        data-1p-ignore
      />
      <TextField
        label="Confirm parent/guardian email address"
        name="parent_email_confirmation"
        inputType="email"
        value={confirmEmail}
        onChange={event => {
          setConfirmEmail(event.target.value);
          setTouched(previous => ({...previous, confirm: true}));
        }}
        errorMessage={touched.confirm ? (confirmError ?? undefined) : undefined}
        aria-invalid={touched.confirm && confirmError ? true : undefined}
        disabled={saving}
        maxLength={MAX_LENGTH}
        autoComplete="off"
        data-1p-ignore
      />
      {/* A radiogroup named by BOTH the qualifier and the question, so a screen
          reader hears what it's answering rather than just "For parent/guardian
          only". Deliberately not a fieldset/legend: the legend would have to
          carry the question, and any link inside it would be flattened into the
          group's name and announced with every radio. The privacy link follows
          the group so reading and tab order reach the answer before the aside. */}
      <Box>
        <Typography
          id="parent-optin-qualifier"
          variant="body2"
          sx={{fontWeight: 600, mb: 0.5}}
        >
          For parent/guardian only
        </Typography>
        <Typography variant="body3" component="div" sx={{mb: 0.5}}>
          Only fill out the following question if the email address above
          belongs to you.
        </Typography>
        <Typography
          id="parent-optin-question"
          variant="body2"
          component="div"
          sx={{mb: 1}}
        >
          Can we email you with occasional updates on your child’s progress and
          projects, and updates about their course and computer science?
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
            disabled={saving}
          />
          <RadioButton
            name="parent_email_opt_in"
            value="no"
            label="No"
            checked={optIn === 'no'}
            onChange={event => setOptIn(event.target.value as ParentEmailOptIn)}
            disabled={saving}
          />
        </Box>
        <Typography variant="body2" component="div" sx={{mt: 1}}>
          <Link href={siteConfig.marketingUrl('/privacy')} openInNewTab>
            (See our privacy policy)
          </Link>
        </Typography>
      </Box>
    </FormDialog>
  );
}
