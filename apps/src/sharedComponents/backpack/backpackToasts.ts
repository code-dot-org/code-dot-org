import {ShowToastOptions} from '@code-dot-org/component-library/toast';

const TOAST_DURATION_MS = {
  danger: 8000,
  success: 4000,
} as const;

export type BackpackAlertType = 'success' | 'danger' | 'info';

export const toastOptionsFor = (type: BackpackAlertType): ShowToastOptions => ({
  type,
  autoHideDuration: type === 'info' ? null : TOAST_DURATION_MS[type],
});

export type BackpackNotify = (type: BackpackAlertType, message: string) => void;
