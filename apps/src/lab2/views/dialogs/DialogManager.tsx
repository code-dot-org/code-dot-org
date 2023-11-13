import React, {useCallback, useState} from 'react';
import moduleStyles from './dialog-manager.module.scss';
import StartOverDialog from './StartOverDialog';

/**
 * Manages displaying common dialogs for Lab2.
 */

export enum DialogType {
  StartOver = 'StartOver',
}

export interface BaseDialogProps {
  handleConfirm: () => void;
  handleCancel: () => void;
}

const DialogViews: {
  [key in DialogType]: React.FunctionComponent<BaseDialogProps>;
} = {
  [DialogType.StartOver]: StartOverDialog,
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

  const showDialog = useCallback(
    (dialogType: DialogType, callback: () => void) => {
      setOpenDialog(dialogType);
      setDialogCallback(() => callback);
    },
    [setOpenDialog, setDialogCallback]
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
          />
        </div>
      )}
      {children}
    </DialogContext.Provider>
  );
};

interface DialogControl {
  showDialog: (dialogType: DialogType, callback: () => void) => void;
}

export const DialogContext = React.createContext<DialogControl | null>(null);

export default DialogManager;
