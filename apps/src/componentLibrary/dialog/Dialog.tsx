import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useRef} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';
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
  /** Dialog Custom content (rendered right after/instead Dialog description)
   *  If this is rendered when there's no `description` prop - make sure to add `dsco-dialog-description` `id`
   *  to the element in custom content which will be representing the dialog description. (Used by screen readers
   *  for dialog's `aria-describedBy` attribute)
   *  */
  customContent?: ReactNode;
  /** Custom bottom content (rendered right after Dialog actions section). */
  customBottomContent?: ReactNode;
  /** Dialog primary button props */
  primaryButtonProps: ButtonProps;
  /** Dialog secondary button props */
  secondaryButtonProps?: ButtonProps;
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

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
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
  primaryButtonProps,
  secondaryButtonProps,
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
        aria-label={title}
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
          <Heading2>{title}</Heading2>
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
          {secondaryButtonProps && (
            <Button
              type="secondary"
              color={mode === 'light' ? 'black' : 'white'}
              {...secondaryButtonProps}
            />
          )}
          <Button
            type="primary"
            color={mode === 'light' ? 'purple' : 'white'}
            {...primaryButtonProps}
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
