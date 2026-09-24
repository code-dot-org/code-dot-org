import {
  ShowToast,
  ShowToastOptions,
} from '@code-dot-org/component-library/toast';

const TOAST_DURATION_MS = {
  danger: 8000,
  success: 4000,
} as const;

export type BackpackAlertType = 'success' | 'danger' | 'gray';

export const toastOptionsFor = (type: BackpackAlertType): ShowToastOptions => ({
  type,
  autoHideDuration: type === 'gray' ? null : TOAST_DURATION_MS[type],
  icon:
    type === 'gray' ? {iconName: 'spinner', animationType: 'spin'} : undefined,
});

export type BackpackNotify = (type: BackpackAlertType, message: string) => void;

export const notifyWithToast =
  (showToast: ShowToast): BackpackNotify =>
  (type, message) =>
    showToast(message, toastOptionsFor(type));

export const BACKPACK_READ_ERROR =
  "Couldn't read your Backpack. Please try again.";

export const backpackSaveError = (fileName: string) =>
  `Couldn't save ${fileName} to your Backpack. Please try again.`;

export const backpackDuplicateDeleteError = (fileName: string) =>
  `Saved ${fileName}, but couldn't remove the old copy. You can delete it from your Backpack.`;

export const notifySaving = (notify: BackpackNotify, fileName: string) =>
  notify('gray', `Saving ${fileName} to your Backpack...`);

export const notifySaved = (notify: BackpackNotify, fileName: string) =>
  notify('success', `${fileName} saved to your Backpack.`);
