import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useUpdateParentEmail,
  type ParentEmailOptIn,
} from '@code-dot-org/core/api';

import {modalErrors, type ModalErrors} from './modalErrors';

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
    setErrors(NO_ERRORS);
    if (email !== confirmEmail) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    try {
      await mutation.mutateAsync({parentEmail: email, optIn});
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  return (
    <Dialog open={open} onClose={close} aria-labelledby="parent-email-title">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="parent-email-title">
          Update parent/guardian email address
        </DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <DialogContentText>
            This email address will have the ability to recover/reset the
            password of this account.
          </DialogContentText>
          {errors.formError && (
            <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
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
          />
          <TextField
            label="Confirm parent/guardian email address"
            name="parent_email_confirmation"
            inputType="email"
            value={confirmEmail}
            onChange={event => setConfirmEmail(event.target.value)}
            errorMessage={mismatch ? MISMATCH : undefined}
            aria-invalid={mismatch || undefined}
          />
          <FormControl>
            <FormLabel id="parent-optin-label">
              For parent/guardian only
            </FormLabel>
            <Typography variant="body3" sx={{mb: 1}}>
              Only fill out the following question if the email address above
              belongs to you. Can we email you with occasional updates on your
              child’s progress and projects, and updates about their course and
              computer science?
            </Typography>
            <RadioGroup
              row
              aria-labelledby="parent-optin-label"
              value={optIn}
              onChange={event =>
                setOptIn(event.target.value as ParentEmailOptIn)
              }
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
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
