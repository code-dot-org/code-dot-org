import type {SxProps} from '@mui/material/styles';

import {MENU_SURFACE} from '../../shared/headerMenu';

/** Trigger: always visible (the hamburger shows at every width). */
export const hamburgerTriggerSx: SxProps = {
  color: 'var(--text-neutral-white-fixed)',
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-white-fixed)',
    outlineOffset: '2px',
  },
  minWidth: 0,
  minHeight: 0,
  // Symmetric horizontal padding centers the bars so the focus ring frames them evenly.
  padding: '18px 6px 20px 6px',
  '&:hover, &:active': {
    backgroundColor: 'transparent',
  },
};

/**
 * Popover surface (legacy #hamburger-contents). The compound `.MuiPaper-root`
 * selector beats MUI's Paper defaults on specificity, not stylesheet order.
 */
export const popoverSx = {
  '& .MuiPaper-root': MENU_SURFACE,
};
