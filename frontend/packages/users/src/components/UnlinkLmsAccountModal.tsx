import {Button, DialogContentText} from '@mui/material';

import {FormError} from '@code-dot-org/component-library/form';
import {DashboardApiClient, useUnlinkLtiAccount} from '@code-dot-org/core/api';

import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/**
 * Legacy's warning before unlinking an LMS login. On success it lands on the
 * legacy account page, whose flash confirms the unlink.
 */
export default function UnlinkLmsAccountModal({
  open,
  onClose,
  lmsName,
  authenticationOptionId,
}: {
  open: boolean;
  onClose: () => void;
  lmsName: string;
  authenticationOptionId: number;
}) {
  const mutation = useUnlinkLtiAccount(DashboardApiClient);
  const {errors, resetErrors, onSubmit} = useModalForm();

  const close = () => {
    resetErrors();
    onClose();
  };

  const handleSubmit = onSubmit(async () => {
    await mutation.mutateAsync({authenticationOptionId});
    window.location.assign('/users/edit');
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId="unlink-lms-title"
      title="Are you sure you want to unlink your account?"
      describedById="unlink-lms-desc"
      alert
      onSubmit={handleSubmit}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={mutation.isPending}
          >
            Unlink account
          </Button>
        </>
      }
    >
      <div id="unlink-lms-desc">
        <DialogContentText>
          If you unlink your account, you will lose access to all your {lmsName}{' '}
          sections.
        </DialogContentText>
        <DialogContentText>
          You may regain access to these sections by launching CodeAI from{' '}
          {lmsName} again.
        </DialogContentText>
      </div>
      <FormError message={errors.formError} />
    </FormDialog>
  );
}
