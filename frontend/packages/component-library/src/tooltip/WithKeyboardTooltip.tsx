import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';
import classnames from 'classnames';
import {ReactElement} from 'react';

import {ComponentPlacementDirection} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {TooltipProps} from './_Tooltip';

import moduleStyles from './keyboardTooltip.module.scss';

const PLACEMENTS: Record<
  ComponentPlacementDirection,
  MuiTooltipProps['placement']
> = {
  onTop: 'top',
  onRight: 'right',
  onBottom: 'bottom',
  onLeft: 'left',
  none: 'top',
};

export type KeyboardTooltipProps = Pick<
  TooltipProps,
  'text' | 'tooltipId' | 'iconLeft' | 'iconRight' | 'direction' | 'size'
> & {
  /** Hides the tooltip's tail (arrow). Defaults to false. */
  hideTail?: boolean;
};

export interface WithKeyboardTooltipProps {
  /** The element that gets the tooltip. Must accept a ref and spread its props. */
  children: ReactElement;
  tooltipProps: KeyboardTooltipProps;
}

/**
 * Like `WithTooltip`, but only shows on keyboard focus — hover and click are
 * ignored. Use for keyboard-navigation hints.
 *
 * MUI's Tooltip already gates its focus handler on `:focus-visible`, so we only
 * turn off the hover and touch listeners. It never listens for clicks. Escape
 * closes the tooltip.
 *
 * Note: `:focus-visible` does not exist in jsdom, so the open-on-focus behavior
 * can only be tested in a real browser. The Storybook stories cover it.
 *
 * Only put content here that a mouse user does not need (e.g. "Press arrows to
 * move"). Anything else belongs in `WithTooltip` — hiding it from pointer users
 * breaks information parity.
 */
const WithKeyboardTooltip: React.FC<WithKeyboardTooltipProps> = ({
  children,
  tooltipProps: {
    text,
    tooltipId,
    iconLeft,
    iconRight,
    direction = 'onTop',
    size = 'm',
    hideTail = false,
  },
}) => (
  <MuiTooltip
    id={tooltipId}
    title={
      <>
        {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
        <span className={moduleStyles.tooltipText}>{text}</span>
        {iconRight && <FontAwesomeV6Icon {...iconRight} />}
      </>
    }
    placement={PLACEMENTS[direction]}
    arrow={!hideTail}
    // Describes the child rather than replacing its accessible name.
    describeChild
    disableHoverListener
    disableTouchListener
    disableInteractive
    slotProps={{
      tooltip: {
        role: 'tooltip',
        className: classnames(
          moduleStyles.tooltip,
          moduleStyles[`tooltip-${size}`],
        ),
      },
      arrow: {className: moduleStyles.arrow},
    }}
  >
    {children}
  </MuiTooltip>
);

export default WithKeyboardTooltip;
