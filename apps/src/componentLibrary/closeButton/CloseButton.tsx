import classNames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './closeButton.module.scss';

export interface CloseButtonProps {
  /** Close Button onClick */
  onClick: () => void;
  /** Close Button size */
  size?: Exclude<ComponentSizeXSToL, 's' | 'xs'>;
  /** Close Button Color*/
  color?: 'light' | 'dark';
  /** Close Button Custom class name */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/CloseButtonTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Close Button Component.
 * Used to render a close button. Mostly needed for internal Design System use in Alert, Popover,
 * Modal, Dialog, etc. Can be used in other anywhere else outside Design System as well.
 */
const CloseButton: React.FunctionComponent<CloseButtonProps> = ({
  onClick,
  size = 'm',
  color = 'dark',
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        moduleStyles.closeButton,
        moduleStyles[`closeButton-${color}`],
        moduleStyles[`closeButton-${size}`],
        className
      )}
      onClick={onClick}
    >
      <FontAwesomeV6Icon iconName={'close'} />
    </button>
  );
};

export default CloseButton;
