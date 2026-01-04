import type {GenericAlertDialogProps} from './components/GenericAlertDialog';
import type {GenericConfirmationDialogProps} from './components/GenericConfirmationDialog';
import type {GenericDialogProps} from './components/GenericDialog';
import type {GenericDropdownProps} from './components/GenericDropdown';
import type {GenericPromptProps} from './components/GenericPrompt';
import type {PendingDialogProps} from './components/PendingDialog';
import type {SkipDialogProps} from './components/SkipDialog';
import type {StartOverDialogProps} from './components/StartOverDialog';

export enum DialogType {
  GenericAlert = 'GenericAlert',
  GenericConfirmation = 'GenericConfirmation',
  GenericPrompt = 'GenericPrompt',
  GenericDropdown = 'GenericDropdown',
  GenericDialog = 'GenericDialog',
  Skip = 'Skip',
  StartOver = 'StartOver',
  PendingDialog = 'PendingDialog',
}

export type DialogCloseActionType = 'cancel' | 'neutral' | 'confirm';
export type DialogCloseFunctionType = (
  type: DialogCloseActionType,
  args?: unknown
) => void;

export type DialogClosePromiseReturnType = {
  type: DialogCloseActionType;
  args?: unknown;
};

export type SpecificTypedDialogProps =
  | (GenericAlertDialogProps & {
      type: DialogType.GenericAlert;
    })
  | (GenericConfirmationDialogProps & {
      type: DialogType.GenericConfirmation;
    })
  | (GenericDropdownProps & {
      type: DialogType.GenericDropdown;
    })
  | (GenericPromptProps & {
      type: DialogType.GenericPrompt;
    })
  | (GenericDialogProps & {
      type: DialogType.GenericDialog;
    })
  | (SkipDialogProps & {type: DialogType.Skip})
  | (StartOverDialogProps & {type: DialogType.StartOver})
  | (PendingDialogProps & {
      type: DialogType.PendingDialog;
    });

export type TypedDialogProps = SpecificTypedDialogProps & {
  throwOnCancel?: boolean;
};

export type AnyDialogType =
  | GenericAlertDialogProps
  | GenericConfirmationDialogProps
  | GenericDialogProps
  | GenericDropdownProps
  | GenericPromptProps
  | SkipDialogProps
  | StartOverDialogProps
  | PendingDialogProps;
