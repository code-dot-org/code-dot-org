import {Box} from '@mui/material';
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

// Stable identity for the no-provider fallback, so a consumer that puts `toast`
// in a dep array doesn't see a new function each render.
const NOOP_TOAST: Show = () => {};

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

/**
 * Transient success confirmation for discrete account mutations (email,
 * password, account type, parent email). No-ops outside a provider so a
 * component can render standalone in tests.
 */
export function useToast(): Show {
  return useContext(ToastContext) ?? NOOP_TOAST;
}

export function ToastProvider({children}: {children: ReactNode}) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback<Show>(next => setMessage(next), []);
  const close = useCallback(() => setMessage(null), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* The announcer: a polite live region that is always mounted (empty), so
          a screen reader reliably announces the moment its text changes. A node
          inserted already containing text (as the Snackbar's Alert is) often
          goes unannounced. The Snackbar is the visual surface only — its Alert
          role is dropped to 'presentation' so the message isn't announced twice. */}
      <Box role="status" aria-live="polite" sx={visuallyHidden}>
        {message ?? ''}
      </Box>
      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={close}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert
          role="presentation"
          type="success"
          text={message ?? ''}
          isImmediateImportance={false}
          onClose={close}
        />
      </Snackbar>
    </ToastContext.Provider>
  );
}
