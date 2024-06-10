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

  /** Alert left icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Alert right icon */
  iconRight?: FontAwesomeV6IconProps;
  /** Alert direction/position relative to connected element */
  direction?: 'onTop' | 'onRight' | 'onBottom' | 'onLeft';
  /** Alert custom className */
  className?: string;
  /** Alert size */
  size?: ComponentSizeXSToL;
}

export interface AlertOverlayProps {
  /** AlertOverlay children (Element that needs a Alert + Alert itself) */
  children: React.ReactNode;
  /** AlertOverlay custom className */
  className?: string;
}

/** AlertOverlay component
 * Used to wrap the element that needs a Alert + Alert itself to make sure the Alert is displayed correctly
 * */
export const AlertOverlay: React.FunctionComponent<AlertOverlayProps> = ({
  children,
  className,
}) => (
  <div className={classnames(moduleStyles.alertOverlay, className)}>
    {children}
  </div>
);

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
 * Renders Alert for a given html element (Needs to be wrapped in AlertOverlay, see stories or README.md).
 */
const Alert: React.FunctionComponent<AlertProps> = ({
  text,
  alertId,
  iconLeft,
  iconRight,
  direction = 'onTop',
  className,
  size = 'm',
}) => {
  return (
    <div
      id={alertId}
      className={classnames(
        moduleStyles.alert,
        moduleStyles[`alert-${direction}`],
        moduleStyles[`alert-${size}`],
        className
      )}
      role="alert"
    >
      {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
      <span className={moduleStyles.alertText}>{text}</span>
      {iconRight && <FontAwesomeV6Icon {...iconRight} />}
    </div>
  );
};

export default Alert;
