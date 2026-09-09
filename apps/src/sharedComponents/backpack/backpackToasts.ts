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
