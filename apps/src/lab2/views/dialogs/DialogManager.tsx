import React, {useCallback, useState} from 'react';

import {DialogContext} from './DialogContext';
import GenericAlertDialog from './GenericAlertDialog';
import GenericConfirmationDialog from './GenericConfirmationDialog';
import GenericDialog from './GenericDialog';
import SkipDialog from './SkipDialog';
import StartOverDialog from './StartOverDialog';
import {DialogType, TypedDialogProps, AnyDialogType} from './types';

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
  const [dialogArgs, setDialogArgs] = useState<AnyDialogType>();

  const showDialog = useCallback(
    ({type, ...dialogArgs}: TypedDialogProps) => {
      setOpenDialog(type);
      setDialogArgs(dialogArgs);
    },
    [setDialogArgs]
  );

  const closeDialog = useCallback(() => setOpenDialog(null), [setOpenDialog]);

  const DialogView = openDialog && dialogArgs && DialogViews[openDialog];

  return (
    <DialogContext.Provider
      value={{
        closeDialog,
        showDialog,
      }}
    >
      {DialogView && (
        <div className={moduleStyles.dialogContainer}>
          <DialogView {...dialogArgs} />
        </div>
      )}
      {children}
    </DialogContext.Provider>
  );
};

export default DialogManager;
