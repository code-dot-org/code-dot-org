import type {GenericAlertDialogProps} from './components/GenericAlertDialog';
import type {GenericConfirmationDialogProps} from './components/GenericConfirmationDialog';
import type {GenericDialogProps} from './components/GenericDialog';
import type {GenericDropdownProps} from './components/GenericDropdown';
import type {GenericPromptProps} from './components/GenericPrompt';
import type {PendingDialogProps} from './components/PendingDialog';
import type {SkipDialogProps} from './components/SkipDialog';
import type {StartOverDialogProps} from './components/StartOverDialog';

export const DialogType = {
  GenericAlert: 'GenericAlert',
  GenericConfirmation: 'GenericConfirmation',
  GenericPrompt: 'GenericPrompt',
  GenericDropdown: 'GenericDropdown',
  GenericDialog: 'GenericDialog',
  Skip: 'Skip',
  StartOver: 'StartOver',
  PendingDialog: 'PendingDialog',
} as const;

export type DialogTypeType = (typeof DialogType)[keyof typeof DialogType];

export type DialogCloseActionType = 'cancel' | 'neutral' | 'confirm';
export type DialogCloseFunctionType = (
  type: DialogCloseActionType,
  args?: unknown,
) => void;

export type DialogClosePromiseReturnType = {
  type: DialogCloseActionType;
  args?: unknown;
};

export type SpecificTypedDialogProps =
  | (GenericAlertDialogProps & {
      type: typeof DialogType.GenericAlert;
    })
  | (GenericConfirmationDialogProps & {
      type: typeof DialogType.GenericConfirmation;
    })
  | (GenericDropdownProps & {
      type: typeof DialogType.GenericDropdown;
    })
  | (GenericPromptProps & {
      type: typeof DialogType.GenericPrompt;
    })
  | (GenericDialogProps & {
      type: typeof DialogType.GenericDialog;
    })
  | (SkipDialogProps & {type: typeof DialogType.Skip})
  | (StartOverDialogProps & {type: typeof DialogType.StartOver})
  | (PendingDialogProps & {
      type: typeof DialogType.PendingDialog;
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
