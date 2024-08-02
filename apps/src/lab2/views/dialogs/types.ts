import {GenericAlertDialogProps} from './GenericAlertDialog';
import {GenericConfirmationDialogProps} from './GenericConfirmationDialog';
import {GenericDialogProps} from './GenericDialog';
import {SkipDialogProps} from './SkipDialog';
import {StartOverDialogProps} from './StartOverDialog';

export type closeDialogType = () => void;

export enum DialogType {
  StartOver = 'StartOver',
  Skip = 'Skip',
  GenericAlert = 'GenericAlert',
  GenericConfirmation = 'GenericConfirmation',
  GenericDialog = 'GenericDialog',
}

export type TypedDialogProps =
  | (GenericAlertDialogProps & {
      type: DialogType.GenericAlert;
    })
  | (SkipDialogProps & {type: DialogType.Skip})
  | (StartOverDialogProps & {type: DialogType.StartOver})
  | (GenericConfirmationDialogProps & {
      type: DialogType.GenericConfirmation;
    })
  | (GenericDialogProps & {
      type: DialogType.GenericDialog;
    });

export type AnyDialogType =
  | GenericAlertDialogProps
  | SkipDialogProps
  | StartOverDialogProps
  | GenericConfirmationDialogProps
  | GenericDialogProps;
