import Button from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import React, {useMemo} from 'react';

import {useEnterKeyboardTrap} from '@cdo/apps/lab2/hooks';
import commonI18n from '@cdo/locale';

import {useDialogControl} from './DialogControlContext';
import {DialogCloseFunctionType, DialogCloseActionType} from './types';

export type ButtonType = 'confirm' | 'cancel' | 'neutral';

export type dialogCallback = (args?: unknown) => void;

type GenericDialogTitleProps =
  | {
      title?: never;
      titleComponent?: React.ReactNode;
    }
  | {
      title?: string;
      titleComponent?: never;
    };

export type GenericDialogBodyProps =
  | {
      message?: never;
      bodyComponent?: React.ReactNode;
    }
  | {
      message?: string;
      bodyComponent?: never;
    };

export type GenericDialogProps = GenericDialogTitleProps &
  GenericDialogBodyProps & {
    buttons?: {
      [key in ButtonType]?: {
        text?: string;
        callback?: dialogCallback;
        disabled?: boolean;
        destructive?: boolean;
      };
    };
    getButtonCallback?: typeof defaultGetButtonCallback;
  };

import moduleStyles from './generic-dialog.module.scss';

/**
 * Generic dialog component for Lab2 labs, built on the DSCO Modal component.
 *
 * Supports:
 * - A title string or custom title component
 * - A message string or custom body component
 * - Up to three buttons: confirm, cancel, and neutral
 *
 * Each button accepts: text, callback, disabled, and destructive flags.
 * The confirm button defaults to "OK" and can be styled as destructive (red).
 * The cancel button defaults to "Cancel" and appears as a secondary button.
 * When all three buttons are present, cancel moves to the bottom content area.
 *
 * Dialogs use DialogControlContext to manage closing behavior.
 */

export type GetButtonCallbackArgs = {
  closeDialog: DialogCloseFunctionType;
  closeType: DialogCloseActionType;
  callback: dialogCallback | undefined;
  disabled: boolean | undefined;
};

export const defaultGetButtonCallback =
  ({closeDialog, closeType, callback, disabled}: GetButtonCallbackArgs) =>
  () => {
    if (!disabled) {
      closeDialog(closeType);
      callback && callback();
    }
  };

const useButtonCallback = ({
  closeDialog,
  closeType,
  callback,
  disabled,
  getButtonCallback,
}: GetButtonCallbackArgs & {
  getButtonCallback: typeof defaultGetButtonCallback;
}) =>
  useMemo(
    () => getButtonCallback({closeDialog, closeType, callback, disabled}),
    [closeDialog, closeType, callback, disabled, getButtonCallback]
  );

const GenericDialog: React.FunctionComponent<GenericDialogProps> = ({
  buttons,
  title,
  message,
  bodyComponent,
  getButtonCallback = defaultGetButtonCallback,
}) => {
  const dialogControl = useDialogControl();

  const {theme} = useTheme();

  const cancelCallback = useButtonCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'cancel',
    callback: buttons?.cancel?.callback,
    disabled: buttons?.cancel?.disabled,
    getButtonCallback,
  });

  const neutralCallback = useButtonCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'neutral',
    callback: buttons?.neutral?.callback,
    disabled: buttons?.neutral?.disabled,
    getButtonCallback,
  });

  const confirmCallback = useButtonCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'confirm',
    callback: buttons?.confirm?.callback,
    disabled: buttons?.confirm?.disabled,
    getButtonCallback,
  });

  useEnterKeyboardTrap(confirmCallback);

  return (
    <Modal
      title={title}
      customContent={bodyComponent || message}
      customBottomContent={
        buttons?.neutral && buttons?.cancel ? (
          <Button
            onClick={cancelCallback}
            type="secondary"
            disabled={buttons.cancel.disabled}
            color={theme === 'Dark' ? 'white' : 'gray'}
            text={buttons.cancel.text || commonI18n.cancel()}
          />
        ) : undefined
      }
      onClose={buttons?.cancel ? cancelCallback : undefined}
      className={moduleStyles.genericDialog}
      primaryButtonProps={{
        onClick: confirmCallback,
        disabled: buttons?.confirm?.disabled,
        color: buttons?.confirm?.destructive ? 'destructive' : 'purple',
        text: buttons?.confirm?.text || commonI18n.dialogOK(),
        id: 'uitest-generic-dialog-ok',
      }}
      secondaryButtonProps={
        buttons?.neutral
          ? {
              onClick: neutralCallback,
              disabled: buttons.neutral.disabled,
              color: buttons.neutral.destructive ? 'destructive' : 'white',
              text: buttons.neutral.text,
            }
          : buttons?.cancel
          ? {
              onClick: cancelCallback,
              disabled: buttons.cancel.disabled,
              color: theme === 'Dark' ? 'white' : 'gray',
              text: buttons.cancel.text || commonI18n.cancel(),
            }
          : undefined
      }
    />
  );
};

export default GenericDialog;
