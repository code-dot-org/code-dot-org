import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import React, {useCallback, useContext} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import {
  useEnterKeyboardTrap,
  useEscapeKeyboardTrap,
} from '@cdo/apps/lab2/hooks';
import {Theme, ThemeContext} from '@cdo/apps/lab2/views/ThemeWrapper';
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

type GenericDialogBodyProps =
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
  };

import moduleStyles from './generic-dialog.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

/**
 * Generic root dialog used in Lab2 labs.
 * Allows a title component or title message
 * a body component or message
 * a list of up to three buttons - confirm, cancel, neutral
 * each button takes up to four args - a callback (if not a default will be provided), a label,
 * a disabled flag, and a destructive flag. The confirm button is the only one that can be destructive,
 * and it will be styled as such (red) to provide extra visual warning when attempting to delete something.
 * An accept button is always added, with the default "OK" text if not provided.
 * dialogs maintain a context, which can provide data to any of the callbacks.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

type UseClosingCallbackArgs = {
  closeDialog: DialogCloseFunctionType;
  closeType: DialogCloseActionType;
  callback: dialogCallback | undefined;
  disabled: boolean | undefined;
};

const useClosingCallback = ({
  closeDialog,
  closeType,
  callback,
  disabled,
}: UseClosingCallbackArgs) =>
  useCallback(() => {
    if (!disabled) {
      closeDialog(closeType);
      callback && callback();
    }
  }, [closeDialog, closeType, callback, disabled]);

const GenericDialog: React.FunctionComponent<GenericDialogProps> = ({
  buttons,
  title,
  titleComponent,
  message,
  bodyComponent,
}) => {
  const dialogControl = useDialogControl();

  const {theme} = useContext(ThemeContext);

  const cancelCallback = useClosingCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'cancel',
    callback: buttons?.cancel?.callback,
    disabled: buttons?.cancel?.disabled,
  });

  const neutralCallback = useClosingCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'neutral',
    callback: buttons?.neutral?.callback,
    disabled: buttons?.neutral?.disabled,
  });

  const confirmCallback = useClosingCallback({
    closeDialog: dialogControl.closeDialog,
    closeType: 'confirm',
    callback: buttons?.confirm?.callback,
    disabled: buttons?.confirm?.disabled,
  });

  useEscapeKeyboardTrap(cancelCallback);
  useEnterKeyboardTrap(confirmCallback);

  return (
    <FocusTrap>
      <div className={moduleStyles['genericDialog-' + theme]}>
        {titleComponent ? (
          titleComponent
        ) : title ? (
          <Heading3>{title}</Heading3>
        ) : null}

        {bodyComponent || <BodyTwoText>{message}</BodyTwoText>}
        <div className={moduleStyles.buttonContainer}>
          <div className={moduleStyles.outerButtonContainer}>
            {buttons?.cancel ? (
              <Button
                onClick={cancelCallback}
                className={classNames(moduleStyles.cancel, {
                  [darkModeStyles.secondaryButton]: theme === Theme.DARK,
                })}
                type="secondary"
                disabled={buttons.cancel.disabled}
                color={
                  theme === Theme.DARK ? buttonColors.white : buttonColors.gray
                }
                text={buttons.cancel.text || commonI18n.cancel()}
              />
            ) : (
              <div />
            )}
            <div className={moduleStyles.innerButtonContainer}>
              {buttons?.neutral && (
                <Button
                  onClick={neutralCallback}
                  type="secondary"
                  disabled={buttons.neutral.disabled}
                  color={buttonColors.gray}
                  text={buttons.neutral.text}
                />
              )}
              <Button
                onClick={confirmCallback}
                className={classNames({
                  [darkModeStyles.primaryButton]: theme === Theme.DARK,
                })}
                disabled={buttons?.confirm?.disabled}
                type="primary"
                color={
                  buttons?.confirm?.destructive
                    ? buttonColors.destructive
                    : theme === Theme.DARK
                    ? buttonColors.white
                    : buttonColors.purple
                }
                text={buttons?.confirm?.text || commonI18n.dialogOK()}
              />
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

export default GenericDialog;
