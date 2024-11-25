import classnames from 'classnames';
import React, {HTMLAttributes, ReactNode, useRef} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';
import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import useBodyScrollLock from '@cdo/apps/componentLibrary/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@cdo/apps/componentLibrary/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@cdo/apps/componentLibrary/common/hooks/useFocusTrap';
import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './modal.module.scss';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Modal title */
  title?: string;
  /** Modal description text */
  description?: string;
  /** Modal Custom content (rendered right after/instead Modal description) */
  customContent?: ReactNode;
  /** Custom bottom content (rendered right after Modal actions section).
   *  If this is rendered when there's no `description` prop - make sure to add `dsco-dialog-description` `id`
   *  to the element in custom content which will be representing the dialog description. (Used by screen readers
   *  for dialog's `aria-describedBy` attribute) */
  customBottomContent?: ReactNode;
  /** Modal primary button props */
  primaryButtonProps: ButtonProps;
  /** Modal secondary button props */
  secondaryButtonProps?: ButtonProps;
  /** Modal color mode */
  mode?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
  /** Modal onClose handler */
  onClose?: () => void;
  /** Modal close button aria label */
  closeLabel?: string;
  /** Modal image url */
  imageUrl?: string;
  /** Modal image alt */
  imageAlt?: string;
  /** Modal image placement */
  imagePlacement?: 'top' | 'inline';
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/ModalTest.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Modal Component.
 * Renders Modal window that user should interact with.
 */
const Modal: React.FunctionComponent<ModalProps> = ({
  title,
  description,
  primaryButtonProps,
  secondaryButtonProps,
  mode = 'light',
  className,
  customContent,
  customBottomContent,
  onClose,
  closeLabel = 'Close modal',
  imageUrl,
  imageAlt,
  imagePlacement = 'top',
  ...HTMLAttributes
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useFocusTrap(modalRef);
  useEscapeKeyHandler(onClose);

  return (
    <div role="presentation" className={moduleStyles.modalOverlay}>
      <div
        role="dialog"
        ref={modalRef}
        aria-modal
        aria-label={title}
        aria-describedby="dsco-dialog-description"
        className={classnames(
          moduleStyles.modal,
          moduleStyles[`modal-${mode}`],
          className
        )}
        {...HTMLAttributes}
      >
        <div className={moduleStyles.modalTitleSection}>
          <Heading3>{title}</Heading3>
        </div>
        <hr />
        <div
          className={classnames(
            moduleStyles.modalContentSection,
            moduleStyles[`modalContentSection-${imagePlacement}-imagePlacement`]
          )}
        >
          {imageUrl && <img src={imageUrl} alt={imageAlt || 'modal-image'} />}
          {description && (
            <BodyTwoText
              id="dsco-dialog-description"
              className={moduleStyles.modalDescription}
            >
              {description}
            </BodyTwoText>
          )}
          {customContent}
        </div>
        <hr />
        <div className={moduleStyles.modalActionsSection}>
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

        {onClose && (
          <CloseButton
            aria-label={closeLabel}
            onClick={onClose}
            color={mode === 'light' ? 'dark' : 'light'}
            size="l"
            className={moduleStyles.modalCloseButton}
          />
        )}
      </div>
    </div>
  );
};

export default Modal;
