import {GenericAlertDialogProps} from './GenericAlertDialog';
import {GenericConfirmationDialogProps} from './GenericConfirmationDialog';
import {GenericDialogProps} from './GenericDialog';
import {GenericPromptProps} from './GenericPrompt';
import {SkipDialogProps} from './SkipDialog';
import {StartOverDialogProps} from './StartOverDialog';

export enum DialogType {
  GenericAlert = 'GenericAlert',
  GenericConfirmation = 'GenericConfirmation',
  GenericPrompt = 'GenericPrompt',
  GenericDialog = 'GenericDialog',
  Skip = 'Skip',
  StartOver = 'StartOver',
}

export type DialogCloseActionType = 'cancel' | 'neutral' | 'confirm';
export type DialogCloseFunctionType = (
  type: DialogCloseActionType,
  args?: unknown
) => void;

export type SpecificTypedDialogProps =
  | (GenericAlertDialogProps & {
      type: DialogType.GenericAlert;
    })
  | (GenericConfirmationDialogProps & {
      type: DialogType.GenericConfirmation;
    })
  | (GenericPromptProps & {
      type: DialogType.GenericPrompt;
    })
  | (GenericDialogProps & {
      type: DialogType.GenericDialog;
    })
  | (SkipDialogProps & {type: DialogType.Skip})
  | (StartOverDialogProps & {type: DialogType.StartOver});

export type TypedDialogProps = SpecificTypedDialogProps & {
  throwOnCancel?: boolean;
};

export type AnyDialogType =
  | GenericAlertDialogProps
  | GenericConfirmationDialogProps
  | GenericDialogProps
  | GenericPromptProps
  | SkipDialogProps
  | StartOverDialogProps;
