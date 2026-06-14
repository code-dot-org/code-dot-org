import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useState, type FormEvent} from 'react';

import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useUpdateParentEmail,
  type ParentEmailOptIn,
} from '@code-dot-org/core/api';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';
import {useToast} from './Toast';

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};
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
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [optIn, setOptIn] = useState<ParentEmailOptIn>('');
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);
  const [mismatch, setMismatch] = useState(false);

  const close = () => {
    setEmail('');
    setConfirmEmail('');
    setOptIn('');
    setErrors(NO_ERRORS);
    setMismatch(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation(); // keep this submit off the page form (portal bubbles)
    setErrors(NO_ERRORS);
    if (email !== confirmEmail) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      await mutation.mutateAsync({parentEmail: email, optIn});
      toast('Parent/guardian email updated.');
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="parent-email-title"
      aria-describedby="parent-email-desc"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="parent-email-title">
          Update parent/guardian email address
        </DialogTitle>
        <DialogContent sx={formDialogContentSx}>
          <Typography id="parent-email-desc" variant="body2">
            This email address will have the ability to recover or reset this
            account’s password.
          </Typography>
          {errors.formError && (
            <Typography
              role="alert"
              variant="body2"
              sx={{color: 'var(--text-error-primary)'}}
            >
              {errors.formError}
            </Typography>
          )}
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
          {/* fieldset + legend groups the opt-in radios for assistive tech;
              reset the native fieldset chrome so it lays out flush. */}
          <Box component="fieldset" sx={{m: 0, p: 0, border: 0, minWidth: 0}}>
            <Typography
              component="legend"
              variant="body2"
              sx={{p: 0, fontWeight: 600, mb: 0.5}}
            >
              For parent/guardian only
            </Typography>
            <Typography variant="body2" sx={{mb: 1}}>
              Only answer the question below if the email address above belongs
              to you. Can we email you with occasional updates on your child’s
              progress, projects, and course?
            </Typography>
            <Box sx={{display: 'flex', gap: 3}}>
              <RadioButton
                name="parent_email_opt_in"
                value="yes"
                label="Yes"
                checked={optIn === 'yes'}
                onChange={event =>
                  setOptIn(event.target.value as ParentEmailOptIn)
                }
              />
              <RadioButton
                name="parent_email_opt_in"
                value="no"
                label="No"
                checked={optIn === 'no'}
                onChange={event =>
                  setOptIn(event.target.value as ParentEmailOptIn)
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
