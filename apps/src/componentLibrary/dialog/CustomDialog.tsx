import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useEffect, useRef} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import useBodyScrollLock from '@cdo/apps/componentLibrary/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@cdo/apps/componentLibrary/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@cdo/apps/componentLibrary/common/hooks/useFocusTrap';

import moduleStyles from './customDialog.module.scss';

export interface CustomDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** CustomDialog title */
  title?: string;
  /** CustomDialog color mode */
  mode?: 'light' | 'dark';
  /** CustomDialog Custom class name */
  className?: string;
  /** CustomDialog onClose handler */
  onClose?: () => void;
  /** CustomDialog close button aria label */
  closeLabel?: string;
  /** CustomDialog  isDescriptionProvided, if true - it means that consumer of CustomDialog*/
  isDescriptionProvided?: boolean;
  /** CustomDialog content */
  children?: ReactNode;
}

// TODO: update docs re dialog vs customDialog and in most cases use dialog

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/CustomDialog.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: CustomDialog Component.
 * Renders CustomDialog with content passed through props.
 */

// general close button with 8 8 px padding
const CustomDialog: React.FunctionComponent<CustomDialogProps> = ({
  title,
  mode = 'light',
  className,
  onClose,
  closeLabel = 'Close dialog',
  isDescriptionProvided = false,
  children,
  ...HTMLAttributes
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useFocusTrap(dialogRef);
  useEscapeKeyHandler(onClose);

  useEffect(() => {
    const hasDescriptionId = dialogRef.current?.querySelector(
      '#dsco-dialog-description'
    );
    if (!hasDescriptionId) {
      console.warn(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have an element with" +
          " id='dsco-dialog-description' to provide a description of dialog for screen readers."
      );
    }
  }, []);

  return (
    <div role="presentation" className={moduleStyles.dialogOverlay}>
      <div
        role="dialog"
        ref={dialogRef}
        aria-modal
        aria-label={title}
        aria-describedby="dsco-dialog-description"
        className={classnames(
          moduleStyles.dialog,
          moduleStyles[`dialog-${mode}`],
          className
        )}
        {...HTMLAttributes}
      >
        {children}

        {onClose && (
          <CloseButton
            aria-label={closeLabel}
            onClick={onClose}
            color={mode === 'light' ? 'dark' : 'light'}
            size="l"
            className={moduleStyles.dialogCloseButton}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDialog;
