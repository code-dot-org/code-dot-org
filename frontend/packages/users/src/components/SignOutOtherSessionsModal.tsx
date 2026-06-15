import {Button, DialogContentText} from '@mui/material';

import {FormError} from '@code-dot-org/component-library/form';
import {useToast} from '@code-dot-org/component-library/toast';
import {
  DashboardApiClient,
  useSignOutOtherSessions,
} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/**
 * Confirms signing out every other browser/device. Reversible, so the confirm
 * button is neutral (not destructive) and Cancel takes initial focus.
 */
export default function SignOutOtherSessionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useSignOutOtherSessions(DashboardApiClient);
  const toast = useToast();
  const {errors, resetErrors, onSubmit} = useModalForm();

  const close = () => {
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync();
    toast('Signed out of all other sessions.');
    close();
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="sign-out-sessions-title"
      title="Sign out all other sessions"
      describedById="sign-out-sessions-desc"
      alert
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            Sign out all other sessions
          </Button>
        </>
      }
    >
      <DialogContentText id="sign-out-sessions-desc">
        This signs you out on every other browser and device. You’ll stay signed
        in here.
      </DialogContentText>
      <FormError message={errors.formError} />
    </FormDialog>
  );
}
