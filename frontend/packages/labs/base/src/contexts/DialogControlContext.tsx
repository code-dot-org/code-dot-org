import {
  createContext,
  useState,
  useCallback,
  useContext,
  type PropsWithChildren,
} from 'react';

import type {
  TypedDialogProps,
  DialogCloseActionType,
  DialogCloseFunctionType,
  DialogClosePromiseReturnType,
} from '../dialogs';
import {getDeferredPromise, type DeferredPromiseObject} from '../utils';

import type {DialogTypeType, AnyDialogType} from '../dialogs/types';

import moduleStyles from '../dialogs/components/dialog-manager.module.scss';

export interface DialogControlInterface {
  closeDialog: DialogCloseFunctionType;
  showDialog: (args: TypedDialogProps) => Promise<DialogClosePromiseReturnType>;
  deferredPromiseObject: DeferredPromiseObject;
  promiseArgs: unknown;
  setPromiseArgs: (args: unknown) => void;
}

const DialogControlContext = createContext<DialogControlInterface>({
  closeDialog: () => {},
  showDialog: () => Promise.resolve({type: 'cancel'}),
  deferredPromiseObject: getDeferredPromise(),
  promiseArgs: undefined,
  setPromiseArgs: () => {},
});
export const useDialogControl = () => useContext(DialogControlContext);

export interface DialogControlProviderProps extends PropsWithChildren {
  dialogViews: {
    [key in DialogTypeType]: React.FunctionComponent<AnyDialogType>;
  };
}

/**
 * Displays the lab dialog and manages dialog state.
 */
export const DialogControlProvider: React.FunctionComponent<
  DialogControlProviderProps
> = ({dialogViews, children}) => {
  const [shouldThrowOnCancel, setShouldThrowOnCancel] =
    useState<boolean>(false);
  const [promiseArgs, setPromiseArgs] = useState<unknown>();
  const [activeDialog, setActiveDialog] = useState<
    | {
        type?: DialogTypeType;
        dialogArgs?: AnyDialogType;
      }
    | undefined
  >(undefined);
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
    [setActiveDialog],
  );

  const closeDialog = useCallback(
    (closeType: DialogCloseActionType) => {
      setActiveDialog(undefined);
      const resolver =
        shouldThrowOnCancel && closeType === 'cancel'
          ? deferredPromiseObject.reject
          : deferredPromiseObject.resolve;
      resolver?.({type: closeType, args: promiseArgs});
    },
    [setActiveDialog, deferredPromiseObject, shouldThrowOnCancel, promiseArgs],
  );

  // Allow the any because if it's NOT any, then line 63 with DialogView's args will toss an error.
  // Keep this until we have a better solution. ¯\_(ツ)_/¯
  // The typing on the `showDialog` function ensures the props are correct, so we're still safe'
  // eslint-disable-next-line
  const DialogView: any =
    activeDialog?.type &&
    activeDialog?.dialogArgs &&
    dialogViews[activeDialog.type];

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

export default DialogControlContext;
