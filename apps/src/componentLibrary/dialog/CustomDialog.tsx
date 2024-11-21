import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useRef} from 'react';

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
  children,
  ...HTMLAttributes
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useFocusTrap(dialogRef);
  useEscapeKeyHandler(onClose);

  // useEffect(() => {
  //   if (!description && customContent) {
  //     const hasDescriptionId = dialogRef.current?.querySelector(
  //       '#dsco-dialog-description'
  //     );
  //     if (!hasDescriptionId) {
  //       console.warn(
  //         "Warning: When 'description' is not provided, customContent must include an element with ID 'dsco-dialog-description' for accessibility."
  //       );
  //     }
  //   }
  // }, [description, customContent]);

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
      </div>
    </div>
  );
};

export default CustomDialog;
