import React, {useCallback, useState} from 'react';

import {
  getDeferredPromise,
  DeferredPromiseObject,
} from '@cdo/apps/lab2/utils/getDeferredPromise';

import {DialogControlContext} from './DialogControlContext';
import GenericAlertDialog from './GenericAlertDialog';
import GenericConfirmationDialog from './GenericConfirmationDialog';
import GenericDialog from './GenericDialog';
import GenericPrompt from './GenericPrompt';
import SkipDialog from './SkipDialog';
import StartOverDialog from './StartOverDialog';
import {
  DialogType,
  TypedDialogProps,
  AnyDialogType,
  DialogCloseActionType,
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
  [DialogType.GenericPrompt]: GenericPrompt,
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
  const [openDialog, setOpenDialog] = useState<DialogType | null>(null);
  const [shouldThrowOnCancel, setShouldThrowOnCancel] =
    useState<boolean>(false);
  const [dialogArgs, setDialogArgs] = useState<AnyDialogType>();
  const [deferredPromiseObject, setDeferredPromiseObject] =
    useState<DeferredPromiseObject>(getDeferredPromise());

  const showDialog = useCallback(
    ({type, throwOnCancel = false, ...dialogArgs}: TypedDialogProps) => {
      const newDeferredPromise = getDeferredPromise();
      setDeferredPromiseObject(newDeferredPromise);
      setShouldThrowOnCancel(throwOnCancel);
      setOpenDialog(type);
      setDialogArgs(dialogArgs);
      return newDeferredPromise.deferred;
    },
    [setDialogArgs]
  );

  const closeDialog = useCallback(
    (closeType: DialogCloseActionType) => {
      setOpenDialog(null);
      const resolver =
        shouldThrowOnCancel && closeType === 'cancel'
          ? deferredPromiseObject.reject
          : deferredPromiseObject.resolve;
      resolver?.(closeType);
    },
    [setOpenDialog, deferredPromiseObject, shouldThrowOnCancel]
  );

  // Allow the any because if it's NOT any, then line 63 with DialogView's args will toss an error.
  // Keep this until we have a better solution. ¯\_(ツ)_/¯
  // The typing on the `showDialog` function ensures the props are correct, so we're still safe'
  // eslint-disable-next-line
  const DialogView: any = openDialog && dialogArgs && DialogViews[openDialog];

  return (
    <DialogControlContext.Provider
      value={{
        closeDialog,
        showDialog,
        deferredPromiseObject,
      }}
    >
      {DialogView && (
        <div className={moduleStyles.dialogContainer}>
          <DialogView {...dialogArgs} />
        </div>
      )}
      {children}
    </DialogControlContext.Provider>
  );
};

export default DialogManager;
