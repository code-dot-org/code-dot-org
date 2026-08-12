import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
  useTheme,
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

// Plain left and right are left alone, as MUI leaves them: physical sides stay
// physical. Only the ones that mean "start" or "end" mirror.
const MIRRORED_PLACEMENTS = {
  'bottom-start': 'bottom-end',
  'bottom-end': 'bottom-start',
  'top-start': 'top-end',
  'top-end': 'top-start',
} as const;

const isRtlDocument = () =>
  typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

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
    placement,
    slotProps,
    'data-theme': dataTheme,
    children,
    ...muiTooltipProps
  },
  ref,
) {
  // Same order MUI uses. We always set slotProps.tooltip, so MUI would never
  // reach a caller's deprecated componentsProps.tooltip on its own.
  const callerTooltipProps =
    slotProps?.tooltip ?? muiTooltipProps.componentsProps?.tooltip;

  // MUI mirrors placements for right-to-left, but only once the theme's
  // `direction` says so, and ours takes no direction. Read the document
  // instead. Drops out on its own if the theme ever learns its direction.
  const themeIsRtl = useTheme().direction === 'rtl';
  const rtlPlacement =
    !themeIsRtl && isRtlDocument()
      ? MIRRORED_PLACEMENTS[placement as keyof typeof MIRRORED_PLACEMENTS]
      : undefined;

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
      placement={rtlPlacement ?? placement}
      describeChild={describeChild}
      // hasCaret first, then arrow, then on: our tooltips have tails.
      arrow={hasCaret ?? arrow ?? true}
      slotProps={{
        ...slotProps,
        // These ride as attributes because MUI copies any prop it doesn't know
        // onto the trigger, and a `size` prop there fights the trigger's own.
        // Drop data-cdo-tooltip and the tooltip loses its styling.
        tooltip: ownerState => ({
          ...(typeof callerTooltipProps === 'function'
            ? callerTooltipProps(ownerState)
            : callerTooltipProps),
          'data-cdo-tooltip': '',
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
