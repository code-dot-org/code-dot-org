import classnames from 'classnames';
import React, {
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import {useBodyScrollLock} from '@cdo/apps/componentLibrary/common/hooks/useBodyScrollLock';
import useFocusTrap from '@cdo/apps/componentLibrary/common/hooks/useFocusTrap';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {BodyTwoText, Heading2} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './dialog.module.scss';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog title */
  title?: string;
  /** Dialog content */
  content?: string | ReactNode;
  /** Whether to show secondary button */
  showSecondaryButton?: boolean;
  /** Dialog color mode */
  mode?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
  /** Dialog onClose handler */
  onClose: () => void;
  /** Dialog close button aria label */
  closeLabel?: string;
  /** Dialog icon */
  icon?: FontAwesomeV6IconProps;
  /** Dialog image url */
  imageUrl?: string;
}

// TODO:
//  * + Add focus trap
// * add story with custom content
// * add story with custom actions
// * add story without close button
// * add support of    aria-labelledby="dialog-title"
//         aria-describedby="dialog-content"
// * organize hooks
//  * Add tests
//  * + add colors support

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (?) has storybook, covered with stories and documentation;
 *  * (?) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/DialogTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Dialog Component.
 * Renders Alert to notify user about something.
 */
const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  content,
  showSecondaryButton,
  mode = 'light',
  className,
  onClose,
  closeLabel = 'Close dialog',
  icon,
  imageUrl,
  ...HTMLAttributes
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle closing the dialog with Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useFocusTrap(dialogRef);
  useBodyScrollLock(true);

  return (
    <div role="presentation" className={moduleStyles.dialogOverlay}>
      <div
        role="dialog"
        ref={dialogRef}
        aria-modal
        aria-labelledby="dialog-title"
        aria-describedby="dialog-content"
        className={classnames(
          moduleStyles.dialog,
          moduleStyles[`dialog-${mode}`],
          className
        )}
        {...HTMLAttributes}
      >
        <div className={moduleStyles.dialogTextSection}>
          {imageUrl && <img src={imageUrl} alt="Dialog" />}
          <Heading2>{title}</Heading2>
          <BodyTwoText className={moduleStyles.dialogContent}>
            {content}
          </BodyTwoText>
        </div>
        <div className={moduleStyles.dialogActionsSection}>
          {showSecondaryButton && (
            <Button
              type="secondary"
              color={mode === 'light' ? 'black' : 'white'}
              text="Secondary Button"
              onClick={() => null}
            />
          )}
          <Button
            type="primary"
            color={mode === 'light' ? 'purple' : 'white'}
            text="Primary Button"
            onClick={() => null}
          />
        </div>

        {icon && (
          <FontAwesomeV6Icon {...icon} className={moduleStyles.dialogIcon} />
        )}
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

export default Dialog;
