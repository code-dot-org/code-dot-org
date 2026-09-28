import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  Typography as MuiTypography,
} from '@mui/material';
import classnames from 'classnames';
import {HTMLAttributes, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import MuiCustomDialog from './MuiCustomDialog';

import moduleStyles from './muiDialog.module.scss';

export interface MuiDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog title; also the panel's aria-label */
  title?: string;
  /** Dialog description text */
  description?: string;
  /** Custom content, rendered after (or instead of) the description.
   *  Without `description`, give the element that describes the dialog `id="dsco-dialog-description"`;
   *  the panel's `aria-describedby` points at it. */
  customContent?: ReactNode;
  /** Custom bottom content, rendered after the actions row */
  customBottomContent?: ReactNode;
  /** Primary button props */
  primaryButtonProps: MuiButtonProps;
  /** Secondary button props; the button renders only when these are passed */
  secondaryButtonProps?: MuiButtonProps;
  /** Button color: 'light' uses primary/secondary, 'dark' uses white. The panel does not change. */
  mode?: 'light' | 'dark';
  /** Custom class name, applied to the panel (the role="alertdialog" element) */
  className?: string;
  /** onClose handler. Without it there is no close button and Escape does nothing. */
  onClose?: () => void;
  /** Close button aria label */
  closeLabel?: string;
  /** Icon shown in a badge on the panel's top edge */
  icon?: FontAwesomeV6IconProps;
  /** Image url, shown above the title */
  imageUrl?: string;
  /** Image alt text; the default '' marks the image decorative */
  imageAlt?: string;
  /** z-index for the overlay, set through --cdo-dialog-z-index. See variables.scss for the default. */
  zIndex?: number;
}

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Dialog on `MuiCustomDialog`, with a title, description,
 * actions, and an optional icon badge or image.
 */
const MuiDialog: React.FunctionComponent<MuiDialogProps> = ({
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
  imageAlt = '',
  zIndex,
  ...HTMLAttributes
}) => (
  <MuiCustomDialog
    role="alertdialog"
    className={classnames(moduleStyles.dialog, className)}
    onClose={onClose}
    closeLabel={closeLabel}
    aria-label={title}
    zIndex={zIndex}
    {...HTMLAttributes}
  >
    <div className={moduleStyles.dialogTextSection}>
      {imageUrl && <img src={imageUrl} alt={imageAlt} />}
      <MuiTypography variant="h2" gutterBottom>
        {title}
      </MuiTypography>
      {description && (
        <MuiTypography
          id="dsco-dialog-description"
          className={moduleStyles.dialogContent}
          variant="body2"
          gutterBottom
        >
          {description}
        </MuiTypography>
      )}
      {customContent}
    </div>
    <div className={moduleStyles.dialogActionsSection}>
      {secondaryButtonProps && (
        <MuiButton
          variant="outlined"
          color={mode === 'light' ? 'secondary' : 'white'}
          {...secondaryButtonProps}
        />
      )}
      <MuiButton
        variant="contained"
        color={mode === 'light' ? 'primary' : 'white'}
        {...primaryButtonProps}
      />
    </div>
    {customBottomContent}

    {icon && (
      <FontAwesomeV6Icon {...icon} className={moduleStyles.dialogIcon} />
    )}
  </MuiCustomDialog>
);

export default MuiDialog;
