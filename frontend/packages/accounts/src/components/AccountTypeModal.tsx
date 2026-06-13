import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';

import {updateUserType} from '../api/accounts.api';
import {accountsKeys} from '../api/accounts.keys';
import type {UserType} from '../api/accounts.types';

import {modalErrors} from './modalErrors';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

/**
 * Confirmation alertdialog for an account-type change. The
 * prospective type lives in the caller's state and is committed only on
 * confirm; dismissing leaves the account unchanged. role="alertdialog" with the
 * heading as label and the warning as description; Cancel takes initial focus.
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
  const queryClient = useQueryClient();
  const mutation = useMutation({mutationFn: updateUserType});
  const [formError, setFormError] = useState<string | null>(null);

  // Keep the dialog open and surface the message on failure (mirroring the
  // other account modals); only close once the change actually commits.
  const confirm = async () => {
    if (!prospectiveType) return;
    setFormError(null);
    try {
      await mutation.mutateAsync({userType: prospectiveType});
      await queryClient.invalidateQueries({queryKey: accountsKeys.settings()});
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
