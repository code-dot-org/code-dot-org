import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';
import {
  DashboardApiClient,
  useUpdateUserType,
  type UserType,
} from '@code-dot-org/core/api';

import {hashEmail} from '../util/hashEmail';

import {formDialogContentSx} from './formDialog';
import {modalErrors, type ModalErrors} from './modalErrors';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

const NO_ERRORS: ModalErrors = {fieldErrors: {}, formError: null};

/**
 * Confirmation alertdialog for an account-type change. Committed only on
 * confirm; dismissing leaves the account unchanged. Upgrading to an educator
 * account requires a cleartext email, so that case prompts for one.
 */
export default function AccountTypeModal({
  open,
  prospectiveType,
  onClose,
}: {
  open: boolean;
  prospectiveType: UserType | null;
  onClose: () => void;
}) {
  const mutation = useUpdateUserType(DashboardApiClient);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<ModalErrors>(NO_ERRORS);

  const isUpgrade = prospectiveType === 'teacher';

  // Stay open and show the error on failure; close only once the change commits.
  const confirm = async () => {
    if (!prospectiveType) return;
    setErrors(NO_ERRORS);
    try {
      await mutation.mutateAsync(
        isUpgrade
          ? {userType: 'teacher', email, hashedEmail: hashEmail(email)}
          : {userType: prospectiveType},
      );
      close();
    } catch (error) {
      setErrors(modalErrors(error));
    }
  };

  const close = () => {
    setEmail('');
    setErrors(NO_ERRORS);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby="account-type-title"
      aria-describedby="account-type-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
    >
      <DialogTitle id="account-type-title">Change account type?</DialogTitle>
      <DialogContent sx={formDialogContentSx}>
        <DialogContentText id="account-type-desc">
          Changing your account type
          {prospectiveType ? ` to ${TYPE_LABEL[prospectiveType]}` : ''} can
          affect your sections, students, and other account data, and may not be
          reversible.
        </DialogContentText>
        {errors.formError && (
          <Typography role="alert" sx={{color: 'var(--text-error-primary)'}}>
            {errors.formError}
          </Typography>
        )}
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
        <Button onClick={close}>Cancel</Button>
        <Button
          onClick={confirm}
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
    </Dialog>
  );
}
