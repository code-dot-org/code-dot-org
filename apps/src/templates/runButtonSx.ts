import {SxProps} from '@mui/material';

import {RunButtonColorOverride} from '@cdo/apps/blockly/utils/setupBlockColor';

/**
 * Styles shared by every MUI-based lab Run button. Defaults to the Primary
 * Orange run tokens (component-library-styles/labRunButton.css); pass an
 * override to mirror the active Blockly theme's setup-block color instead.
 */
export function getRunButtonSx(
  override?: RunButtonColorOverride | null
): SxProps {
  return {
    backgroundColor: override?.background ?? 'var(--background-run-primary)',
    color: 'var(--text-neutral-white-fixed)',
    '&:hover, &.force-hover, &[data-force-hover="true"]': {
      backgroundColor: override?.hover ?? 'var(--background-run-hover)',
      color: 'var(--text-neutral-white-fixed)',
    },
    '&:focus, a&:focus': {
      color: 'var(--text-neutral-white-fixed)',
    },
    '&:active, a&:active': {
      color: 'var(--text-neutral-white-fixed)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--background-neutral-octonary)',
      color: 'var(--text-neutral-white-fixed)',
    },
    '&.MuiButton-loading': {
      backgroundColor: 'var(--background-neutral-white-fixed)',
      color: 'var(--text-neutral-white-fixed)',
    },
    '&.MuiButton-loading:not(:has(.MuiButton-icon))': {
      color: 'transparent',
    },
    '&.MuiButton-loading i': {
      color: 'var(--text-neutral-primary)',
    },
  };
}
