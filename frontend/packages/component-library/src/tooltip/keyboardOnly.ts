import type {TooltipProps} from '@mui/material';

/**
 * Spread onto an MUI `<Tooltip>` to make it keyboard-only: it opens when the
 * trigger is tabbed to, never on hover or touch.
 *
 * ```tsx
 * import {Tooltip} from '@mui/material';
 * import {keyboardOnlyTooltipProps} from '@code-dot-org/component-library/tooltip';
 *
 * <Tooltip title="Runs your program" {...keyboardOnlyTooltipProps}>
 *   <IconButton aria-label="Run" />
 * </Tooltip>
 * ```
 *
 * MUI already gates focus-opening on `:focus-visible`, so switching off the
 * hover and touch listeners is the whole behavior. Use it for a hint a mouse
 * user doesn't need but a keyboard user has no other way to get.
 */
export const keyboardOnlyTooltipProps = {
  disableHoverListener: true,
  disableTouchListener: true,
} satisfies Partial<TooltipProps>;
