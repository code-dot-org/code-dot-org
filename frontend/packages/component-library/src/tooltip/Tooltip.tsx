import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';
import {forwardRef} from 'react';

import {Theme} from '@/common/contexts';
import {ComponentSizeXSToL} from '@/common/types';

/** `TooltipProps` is taken by the legacy tooltip. */
export interface CdoTooltipProps extends MuiTooltipProps {
  /** Defaults to 'm'. */
  size?: ComponentSizeXSToL;
  /** Show only on keyboard focus. Hover and touch do nothing. */
  keyboardOnly?: boolean;
  /** Theme for the tooltip, which portals out of any `data-theme` subtree. */
  'data-theme'?: Theme;
}

/**
 * ## Production-ready Checklist:
 *  * (?) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Tooltip.test.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Tooltip, built on MUI's.
 *
 * `keyboardOnly` is MUI's hover and touch listeners switched off; MUI already
 * gates focus-opening on `:focus-visible`. `arrow` and `describeChild` default
 * on via the theme, unlike MUI.
 */
// forwardRef, or React drops the ref before it reaches the trigger.
const Tooltip = forwardRef<unknown, CdoTooltipProps>(function Tooltip(
  {
    size = 'm',
    keyboardOnly = false,
    slotProps,
    'data-theme': dataTheme,
    children,
    ...muiTooltipProps
  },
  ref,
) {
  // Attributes, not props: MUI forwards props it doesn't know to the child.
  const ours = {'data-size': size, ...(dataTheme && {'data-theme': dataTheme})};
  const theirs = slotProps?.tooltip;

  return (
    <MuiTooltip
      ref={ref}
      slotProps={{
        ...slotProps,
        // Always a function, so the caller's own form needs no branch here.
        tooltip: ownerState => ({
          ...(typeof theirs === 'function' ? theirs(ownerState) : theirs),
          ...ours,
        }),
      }}
      {...muiTooltipProps}
      // After the spread, so keyboardOnly beats an explicit disable*Listener.
      {...(keyboardOnly && {
        disableHoverListener: true,
        disableTouchListener: true,
      })}
    >
      {children}
    </MuiTooltip>
  );
});

export default Tooltip;
