import {
  Tooltip as MuiTooltip,
  TooltipProps as MuiTooltipProps,
} from '@mui/material';

import {Theme} from '@/common/contexts';
import {ComponentSizeXSToL} from '@/common/types';

/** Named for the legacy tooltip's sake, which still owns `TooltipProps`. */
export interface CdoTooltipProps extends MuiTooltipProps {
  /** Tooltip size. Defaults to 'm'. */
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
 * MUI already gates focus-opening on `:focus-visible`, so `keyboardOnly` is
 * only its hover and touch listeners switched off.
 *
 * Two MUI defaults are flipped to match `WithTooltip`: `arrow`, since our
 * tooltips have tails, and `describeChild`, so the text describes the trigger
 * instead of replacing its accessible name.
 */
const Tooltip: React.FunctionComponent<CdoTooltipProps> = ({
  size = 'm',
  keyboardOnly = false,
  arrow = true,
  describeChild = true,
  slotProps,
  'data-theme': dataTheme,
  children,
  ...muiTooltipProps
}) => {
  // Attributes, not props: MUI forwards props it doesn't know to the child.
  // The MuiTooltip theme override styles them.
  const ours = {'data-size': size, ...(dataTheme && {'data-theme': dataTheme})};
  const theirs = slotProps?.tooltip;

  return (
    <MuiTooltip
      arrow={arrow}
      describeChild={describeChild}
      slotProps={{
        ...slotProps,
        // A slot's props may be an object or a function of ownerState.
        tooltip:
          typeof theirs === 'function'
            ? ownerState => ({...theirs(ownerState), ...ours})
            : {...theirs, ...ours},
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
};

export default Tooltip;
