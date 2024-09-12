import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import Typography from '@cdo/apps/componentLibrary/typography';
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
      };
    };
  };

import moduleStyles from './generic-dialog.module.scss';

/**
 * Generic root dialog used in Lab2 labs.
 * Allows a title component or title message
 * a body component or message
 * a list of up to three buttons - confirm, cancel, neutral
 * each button takes up to two args - a callback (if not a default will be provided), and a label.
 * An accept button is always added, with the default "OK" text if not provided.
 * dialogs maintain a context, which can provide data to any of the callbacks.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

const closingCallback =
  (
    closeDialog: DialogCloseFunctionType,
    closeType: DialogCloseActionType,
    callback: dialogCallback | undefined
  ) =>
  () => {
    closeDialog(closeType);
    callback && callback();
  };

const GenericDialog: React.FunctionComponent<GenericDialogProps> = ({
  buttons,
  title,
  titleComponent,
  message,
  bodyComponent,
}) => {
  const dialogControl = useDialogControl();

  return (
    <div className={moduleStyles.genericDialog}>
      {titleComponent || (
        <Typography semanticTag="h1" visualAppearance="heading-lg">
          {title}
        </Typography>
      )}

      {bodyComponent || (
        <Typography semanticTag="p" visualAppearance="body-two">
          {message}
        </Typography>
      )}
      <div className={moduleStyles.buttonContainer}>
        <div className={moduleStyles.outerButtonContainer}>
          {buttons?.cancel ? (
            <Button
              onClick={closingCallback(
                dialogControl.closeDialog,
                'cancel',
                buttons.cancel.callback
              )}
              className={moduleStyles.cancel}
              type="secondary"
              disabled={buttons.cancel.disabled}
              color={buttonColors.gray}
              text={buttons.cancel.text || commonI18n.cancel()}
            />
          ) : (
            <div />
          )}
          <div className={moduleStyles.innerButtonContainer}>
            {buttons?.neutral && (
              <Button
                onClick={closingCallback(
                  dialogControl.closeDialog,
                  'neutral',
                  buttons.neutral.callback
                )}
                type="secondary"
                disabled={buttons.neutral.disabled}
                color={buttonColors.gray}
                text={buttons.neutral.text}
              />
            )}
            <Button
              onClick={closingCallback(
                dialogControl.closeDialog,
                'confirm',
                buttons?.confirm?.callback
              )}
              disabled={buttons?.confirm?.disabled}
              type="primary"
              color={
                buttons?.confirm?.text === codebridgeI18n.delete()
                  ? buttonColors.destructive
                  : buttonColors.purple
              }
              text={buttons?.confirm?.text || commonI18n.dialogOK()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericDialog;
