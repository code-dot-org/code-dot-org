import classnames from 'classnames';
import React, {useMemo} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Link, {LinkProps} from '@cdo/apps/componentLibrary/link';

import moduleStyles from './alert.module.scss';

type AlertType = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';

export interface AlertProps {
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
 *  * (?) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/AlertTest.jsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
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
  isImmediateImportance = true,
  type = 'primary',
  size = 'm',
}) => {
  const iconToRender = useMemo(
    () => icon || getDefaultAlertIconFromType(type),
    [icon, type]
  );

  // TODO:
  // 1. Add close button to the alert
  // 3. Update Link to support text prop, not only children props
  // 4. Update README.md

  return (
    <div
      className={classnames(
        moduleStyles.alert,
        moduleStyles[`alert-${type}`],
        moduleStyles[`alert-${size}`],
        className
      )}
      role={isImmediateImportance ? 'alert' : 'status'}
    >
      <div className={moduleStyles.alertContentContainer}>
        {showIcon && iconToRender && <FontAwesomeV6Icon {...iconToRender} />}
        <span className={moduleStyles.alertText}>{text}</span>
        {link && <Link {...link} size={size} />}
      </div>
      {onClose && <CloseButton onClick={onClose} size={'m'} />}
    </div>
  );
};

export default Alert;
