import {GenericAlertDialogProps} from './GenericAlertDialog';
import {GenericConfirmationDialogProps} from './GenericConfirmationDialog';
import {GenericDialogProps} from './GenericDialog';
import {GenericPromptProps} from './GenericPrompt';
import {SkipDialogProps} from './SkipDialog';
import {StartOverDialogProps} from './StartOverDialog';

export type closeDialogType = () => void;

export enum DialogType {
  GenericAlert = 'GenericAlert',
  GenericConfirmation = 'GenericConfirmation',
  GenericPrompt = 'GenericPrompt',
  GenericDialog = 'GenericDialog',
  Skip = 'Skip',
  StartOver = 'StartOver',
}

export type TypedDialogProps =
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

export type AnyDialogType =
  | GenericAlertDialogProps
  | GenericConfirmationDialogProps
  | GenericDialogProps
  | GenericPromptProps
  | SkipDialogProps
  | StartOverDialogProps;
