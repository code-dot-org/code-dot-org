import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import type {FunctionComponent, ReactNode} from 'react';
import {useMemo} from 'react';

import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';

import {useDialogControl} from '../../contexts/DialogControlContext';
import {useEnterKeyboardTrap, useEscapeKeyboardTrap} from '../../hooks';
import type {DialogCloseFunctionType, DialogCloseActionType} from '../types';

export type ButtonType = 'confirm' | 'cancel' | 'neutral';

export type dialogCallback = (args?: unknown) => void;

type GenericDialogTitleProps = {
  title?: string;
};

export type GenericDialogBodyProps =
  | {
      message?: never;
      bodyComponent?: ReactNode;
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
 * Generic dialog for the labs, on the design system's Dialog.
 *
 * A title, a message or a body component, and up to three buttons: confirm,
 * cancel and neutral. Each button takes a label, a callback, a disabled flag
 * and a destructive flag; a destructive confirm is drawn red. The confirm
 * button is always there, labelled "OK" unless told otherwise. With all three
 * buttons, cancel moves to the content below the others.
 *
 * Mirrors `apps/src/lab2/views/dialogs/GenericDialog.tsx`, with one
 * difference kept on purpose: ENTER CONFIRMS. A prompt here is typed into and
 * submitted with Enter (`GenericPrompt` has no key handling of its own), and
 * the labs on this package rely on that.
 *
 * Dialogs close through DialogControlContext.
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
      callback?.();
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
    [closeDialog, closeType, callback, disabled, getButtonCallback],
  );

// Escape when there is no cancel button; the dialog's own close button
// answers it when there is.
const noop = () => {};

const GenericDialog: FunctionComponent<GenericDialogProps> = ({
  buttons,
  title,
  message,
  bodyComponent,
  getButtonCallback = defaultGetButtonCallback,
}) => {
  const dialogControl = useDialogControl();

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

  // An alert has no cancel button and so no close button, but Escape has
  // always dismissed it.
  useEscapeKeyboardTrap(buttons?.cancel ? noop : cancelCallback);
  useEnterKeyboardTrap(confirmCallback);

  const isDestructive = buttons?.confirm?.destructive;

  return (
    <Dialog
      title={title}
      customContent={
        <div id="dsco-dialog-description">{bodyComponent || message}</div>
      }
      customBottomContent={
        buttons?.neutral && buttons?.cancel ? (
          <MuiButton
            variant="text"
            color="primary"
            size="medium"
            disabled={buttons.cancel.disabled}
            onClick={cancelCallback}
            type="button"
          >
            {buttons.cancel.text || 'Cancel'}
          </MuiButton>
        ) : undefined
      }
      onClose={buttons?.cancel ? cancelCallback : undefined}
      className={classNames(
        moduleStyles.genericDialog,
        isDestructive && moduleStyles.destructive,
        moduleStyles.dialogOnlyStyle,
      )}
      primaryButtonProps={{
        onClick: confirmCallback,
        disabled: buttons?.confirm?.disabled,
        color: isDestructive ? 'error' : 'primary',
        children: buttons?.confirm?.text || 'OK',
        id: 'uitest-generic-dialog-ok',
      }}
      secondaryButtonProps={
        buttons?.neutral
          ? {
              onClick: neutralCallback,
              disabled: buttons.neutral.disabled,
              color: isDestructive ? 'error' : 'tertiary',
              children: buttons.neutral.text,
            }
          : buttons?.cancel
            ? {
                onClick: cancelCallback,
                disabled: buttons.cancel.disabled,
                color: 'tertiary',
                children: buttons.cancel.text || 'Cancel',
              }
            : undefined
      }
    />
  );
};

export default GenericDialog;
