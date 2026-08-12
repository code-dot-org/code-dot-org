import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';
import {forwardRef} from 'react';

import {Theme} from '@/common/contexts';
import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

/** MUI's tooltip props plus ours; the legacy tooltip still owns `TooltipProps`. */
export interface CdoTooltipProps extends MuiTooltipProps {
  /** Defaults to 'm'. */
  size?: ComponentSizeXSToL;
  /** Show only on keyboard focus. Hover and touch do nothing. */
  keyboardOnly?: boolean;
  /** Our name for MUI's `arrow`; defaults to `true` via the theme. */
  hasCaret?: boolean;
  /** Leading Font Awesome icon shown before the text. */
  iconName?: string;
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
 * `arrow` and `describeChild` default on via the theme, unlike MUI. `hasCaret`
 * is our name for `arrow`; `iconName` adds a leading icon; `keyboardOnly` shows
 * the tooltip on keyboard focus only.
 */

// Hover and touch off; MUI already gates focus on `:focus-visible`. Focus is
// forced back on so `keyboardOnly` plus `disableFocusListener` can't yield a
// tooltip that never opens.
const KEYBOARD_ONLY_PROPS = {
  disableFocusListener: false,
  disableHoverListener: true,
  disableTouchListener: true,
};

// forwardRef, or React drops the ref before it reaches the trigger.
const Tooltip = forwardRef<unknown, CdoTooltipProps>(function Tooltip(
  {
    size = 'm',
    keyboardOnly = false,
    hasCaret,
    iconName,
    arrow,
    title,
    slotProps,
    'data-theme': dataTheme,
    children,
    ...muiTooltipProps
  },
  ref,
) {
  const callerTooltipProps = slotProps?.tooltip;

  // Leading icon, then text; the theme lays them out per `data-size`. Only wrap
  // when both exist, so an empty title still renders nothing.
  const content =
    iconName && title ? (
      <>
        <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
        {title}
      </>
    ) : (
      title
    );

  return (
    <MuiTooltip
      ref={ref}
      title={content}
      // Our `hasCaret`, else a caller's `arrow`, else the theme default.
      arrow={hasCaret ?? arrow}
      slotProps={{
        ...slotProps,
        // data-size and data-theme ride as attributes, since MUI forwards
        // unknown props to the child. A function merges the caller's tooltip
        // slotProps whether they passed an object or a function.
        tooltip: ownerState => ({
          ...(typeof callerTooltipProps === 'function'
            ? callerTooltipProps(ownerState)
            : callerTooltipProps),
          'data-size': size,
          ...(dataTheme && {'data-theme': dataTheme}),
        }),
      }}
      {...muiTooltipProps}
      // After the spread, so keyboardOnly beats an explicit disable*Listener.
      {...(keyboardOnly && KEYBOARD_ONLY_PROPS)}
    >
      {children}
    </MuiTooltip>
  );
});

export default Tooltip;
