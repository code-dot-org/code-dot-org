import React, {useContext} from 'react';

import {
  getDeferredPromise,
  DeferredPromiseObject,
} from '@cdo/apps/lab2/utils/getDeferredPromise';

import {
  TypedDialogProps,
  DialogCloseFunctionType,
  DialogClosePromiseReturnType,
} from './types';

export interface DialogControlInterface {
  closeDialog: DialogCloseFunctionType;
  showDialog: (args: TypedDialogProps) => Promise<DialogClosePromiseReturnType>;
  deferredPromiseObject: DeferredPromiseObject;
  promiseArgs: unknown;
  setPromiseArgs: (args: unknown) => void;
}

export const DialogControlContext = React.createContext<DialogControlInterface>(
  {
    closeDialog: () => {},
    showDialog: () => Promise.resolve({type: 'cancel'}),
    deferredPromiseObject: getDeferredPromise(),
    promiseArgs: undefined,
    setPromiseArgs: () => {},
  }
);
export const useDialogControl = () => useContext(DialogControlContext);
