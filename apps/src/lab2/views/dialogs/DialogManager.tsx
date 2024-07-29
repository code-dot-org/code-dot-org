import React, {useCallback, useState} from 'react';

import GenericConfirmationDialog from './GenericConfirmationDialog';
import SkipDialog from './SkipDialog';
import StartOverDialog from './StartOverDialog';

import moduleStyles from './dialog-manager.module.scss';

/**
 * Manages displaying common dialogs for Lab2.
 */

export enum DialogType {
  StartOver = 'StartOver',
  Skip = 'Skip',
  GenericConfirmation = 'GenericConfirmation',
}

export interface BaseDialogProps {
  handleConfirm: () => void;
  handleCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
}

const DialogViews: {
  [key in DialogType]: React.FunctionComponent<BaseDialogProps>;
} = {
  [DialogType.StartOver]: StartOverDialog,
  [DialogType.Skip]: SkipDialog,
  [DialogType.GenericConfirmation]: GenericConfirmationDialog,
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
  const [dialogCallback, setDialogCallback] = useState<(() => void) | null>(
    () => null
  );
  const [dialogTitle, setDialogTitle] = useState<string | undefined>(undefined);
  const [dialogMessage, setDialogMessage] = useState<string | undefined>(
    undefined
  );
  const [dialogConfirmText, setDialogConfirmText] = useState<
    string | undefined
  >(undefined);

  const showDialog = useCallback(
    (
      dialogType: DialogType,
      callback: () => void,
      title?: string,
      message?: string,
      confirmText?: string
    ) => {
      setDialogTitle(title);
      setDialogMessage(message);
      setDialogConfirmText(confirmText);
      setOpenDialog(dialogType);
      setDialogCallback(() => callback);
    },
    [
      setDialogTitle,
      setDialogMessage,
      setDialogConfirmText,
      setOpenDialog,
      setDialogCallback,
    ]
  );

  const handleConfirm = useCallback(() => {
    if (dialogCallback) {
      dialogCallback();
      setOpenDialog(null);
    }
  }, [dialogCallback, setOpenDialog]);

  const handleCancel = useCallback(() => {
    setOpenDialog(null);
  }, [setOpenDialog]);

  const DialogView = openDialog && dialogCallback && DialogViews[openDialog];

  return (
    <DialogContext.Provider
      value={{
        showDialog,
      }}
    >
      {DialogView && (
        <div className={moduleStyles.dialogContainer}>
          <DialogView
            handleConfirm={handleConfirm}
            handleCancel={handleCancel}
            title={dialogTitle}
            message={dialogMessage}
            confirmText={dialogConfirmText}
          />
        </div>
      )}
      {children}
    </DialogContext.Provider>
  );
};

interface DialogControl {
  showDialog: (
    dialogType: DialogType,
    callback: () => void,
    title?: string,
    message?: string,
    confirmText?: string
  ) => void;
}

export const DialogContext = React.createContext<DialogControl | null>(null);

export default DialogManager;
