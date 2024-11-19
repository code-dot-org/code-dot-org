import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode} from 'react';

import {Button} from '@/button';
import CloseButton from '@/closeButton';

import moduleStyles from './modal.module.scss';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Modal title */
  title?: string;
  /** Modal image url */
  modalImageUrl?: string;
  /** Whether to show image as inline element */
  isImageInline?: boolean;
  /** Modal content */
  content?: string | ReactNode;
  /** Whether to show secondary button */
  showSecondaryButton?: boolean;
  /** Custom class name */
  className?: string;
  /** Modal onClose handler */
  onClose?: () => void;
  /** Modal close button aria label */
  closeLabel?: string;
  /** Modal color */
  color?: 'light' | 'dark';
}

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (?) has storybook, covered with stories and documentation;
 *  * (?) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/ModalTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Modal Component.
 * Renders Alert to notify user about something.
 */
const Modal: React.FunctionComponent<ModalProps> = ({
  title,
  color = 'light',
  content,
  showSecondaryButton,
  className,
  onClose,
  closeLabel = 'Close dialog',
  ...HTMLAttributes
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.dialog,
        moduleStyles[`dialog-${color}`],
        className
      )}
      role="dialog"
      {...HTMLAttributes}
    >
      <div>
        <span>{title}</span>
        <span className={moduleStyles.dialogContent}>{content}</span>
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
      {onClose && (
        <CloseButton aria-label={closeLabel} onClick={onClose} size="l" />
      )}
    </div>
  );
};

export default Modal;
