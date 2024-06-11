import classnames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Link, {LinkProps} from '@cdo/apps/componentLibrary/link';

import moduleStyles from './alert.module.scss';

export interface AlertProps {
  /** Alert text */
  text: string;
  /** Alert link */
  link?: LinkProps;
  /** Alert icon */
  icon?: FontAwesomeV6IconProps;
  /** Alert custom className */
  type?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
  /** Alert custom className */
  className?: string;
  /** Alert size */
  size?: ComponentSizeXSToL;
}

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (?) has storybook, covered with stories and documentation;
 *  * (?) has tests: test every prop, every state and every interaction that's js related;
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
  icon,
  link,
  className,
  type = 'primary',
  size = 'm',
}) => {
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
      {icon && <FontAwesomeV6Icon {...icon} />}
      <span className={moduleStyles.alertText}>{text}</span>
      {link && <Link {...link} size={size} />}
    </div>
  );
};

export default Alert;
