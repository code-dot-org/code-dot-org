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
  /** Defaults to 'm'. Also augmented onto MUI's own `TooltipProps`. */
  size?: ComponentSizeXSToL;
  /** Show only on keyboard focus. Hover and touch do nothing. */
  keyboardOnly?: boolean;
  /** Our name for MUI's `arrow`; defaults to `true`, unlike MUI. */
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
 * Unlike MUI, `arrow` and `describeChild` are on by default. `hasCaret` is our
 * name for `arrow`, `iconName` adds a leading icon, and `keyboardOnly` shows
 * the tooltip on keyboard focus only.
 *
 * Styles come from the theme, and only reach tooltips we render. Plain MUI
 * tooltips elsewhere in the app are left alone.
 */

// MUI only opens on focus when the browser says it's a keyboard focus, so
// turning off hover and touch is enough. Focus stays on, or nothing opens it.
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
    // Describe the trigger instead of renaming it. MUI defaults this off.
    describeChild = true,
    title,
    slotProps,
    'data-theme': dataTheme,
    children,
    ...muiTooltipProps
  },
  ref,
) {
  const callerTooltipProps = slotProps?.tooltip;

  // Only wrap when there's an icon and text both, so an empty title stays empty.
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
      size={size}
      describeChild={describeChild}
      // hasCaret first, then arrow, then on: our tooltips have tails.
      arrow={hasCaret ?? arrow ?? true}
      slotProps={{
        ...slotProps,
        // Drop data-cdo-tooltip and the tooltip loses its styling. data-theme
        // has to sit on the bubble, which portals out of any theme above it.
        tooltip: ownerState => ({
          ...(typeof callerTooltipProps === 'function'
            ? callerTooltipProps(ownerState)
            : callerTooltipProps),
          'data-cdo-tooltip': '',
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
