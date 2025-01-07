import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useEffect, useRef} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import useBodyScrollLock from '@cdo/apps/componentLibrary/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@cdo/apps/componentLibrary/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@cdo/apps/componentLibrary/common/hooks/useFocusTrap';

import moduleStyles from './customDialog.module.scss';

export interface CustomDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** CustomDialog color mode */
  mode?: 'light' | 'dark';
  /** CustomDialog Custom class name */
  className?: string;
  /** CustomDialog onClose handler */
  onClose?: () => void;
  /** CustomDialog close button aria label */
  closeLabel?: string;
  /** CustomDialog content */
  children?: ReactNode;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/CustomDialogTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: CustomDialog Component.
 * Renders CustomDialog with content passed through props.
 */

const CustomDialog: React.FunctionComponent<CustomDialogProps> = ({
  mode = 'light',
  className,
  onClose,
  closeLabel = 'Close dialog',
  children,
  ['aria-label']: ariaLabel,
  ['aria-labelledby']: ariaLabelledBy,
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

  useEffect(() => {
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have" +
          ' an aria-label or aria-labelledby attribute.'
      );
    }
  }, [ariaLabel, ariaLabelledBy]);

  return (
    <div role="presentation" className={moduleStyles.customDialogOverlay}>
      <div
        role="dialog"
        ref={dialogRef}
        aria-modal
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby="dsco-dialog-description"
        className={classnames(
          moduleStyles.customDialog,
          moduleStyles[`customDialog-${mode}`],
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
            className={moduleStyles.customDialogCloseButton}
          />
        )}
      </div>
    </div>
  );
};

export default CustomDialog;
