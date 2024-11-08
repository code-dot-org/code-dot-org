import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useRef} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import useBodyScrollLock from '@cdo/apps/componentLibrary/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@cdo/apps/componentLibrary/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@cdo/apps/componentLibrary/common/hooks/useFocusTrap';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {BodyTwoText, Heading2} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './dialog.module.scss';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog title */
  title?: string;
  /** Dialog description text */
  description?: string;
  /** Dialog Custom content (rendered right after/instead Dialog description) */
  customContent?: ReactNode;
  /** Custom bottom content (rendered right after Dialog actions section) */
  customBottomContent?: ReactNode;
  /** Whether to show secondary button */
  showSecondaryButton?: boolean;
  /** Dialog color mode */
  mode?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
  /** Dialog onClose handler */
  onClose?: () => void;
  /** Dialog close button aria label */
  closeLabel?: string;
  /** Dialog icon */
  icon?: FontAwesomeV6IconProps;
  /** Dialog image url */
  imageUrl?: string;
}

// TODO:
// * add support of button props
// * add documentation about aria attributes and custom content rendering
// * + Add tests
// * + Add focus trap
// * + add story with custom content
// * + add story with custom actions
// * + add story without close button
// * + add support of
//   +     aria-labelledby="dialog-title"
//   +     aria-describedby="dialog-content"
// * + organize hooks
// * + add colors support

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/DialogTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Dialog Component.
 * Renders Dialog window that user should interact with.
 */
const Dialog: React.FunctionComponent<DialogProps> = ({
  title,
  description,
  showSecondaryButton,
  mode = 'light',
  className,
  customContent,
  customBottomContent,
  onClose,
  closeLabel = 'Close dialog',
  icon,
  imageUrl,
  ...HTMLAttributes
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useFocusTrap(dialogRef);
  useEscapeKeyHandler(onClose);

  return (
    <div role="presentation" className={moduleStyles.dialogOverlay}>
      <div
        role="dialog"
        ref={dialogRef}
        aria-modal
        aria-labelledby="dsco-dialog-title"
        aria-describedby="dsco-dialog-description"
        className={classnames(
          moduleStyles.dialog,
          moduleStyles[`dialog-${mode}`],
          className
        )}
        {...HTMLAttributes}
      >
        <div className={moduleStyles.dialogTextSection}>
          {imageUrl && <img src={imageUrl} alt="Dialog" />}
          <Heading2 id="dsco-dialog-title">{title}</Heading2>
          {description && (
            <BodyTwoText
              id="dsco-dialog-description"
              className={moduleStyles.dialogContent}
            >
              {description}
            </BodyTwoText>
          )}
          {customContent}
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
        {customBottomContent}

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
