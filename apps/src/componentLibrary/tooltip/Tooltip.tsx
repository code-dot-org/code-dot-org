import classnames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './tooltip.module.scss';

export interface TooltipProps {
  /** Tooltip text */
  text: string;
  /** Tooltip left icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Tooltip right icon */
  iconRight?: FontAwesomeV6IconProps;
  /** Tooltip direction/position relative to connected element */
  direction?: 'onTop' | 'onRight' | 'onBottom' | 'onLeft';
  /** Tooltip custom className */
  className?: string;
  /** Tooltip size */
  size?: ComponentSizeXSToL;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see apps/test/unit/componentLibrary/TooltipTest.jsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Tooltip Component.
 * Renders Tooltip for a given html element.
 */
const Tooltip: React.FunctionComponent<TooltipProps> = ({
  text,
  iconLeft,
  iconRight,
  direction = 'onTop',
  className,
  size = 'm',
}) => {
  return (
    <>
      <button aria-describedby={text} type="button">
        hover me
      </button>
      <div
        id={text}
        className={classnames(
          moduleStyles.tooltip,
          moduleStyles[`tooltip-${direction}`],
          moduleStyles[`tooltip-${size}`],
          className
        )}
        role="tooltip"
      >
        {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
        <span className={moduleStyles.tooltipText}>{text}</span>
        {iconRight && <FontAwesomeV6Icon {...iconRight} />}
      </div>
    </>
  );
};

export default Tooltip;
