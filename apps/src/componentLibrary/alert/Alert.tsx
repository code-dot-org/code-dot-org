import classnames from 'classnames';
import React, {HTMLAttributes, useMemo} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Link, {LinkProps} from '@cdo/apps/componentLibrary/link';

import moduleStyles from './alert.module.scss';

type AlertType = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';

export const alertTypes: {[key in AlertType]: AlertType} = {
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  gray: 'gray',
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Alert text */
  text: string;
  /** Alert link */
  link?: LinkProps;
  /** Alert icon */
  icon?: FontAwesomeV6IconProps;
  /** Show icon */
  showIcon?: boolean;
  /** Alert `isImmediateImportance`. Used to toggle between role='alert' and role='status'
   * By default set to true, which means we'll render role='alert'
   *
   * For context - The `alert` role should only be used for information that requires the user's immediate attention, for example:
   * - An invalid value was entered into a form field
   * - The user's login session is about to expire
   * - The connection to the server was lost so local changes will not be saved.
   *
   * `status` should be used for advisory information for the user that is not important enough to be an alert.
   * */
  isImmediateImportance?: boolean;
  /** Alert custom className */
  type?: AlertType;
  /** Alert on Close callback */
  onClose?: () => void;
  /** Alert close label */
  closeLabel?: string;
  /** Alert custom className */
  className?: string;
  /** Alert size */
  size?: ComponentSizeXSToL;
}

const getDefaultAlertIconFromType = (
  type: AlertType
): FontAwesomeV6IconProps | undefined => {
  const iconMap: Partial<Record<AlertType, FontAwesomeV6IconProps>> = {
    success: {iconName: 'check-circle'},
    danger: {iconName: 'circle-xmark'},
    warning: {iconName: 'exclamation-circle'},
    info: {iconName: 'circle-info'},
  };

  return iconMap[type];
};

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/AlertTest.jsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Alert Component.
 * Renders Alert to notify user about something.
 */
const Alert: React.FunctionComponent<AlertProps> = ({
  text,
  showIcon = true,
  icon,
  link,
  className,
  onClose,
  closeLabel = 'Close alert',
  isImmediateImportance = true,
  type = 'primary',
  size = 'm',
  ...HTMLAttributes
}) => {
  const iconToRender = useMemo(
    () => icon || getDefaultAlertIconFromType(type),
    [icon, type]
  );

  const closeButtonSize = size === 'l' ? 'l' : 'm';

  return (
    <div
      className={classnames(
        moduleStyles.alert,
        moduleStyles[`alert-${type}`],
        moduleStyles[`alert-${size}`],
        className
      )}
      role={isImmediateImportance ? 'alert' : 'status'}
      {...HTMLAttributes}
    >
      <div className={moduleStyles.alertContentContainer}>
        {showIcon && iconToRender && <FontAwesomeV6Icon {...iconToRender} />}
        <span className={moduleStyles.alertText}>{text}</span>
        {link && <Link {...link} size={size} />}
      </div>
      {onClose && (
        <CloseButton
          aria-label={closeLabel}
          onClick={onClose}
          size={closeButtonSize}
        />
      )}
    </div>
  );
};

export default Alert;
