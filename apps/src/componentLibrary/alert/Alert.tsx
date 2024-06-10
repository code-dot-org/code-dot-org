import classnames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './alert.module.scss';

export interface AlertProps {
  /** Alert text */
  text: string;
  /** Alert icon */
  icon?: FontAwesomeV6IconProps;
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
  className,
  size = 'm',
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.alert,
        moduleStyles[`alert-${size}`],
        className
      )}
      // role="alert"
    >
      {icon && <FontAwesomeV6Icon {...icon} />}
      <span className={moduleStyles.alertText}>{text}</span>
    </div>
  );
};

export default Alert;
