import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useCallback, useEffect} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {BodyTwoText, Heading2} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './dialog.module.scss';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog type*/
  type?: 'noIcon' | 'withIconFill' | 'withIconFA';
  /** Dialog title */
  title?: string;
  /** Dialog content */
  content?: string | ReactNode;
  /** Whether to show secondary button */
  showSecondaryButton?: boolean;
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
  type = 'noIcon',
  content,
  showSecondaryButton,
  className,
  onClose,
  closeLabel = 'Close dialog',
  icon,
  imageUrl,
  ...HTMLAttributes
}) => {
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

  return (
    <div role="presentation" className={moduleStyles.dialogOverlay}>
      <div
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-content"
        // tabIndex={-1}  // Make the dialog container focusable
        className={classnames(
          moduleStyles.dialog,
          moduleStyles[`dialog-${type}`],
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
              color="black"
              text="Secondary Button"
              onClick={() => null}
            />
          )}
          <Button
            type="primary"
            color="purple"
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
            size="l"
            className={moduleStyles.dialogCloseButton}
          />
        )}
      </div>
    </div>
  );
};

export default Dialog;
