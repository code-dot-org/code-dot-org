import classnames from 'classnames';
import React from 'react';

import {
  ComponentPlacementDirection,
  ComponentSizeXSToL,
} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './tooltip.module.scss';

export interface TooltipProps {
  /** Tooltip text */
  text: string;
  /**
   * Tooltip id. Required to connect the element using the tooltip.
   * Also, you need to pass this id to that element as aria-describedBy html attribute
   * */
  tooltipId: string;
  /** Tooltip left icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Tooltip right icon */
  iconRight?: FontAwesomeV6IconProps;
  /** Tooltip direction/position relative to connected element */
  direction?: ComponentPlacementDirection;
  /** Tooltip custom className */
  className?: string;
  /** Tooltip size */
  size?: ComponentSizeXSToL;
  /** Tooltip custom styles (used for positioning the tooltip on the go) */
  style?: React.CSSProperties;
}

export interface TooltipOverlayProps {
  /** TooltipOverlay children (Element that needs a Tooltip + Tooltip itself) */
  children: React.ReactNode;
  /** TooltipOverlay custom className */
  className?: string;
}

/** TooltipOverlay component
 * Used to wrap the element that needs a Tooltip + Tooltip itself to make sure the Tooltip is displayed correctly
 * */
export const TooltipOverlay: React.FunctionComponent<TooltipOverlayProps> = ({
  children,
  className,
}) => (
  <div className={classnames(moduleStyles.tooltipOverlay, className)}>
    {children}
  </div>
);

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
 * Renders Tooltip for a given html element (Needs to be wrapped in TooltipOverlay, see stories or README.md).
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      text,
      tooltipId,
      iconLeft,
      iconRight,
      direction = 'onTop',
      className,
      size = 'm',
      style = {},
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        id={tooltipId}
        className={classnames(
          moduleStyles.tooltip,
          moduleStyles[`tooltip-${direction}`],
          moduleStyles[`tooltip-${size}`],
          className
        )}
        style={style}
        role="tooltip"
      >
        {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
        <span className={moduleStyles.tooltipText}>{text}</span>
        {iconRight && <FontAwesomeV6Icon {...iconRight} />}
      </div>
    );
  }
);

export default Tooltip;
