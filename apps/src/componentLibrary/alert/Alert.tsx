import classnames from 'classnames';
import React, {useMemo} from 'react';

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
  type = 'primary',
  size = 'm',
}) => {
  const iconToRender = useMemo(
    () => icon || getDefaultAlertIconFromType(type),
    [icon, type]
  );

  // TODO:
  // 1. Add close button to the alert
  // 2. Add role='alert' to the alert (?)
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
      // role='alert'
    >
      <div className={moduleStyles.alertContentContainer}>
        {showIcon && iconToRender && <FontAwesomeV6Icon {...iconToRender} />}
        <span className={moduleStyles.alertText}>{text}</span>
        {link && <Link {...link} size={size} />}
      </div>
      {onClose && (
        <button type="button" onClick={onClose}>
          x
        </button>
      )}
    </div>
  );
};

export default Alert;
