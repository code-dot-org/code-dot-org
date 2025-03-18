import classnames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import {Button, ButtonProps} from '@/button';
import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import {BodyTwoText, Heading2} from '@/typography';

import CustomDialog from './CustomDialog';
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
 *  * (see ./__tests__/Dialog.test.tsx)
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
}) => (
  <CustomDialog
    role="alertdialog"
    className={classnames(
      moduleStyles.dialog,
      moduleStyles[`dialog-${mode}`],
      className,
    )}
    onClose={onClose}
    closeLabel={closeLabel}
    aria-label={title}
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
  </CustomDialog>
);

export default Dialog;
