import React, {useContext} from 'react';

import {
  getDeferredPromise,
  DeferredPromiseObject,
} from '@cdo/apps/lab2/utils/getDeferredPromise';

import {TypedDialogProps, closeDialogType} from './types';

interface DialogControl {
  closeDialog: closeDialogType;
  showDialog: (args: TypedDialogProps) => void;
  deferredPromiseObject: DeferredPromiseObject;
}

export const DialogControlContext = React.createContext<DialogControl>({
  closeDialog: () => {},
  showDialog: () => {},
  deferredPromiseObject: getDeferredPromise(),
});
export const useDialogControl = () => useContext(DialogControlContext);
