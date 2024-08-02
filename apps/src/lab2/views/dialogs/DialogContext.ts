import React, {useContext} from 'react';

import {TypedDialogProps, closeDialogType} from './types';

interface DialogControl {
  closeDialog: closeDialogType;
  showDialog: (args: TypedDialogProps) => void;
}

export const DialogContext = React.createContext<DialogControl>({
  closeDialog: () => {},
  showDialog: () => {},
});
export const useDialogControl = () => useContext(DialogContext);
