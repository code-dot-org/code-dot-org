// MUI-backed dialogs. Same props as the legacy pair below; import these for
// new code. See README.md for the mapping.
export type {MuiDialogProps} from './MuiDialog';
export type {MuiCustomDialogProps} from './MuiCustomDialog';
export {default as MuiDialog} from './MuiDialog';
export {
  default as MuiCustomDialog,
  DIALOG_DESCRIPTION_ID,
} from './MuiCustomDialog';

// Legacy DSCO dialogs. `Dialog`, `CustomDialog` and the default export still
// refer to them until their consumers move.
export type {DialogProps} from './Dialog';
export type {CustomDialogProps} from './CustomDialog';
export {default as CustomDialog} from './CustomDialog';
export {default as Dialog} from './Dialog';
export {default as default} from './Dialog';
