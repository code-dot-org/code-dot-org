import {Button, DialogContentText} from '@mui/material';
import {useId} from 'react';

import {FormError} from '@code-dot-org/component-library/form';
import {
  DashboardApiClient,
  useUnlinkLtiAccount,
  type AuthenticationOptionSummary,
} from '@code-dot-org/core/api';

import {LTI_PROVIDER} from '../util/linkedAccounts';

import EmailStatus from './EmailStatus';
import FormDialog from './FormDialog';
import {useModalForm} from './useModalForm';

/**
 * Manages one linked login. Disconnecting is the legacy native POST; unlinking
 * an LMS login warns first, as the legacy dialog does, and calls its endpoint.
 * Both land on the legacy account page, whose flash confirms the change.
 */
export default function ManageLinkedAccountModal({
  open,
  onClose,
  option,
  name,
  blockedMessage,
}: {
  open: boolean;
  onClose: () => void;
  option: AuthenticationOptionSummary;
  name: string;
  blockedMessage?: string;
}) {
  const isLti = option.credentialType === LTI_PROVIDER;
  const mutation = useUnlinkLtiAccount(DashboardApiClient);
  const {errors, resetErrors, onSubmit} = useModalForm();
  const titleId = useId();
  const descriptionId = useId();
  const blockedMessageId = useId();

  const close = () => {
    resetErrors();
    onClose();
  };

  const unlink = onSubmit(async () => {
    await mutation.mutateAsync({authenticationOptionId: option.id});
    window.location.assign('/users/edit');
  });

  return (
    <FormDialog
      open={open}
      onClose={close}
      titleId={titleId}
      title={`Manage ${name}`}
      describedById={descriptionId}
      alert={isLti}
      {...(isLti
        ? {onSubmit: unlink}
        : {action: `/users/auth/${option.id}/disconnect`})}
      actions={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={!!blockedMessage || mutation.isPending}
            aria-describedby={blockedMessage ? blockedMessageId : undefined}
          >
            {isLti ? 'Unlink account' : 'Disconnect account'}
          </Button>
        </>
      }
    >
      <div id={descriptionId}>
        <DialogContentText>
          Linked to <EmailStatus email={option.email} />
        </DialogContentText>
        {isLti && (
          <>
            <DialogContentText>
              If you unlink your account, you will lose access to all your{' '}
              {name} sections.
            </DialogContentText>
            <DialogContentText>
              You may regain access to these sections by launching CodeAI from{' '}
              {name} again.
            </DialogContentText>
          </>
        )}
      </div>
      {blockedMessage && (
        <DialogContentText id={blockedMessageId}>
          {blockedMessage}
        </DialogContentText>
      )}
      <FormError message={errors.formError} />
    </FormDialog>
  );
}
