import {darken, SxProps} from '@mui/material/styles';

export const RUN_BUTTON_BACKGROUND = 'var(--background-accent-orange-primary)';
export const RUN_BUTTON_BACKGROUND_HOVER =
  'var(--background-accent-orange-strong)';
export const RUN_BUTTON_FOREGROUND = 'var(--text-neutral-white-fixed)';

/**
 * Styles shared by the MUI-based lab Run buttons. Pass the current Blockly
 * setup block color (state.blockly.setupBlockColor) to keep the button
 * matched with the "when run" block under accessibility themes; null falls
 * back to the design-system orange.
 */
export function getRunButtonSx(setupBlockColor?: string | null): SxProps {
  const backgroundColor = setupBlockColor ?? RUN_BUTTON_BACKGROUND;
  const hoverColor = setupBlockColor
    ? darken(setupBlockColor, 0.12)
    : RUN_BUTTON_BACKGROUND_HOVER;

  return {
    backgroundColor,
    color: RUN_BUTTON_FOREGROUND,
    '&:hover, &.force-hover, &[data-force-hover="true"]': {
      backgroundColor: hoverColor,
      color: RUN_BUTTON_FOREGROUND,
    },
    '&:focus, a&:focus': {
      color: RUN_BUTTON_FOREGROUND,
    },
    '&:active, a&:active': {
      color: RUN_BUTTON_FOREGROUND,
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--background-neutral-octonary)',
      color: 'var(--text-neutral-white-fixed)',
    },
    // MUI marks a pending button disabled too, so these must follow the
    // disabled rules to win the specificity tie.
    '&.MuiButton-loading': {
      backgroundColor,
      color: RUN_BUTTON_FOREGROUND,
    },
    '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
      color: 'transparent',
    },
    '&.MuiButton-loading i': {
      color: RUN_BUTTON_FOREGROUND,
    },
  };
}
