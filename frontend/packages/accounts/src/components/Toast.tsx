import Snackbar from '@mui/material/Snackbar';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import Alert from '@code-dot-org/component-library/alert';

type Show = (message: string) => void;

const ToastContext = createContext<Show | null>(null);

/**
 * Transient success confirmation for discrete account mutations (email,
 * password, account type, parent email). No-ops outside a provider so a
 * component can render standalone in tests.
 */
export function useToast(): Show {
  return useContext(ToastContext) ?? (() => {});
}

export function ToastProvider({children}: {children: ReactNode}) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback<Show>(next => setMessage(next), []);
  const close = useCallback(() => setMessage(null), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert
          type="success"
          text={message ?? ''}
          isImmediateImportance={false}
          onClose={close}
        />
      </Snackbar>
    </ToastContext.Provider>
  );
}
