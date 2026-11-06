import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography as MuiTypography,
} from '@mui/material';
import classnames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import CustomDialog from '@/dialog/CustomDialog';

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
  primaryButtonProps: MuiButtonProps;
  /** Modal secondary button props */
  secondaryButtonProps?: MuiButtonProps;
  /** @deprecated Modal color mode - use theme provider instead. This prop will be removed in a future version. */
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
 *  * (see ./__tests__/Modal.test.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Modal Component.
 * Renders Modal window that user should interact with.
 *
 * ## Deprecation Notice
 * The `mode` prop is deprecated and will be removed in a future version.
 * Use the theme provider instead for consistent theming across your application.
 */
const Modal: React.FunctionComponent<ModalProps> = ({
  title,
  description,
  primaryButtonProps,
  secondaryButtonProps,
  mode,
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
  // Deprecation warning for mode prop
  if (mode) {
    console.warn(
      `Modal: The 'mode' prop is deprecated and will be removed in a future version. ` +
        `Use the theme provider instead. Current usage: mode="${mode}"`,
    );
  }

  return (
    <CustomDialog
      role="dialog"
      className={classnames(
        moduleStyles.modal,
        mode && moduleStyles[`modal-${mode}`],
        className,
      )}
      onClose={onClose}
      closeLabel={closeLabel}
      aria-label={title}
      {...HTMLAttributes}
    >
      <div className={moduleStyles.modalTitleSection}>
        <MuiTypography variant="h3" gutterBottom>
          {title}
        </MuiTypography>
      </div>
      <hr />
      <div
        className={classnames(
          moduleStyles.modalContentSection,
          moduleStyles[`modalContentSection-${imagePlacement}-imagePlacement`],
        )}
      >
        {imageUrl && <img src={imageUrl} alt={imageAlt || ''} />}
        {description && (
          <MuiTypography
            id="dsco-dialog-description"
            className={moduleStyles.modalDescription}
            variant="body2"
            gutterBottom
          >
            {description}
          </MuiTypography>
        )}
        {customContent}
      </div>
      <hr />
      <div className={moduleStyles.modalActionsSection}>
        {secondaryButtonProps && (
          <MuiButton
            variant="outlined"
            color={mode === 'dark' ? 'white' : 'secondary'}
            {...secondaryButtonProps}
          />
        )}
        <MuiButton
          variant="contained"
          color={mode === 'dark' ? 'white' : 'primary'}
          {...primaryButtonProps}
        />
      </div>
      {customBottomContent}
    </CustomDialog>
  );
};

export default Modal;
