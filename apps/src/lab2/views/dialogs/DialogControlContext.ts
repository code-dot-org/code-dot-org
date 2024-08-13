import React, {useContext} from 'react';

import {
  getDeferredPromise,
  DeferredPromiseObject,
} from '@cdo/apps/lab2/utils/getDeferredPromise';

import {
  TypedDialogProps,
  DialogCloseFunctionType,
  DialogCloseActionType,
} from './types';

interface DialogControl {
  closeDialog: DialogCloseFunctionType;
  showDialog: (args: TypedDialogProps) => Promise<DialogCloseActionType>;
  deferredPromiseObject: DeferredPromiseObject;
}

export const DialogControlContext = React.createContext<DialogControl>({
  closeDialog: () => {},
  showDialog: () => Promise.resolve('cancel'),
  deferredPromiseObject: getDeferredPromise(),
});
export const useDialogControl = () => useContext(DialogControlContext);
