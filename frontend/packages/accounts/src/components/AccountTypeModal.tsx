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

import {
  DashboardApiClient,
  useUpdateUserType,
  type UserType,
} from '@code-dot-org/core/api';

import {modalErrors} from './modalErrors';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

/**
 * Confirmation alertdialog for an account-type change. The prospective type
 * lives in the caller's state and is committed only on confirm; dismissing
 * leaves the account unchanged. Cancel takes initial focus.
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
  const [formError, setFormError] = useState<string | null>(null);

  // Stay open and show the error on failure; close only once the change commits.
  const confirm = async () => {
    if (!prospectiveType) return;
    setFormError(null);
    try {
      await mutation.mutateAsync({userType: prospectiveType});
      onClose();
    } catch (error) {
      setFormError(modalErrors(error).formError);
    }
  };

  const close = () => {
    setFormError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby="account-type-title"
      aria-describedby="account-type-desc"
      slotProps={{paper: {role: 'alertdialog'}}}
    >
      <DialogTitle id="account-type-title">Change account type?</DialogTitle>
      <DialogContent>
        <DialogContentText id="account-type-desc">
          Changing your account type
          {prospectiveType ? ` to ${TYPE_LABEL[prospectiveType]}` : ''} can
          affect your sections, students, and other account data, and may not be
          reversible.
        </DialogContentText>
        {formError && (
          <Typography
            role="alert"
            sx={{mt: 2, color: 'var(--text-error-primary)'}}
          >
            {formError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          onClick={confirm}
          variant="contained"
          disabled={mutation.isPending}
        >
          {prospectiveType
            ? `Change to ${TYPE_LABEL[prospectiveType]}`
            : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
