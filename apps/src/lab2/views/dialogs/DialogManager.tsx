import React, {useCallback, useState} from 'react';

import {
  getDeferredPromise,
  DeferredPromiseObject,
} from '@cdo/apps/lab2/utils/getDeferredPromise';

import {DialogControlContext} from './DialogControlContext';
import GenericAlertDialog from './GenericAlertDialog';
import GenericConfirmationDialog from './GenericConfirmationDialog';
import GenericDialog from './GenericDialog';
import GenericDropdown from './GenericDropdown';
import GenericPrompt from './GenericPrompt';
import PendingDialog from './PendingDialog';
import SkipDialog from './SkipDialog';
import StartOverDialog from './StartOverDialog';
import {
  DialogType,
  TypedDialogProps,
  AnyDialogType,
  DialogCloseActionType,
  DialogClosePromiseReturnType,
} from './types';

import moduleStyles from './dialog-manager.module.scss';

/**
 * Manages displaying common dialogs for Lab2.
 */

const DialogViews = {
  [DialogType.StartOver]: StartOverDialog,
  [DialogType.Skip]: SkipDialog,
  [DialogType.GenericAlert]: GenericAlertDialog,
  [DialogType.GenericConfirmation]: GenericConfirmationDialog,
  [DialogType.GenericDialog]: GenericDialog,
  [DialogType.GenericDropdown]: GenericDropdown,
  [DialogType.GenericPrompt]: GenericPrompt,
  [DialogType.PendingDialog]: PendingDialog,
};

interface DialogManagerProps {
  children: React.ReactNode;
}

// TODO: Rather than using context, dialog state should be managed by Redux,
// and dialog actions should be handled directly by the Lab2 framework.
// This is an interim implementation that lets individual labs handle dialog
// actions themselves.

const DialogManager: React.FunctionComponent<DialogManagerProps> = ({
  children,
}) => {
  const [shouldThrowOnCancel, setShouldThrowOnCancel] =
    useState<boolean>(false);
  const [promiseArgs, setPromiseArgs] = useState<unknown>();
  const [activeDialog, setActiveDialog] = useState<{
    type: DialogType | null;
    dialogArgs?: AnyDialogType;
  } | null>(null);
  const [deferredPromiseObject, setDeferredPromiseObject] =
    useState<DeferredPromiseObject>(getDeferredPromise());

  const showDialog = useCallback(
    ({type, throwOnCancel = false, ...dialogArgs}: TypedDialogProps) => {
      const newDeferredPromise = getDeferredPromise();
      setDeferredPromiseObject(newDeferredPromise);
      setPromiseArgs(undefined);
      setShouldThrowOnCancel(throwOnCancel);
      setActiveDialog({type, dialogArgs});

      return newDeferredPromise.deferred as Promise<DialogClosePromiseReturnType>;
    },
    [setActiveDialog]
  );

  const closeDialog = useCallback(
    (closeType: DialogCloseActionType) => {
      setActiveDialog(null);
      const resolver =
        shouldThrowOnCancel && closeType === 'cancel'
          ? deferredPromiseObject.reject
          : deferredPromiseObject.resolve;
      resolver?.({type: closeType, args: promiseArgs});
    },
    [setActiveDialog, deferredPromiseObject, shouldThrowOnCancel, promiseArgs]
  );

  // Allow the any because if it's NOT any, then line 63 with DialogView's args will toss an error.
  // Keep this until we have a better solution. ¯\_(ツ)_/¯
  // The typing on the `showDialog` function ensures the props are correct, so we're still safe'
  // eslint-disable-next-line
  const DialogView: any =
    activeDialog?.type &&
    activeDialog?.dialogArgs &&
    DialogViews[activeDialog.type];

  return (
    <DialogControlContext.Provider
      value={{
        closeDialog,
        showDialog,
        deferredPromiseObject,
        promiseArgs,
        setPromiseArgs,
      }}
    >
      {DialogView && (
        <div className={moduleStyles.dialogContainer}>
          <DialogView {...activeDialog?.dialogArgs} />
        </div>
      )}
      {children}
    </DialogControlContext.Provider>
  );
};

export default DialogManager;
