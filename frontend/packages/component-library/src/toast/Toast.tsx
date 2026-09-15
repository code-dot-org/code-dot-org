import {
  Snackbar,
  type SnackbarProps,
  type SnackbarCloseReason,
} from '@mui/material';
import classNames from 'classnames';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import Alert, {AlertProps} from '@/alert';

import moduleStyles from './toast.module.scss';

/** Six seconds, matching the legacy FlashHandler default. */
export const DEFAULT_TOAST_DURATION = 6_000;

/** Where the toast anchors; top-center matches the legacy FlashHandler. */
const DEFAULT_ANCHOR_ORIGIN: SnackbarProps['anchorOrigin'] = {
  vertical: 'top',
  horizontal: 'center',
};

/** The Alert type a toast renders as; a subset of the DSCO Alert types. */
export type ToastType = AlertProps['type'];

/**
 * Live-region politeness. `assertive` interrupts; `polite` waits for a pause.
 * Defaults to `assertive`: it is the only setting Orca (the Linux/AT-SPI screen
 * reader) reliably speaks for this pattern — a polite `role="status"` region is
 * routinely dropped there, and an announcement that never happens is worse than
 * one that interrupts. Set `polite` only for an audience you've verified honors
 * it.
 */
export type ToastPoliteness = 'assertive' | 'polite';

export const DEFAULT_TOAST_POLITENESS: ToastPoliteness = 'assertive';

/**
 * An always-mounted live region. A message is announced in two ticks: the
 * region is cleared, then the text is set on the next paint. This makes the
 * change a text mutation inside a region already in the accessibility tree —
 * which screen readers announce reliably — rather than inserting a text node
 * into a previously-empty region (a transition many SR/browser pairs, notably
 * Orca, miss). The two-step also re-announces an identical repeat message.
 * Render this standalone if you drive the visual toast yourself and only need
 * the announcement.
 */
export function ToastAnnouncer({
  message,
  politeness = DEFAULT_TOAST_POLITENESS,
}: {
  message: string | null;
  politeness?: ToastPoliteness;
}) {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    if (!message) {
      setAnnounced('');
      return;
    }
    // Clear first, then set on the next frame so the SR observes a change.
    setAnnounced('');
    const id = requestAnimationFrame(() => setAnnounced(message));
    return () => cancelAnimationFrame(id);
  }, [message]);

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className={moduleStyles.visuallyHidden}
    >
      {announced}
    </div>
  );
}

export interface ToastProps {
  /** Whether the toast is visible. */
  open: boolean;
  /** The message to show and announce. */
  message: string;
  /** Alert styling; defaults to 'success'. */
  type?: ToastType;
  /**
   * Milliseconds before auto-dismiss; `null` disables it (stays until closed).
   * Defaults to {@link DEFAULT_TOAST_DURATION}.
   */
  autoHideDuration?: number | null;
  /** Called on auto-dismiss or when the dismiss button is pressed. */
  onClose?: () => void;
  /** Override the anchor position; defaults to top-center. */
  anchorOrigin?: SnackbarProps['anchorOrigin'];
  /** Live-region politeness; defaults to `assertive` (see {@link ToastPoliteness}). */
  politeness?: ToastPoliteness;
  /** Accessible name for the dismiss button; defaults to Alert's own default. */
  closeLabel?: string;
  /**
   * Escape hatch for the underlying Alert (icon, size, ...). `link` is excluded:
   * the Alert is `role="presentation"` here, which would orphan a link from the
   * surrounding text that gives it purpose.
   */
  alertProps?: Partial<Omit<AlertProps, 'text' | 'type' | 'onClose' | 'link'>>;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Toast.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Toast Component.
 * A transient status message: a top-center MUI Snackbar wrapping the DSCO
 * Alert, with a persistent live region so the message is announced reliably
 * (assertive by default; see {@link ToastPoliteness}). This is the low-level
 * controlled surface (you own `open`); reach for {@link ToastProvider} /
 * {@link useToast} for an imperative show API.
 */
export default function Toast({
  open,
  message,
  type = 'success',
  autoHideDuration = DEFAULT_TOAST_DURATION,
  onClose,
  anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
  politeness = DEFAULT_TOAST_POLITENESS,
  closeLabel,
  alertProps,
}: ToastProps) {
  // A clickaway must not dismiss a status message the user hasn't read.
  const handleClose = useCallback(
    (_event: unknown, reason?: SnackbarCloseReason) => {
      if (reason === 'clickaway') return;
      onClose?.();
    },
    [onClose],
  );

  return (
    <>
      {/* The Snackbar is the visual surface only — its Alert role drops to
          'presentation' so the announcer, not the Alert, speaks the message
          (announcing from both would double it). */}
      <ToastAnnouncer message={open ? message : null} politeness={politeness} />
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
      >
        <Alert
          {...alertProps}
          role="presentation"
          type={type}
          text={message}
          isImmediateImportance={false}
          onClose={onClose}
          closeLabel={closeLabel}
          className={classNames(moduleStyles.elevated, alertProps?.className)}
        />
      </Snackbar>
    </>
  );
}

export interface ShowToastOptions {
  /** Alert styling; defaults to 'success'. */
  type?: ToastType;
  /** Override auto-dismiss for this toast; `null` keeps it until closed. */
  autoHideDuration?: number | null;
}

export type ShowToast = (message: string, options?: ShowToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

// Stable identity for the no-provider fallback so a consumer that puts the
// returned function in a dep array doesn't see a new value each render.
const NOOP_SHOW: ShowToast = () => {};

/**
 * The imperative show function from the nearest {@link ToastProvider}. No-ops
 * outside a provider, so a component can render standalone in tests.
 */
export function useToast(): ShowToast {
  return useContext(ToastContext) ?? NOOP_SHOW;
}

interface ToastState {
  message: string;
  type: ToastType;
  autoHideDuration: number | null;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss for every toast; per-call options win. */
  autoHideDuration?: number | null;
  /** Default anchor position for the provider's toast; defaults to top-center. */
  anchorOrigin?: SnackbarProps['anchorOrigin'];
  /** Live-region politeness; defaults to `assertive` (see {@link ToastPoliteness}). */
  politeness?: ToastPoliteness;
}

/**
 * Provides an imperative {@link useToast} `show` API and renders a single
 * controlled {@link Toast} for it. One toast is visible at a time; a new call
 * replaces the current message.
 */
export function ToastProvider({
  children,
  autoHideDuration = DEFAULT_TOAST_DURATION,
  anchorOrigin,
  politeness = DEFAULT_TOAST_POLITENESS,
}: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback<ShowToast>(
    (message, options) =>
      setToast({
        message,
        type: options?.type ?? 'success',
        autoHideDuration: options?.autoHideDuration ?? autoHideDuration,
      }),
    [autoHideDuration],
  );

  const close = useCallback(() => setToast(null), []);

  return (
    // `show` is a stable useCallback, so it is a stable context value.
    <ToastContext.Provider value={show}>
      {children}
      <Toast
        open={toast !== null}
        message={toast?.message ?? ''}
        type={toast?.type}
        autoHideDuration={toast?.autoHideDuration}
        anchorOrigin={anchorOrigin}
        politeness={politeness}
        onClose={close}
      />
    </ToastContext.Provider>
  );
}
