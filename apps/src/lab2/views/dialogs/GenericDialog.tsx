import React from 'react';

import Typography from '@cdo/apps/componentLibrary/typography';
import commonI18n from '@cdo/locale';

import {useDialogControl} from './DialogContext';
import {closeDialogType} from './types';

export type ButtonType = 'confirm' | 'cancel' | 'neutral';

export type dialogCallback = (args?: unknown) => void;

export interface GenericDialogProps {
  buttons?: {
    [key in ButtonType]?: {
      text?: string;
      callback?: dialogCallback;
    };
  };

  title?: string;
  TitleComponent?: React.FunctionComponent;
  message?: string;
  BodyComponent?: React.FunctionComponent;
}

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
  (closeDialog: closeDialogType, callback: dialogCallback | undefined) =>
  () => {
    closeDialog();
    callback && callback();
  };

const GenericDialog: React.FunctionComponent<GenericDialogProps> = ({
  buttons,
  title,
  TitleComponent,
  message,
  BodyComponent,
}) => {
  const dialogControl = useDialogControl();

  return (
    <div className={moduleStyles.genericDialog}>
      {TitleComponent ? (
        <TitleComponent />
      ) : (
        <Typography semanticTag="h1" visualAppearance="heading-lg">
          {title}
        </Typography>
      )}
      {BodyComponent ? (
        <BodyComponent />
      ) : (
        <Typography semanticTag="p" visualAppearance="body-two">
          {message}
        </Typography>
      )}
      <div className={moduleStyles.buttonContainer}>
        <div className={moduleStyles.outerButtonContainer}>
          {buttons?.cancel ? (
            <button
              className={moduleStyles.cancel}
              type="button"
              onClick={closingCallback(
                dialogControl.closeDialog,
                buttons.cancel.callback
              )}
            >
              {buttons.cancel.text || commonI18n.cancel()}
            </button>
          ) : (
            <div />
          )}
          <div className={moduleStyles.innerButtonContainer}>
            {buttons?.neutral && (
              <button
                className={moduleStyles.neutral}
                type="button"
                onClick={closingCallback(
                  dialogControl.closeDialog,
                  buttons.neutral.callback
                )}
              >
                {buttons.neutral.text}
              </button>
            )}

            <button
              className={moduleStyles.confirm}
              type="button"
              onClick={closingCallback(
                dialogControl.closeDialog,
                buttons?.confirm?.callback
              )}
            >
              {buttons?.confirm?.text || commonI18n.dialogOK()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericDialog;
