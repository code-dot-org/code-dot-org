import {ShowToastOptions} from '@code-dot-org/component-library/toast';

// An error has to survive the user looking elsewhere; a success only has to be
// seen. In-progress toasts stay up until the operation replaces them.
const TOAST_DURATION_MS = {
  danger: 8000,
  success: 4000,
} as const;

export type BackpackAlertType = 'success' | 'danger' | 'info';

export const toastOptionsFor = (type: BackpackAlertType): ShowToastOptions => ({
  type,
  autoHideDuration: type === 'info' ? null : TOAST_DURATION_MS[type],
});

/**
 * Reports the progress of a backpack operation started outside the panel. The
 * panel decides how to show it: the unified panel toasts, the legacy one adds
 * an inline alert.
 */
export type BackpackNotify = (
  type: BackpackAlertType,
  message: string
) => void;
