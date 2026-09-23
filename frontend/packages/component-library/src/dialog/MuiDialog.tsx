import {
  Button,
  ButtonProps,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import {ReactNode, useId} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

import MuiCustomDialog, {
  DIALOG_DESCRIPTION_ID,
  MuiCustomDialogProps,
} from './MuiCustomDialog';

import moduleStyles from './muiDialog.module.scss';

export interface MuiDialogProps extends MuiCustomDialogProps {
  /** Dialog title; rendered as the h2 that names the dialog. */
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
  /** Dialog icon, shown in a badge over the top edge */
  icon?: FontAwesomeV6IconProps;
  /** Dialog image url */
  imageUrl?: string;
  /**
   * Alt text for the image. Defaults to the legacy literal "Dialog"; pass what
   * the image shows, or "" when it is decorative.
   */
  imageAlt?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/MuiDialog.test.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Dialog on MUI `Dialog`, built on MuiCustomDialog.
 * Same props as the legacy Dialog; the alertdialog role and h2 title are the
 * hooks UI tests depend on.
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
  icon,
  imageUrl,
  imageAlt = 'Dialog',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...customDialogProps
}) => {
  // React ids carry colons, which break `#id` selectors in name computation.
  const titleId = `dialog-title-${useId().replace(/:/g, '')}`;

  return (
    <MuiCustomDialog
      role="alertdialog"
      mode={mode}
      className={classNames(moduleStyles.dialog, className)}
      aria-label={ariaLabel}
      // The h2 names the dialog only when it has text; pointing at an empty
      // heading would silence MuiCustomDialog's missing-name warning.
      aria-labelledby={
        ariaLabelledBy ?? (!ariaLabel && title ? titleId : undefined)
      }
      {...customDialogProps}
    >
      <div className={moduleStyles.dialogTextSection}>
        {imageUrl && <img src={imageUrl} alt={imageAlt} />}
        <DialogTitle
          id={titleId}
          variant="h2"
          className={moduleStyles.dialogTitle}
        >
          {title}
        </DialogTitle>
        {(description || customContent) && (
          <DialogContent className={moduleStyles.dialogContent}>
            {description && (
              <Typography
                id={DIALOG_DESCRIPTION_ID}
                className={moduleStyles.dialogDescription}
                variant="body2"
              >
                {description}
              </Typography>
            )}
            {customContent}
          </DialogContent>
        )}
      </div>
      <DialogActions
        disableSpacing
        className={moduleStyles.dialogActionsSection}
      >
        {secondaryButtonProps && (
          <Button
            variant="outlined"
            color={mode === 'light' ? 'secondary' : 'white'}
            {...secondaryButtonProps}
          />
        )}
        <Button
          variant="contained"
          color={mode === 'light' ? 'primary' : 'white'}
          {...primaryButtonProps}
        />
      </DialogActions>
      {customBottomContent}

      {icon && (
        <FontAwesomeV6Icon
          {...icon}
          className={classNames(moduleStyles.dialogIcon, icon.className)}
        />
      )}
    </MuiCustomDialog>
  );
};

export default MuiDialog;
