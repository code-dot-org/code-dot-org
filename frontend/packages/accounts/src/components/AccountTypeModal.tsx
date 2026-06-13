import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {updateUserType} from '../api/accounts.api';
import {accountsKeys} from '../api/accounts.keys';
import type {UserType} from '../api/accounts.types';

const TYPE_LABEL: Record<UserType, string> = {
  student: 'Student',
  teacher: 'Educator',
};

/**
 * Confirmation alertdialog for an account-type change (design D10). The
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

  const confirm = async () => {
    if (!prospectiveType) return;
    try {
      await mutation.mutateAsync({userType: prospectiveType});
      await queryClient.invalidateQueries({queryKey: accountsKeys.settings()});
    } finally {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
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
