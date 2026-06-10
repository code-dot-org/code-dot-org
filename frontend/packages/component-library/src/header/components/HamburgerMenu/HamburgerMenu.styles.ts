import type {SxProps} from '@mui/material/styles';

import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';
import {MENU_SURFACE} from '../../shared/headerMenu';

/**
 * 3-bar hamburger icon: 25×3px bars with 1px border-radius, 8px gaps. Carries a
 * literal `barsIcon` class as a stable hook for layout tests/stories that query
 * the glyph (the emotion class is hashed).
 */
export const barsIconSx: SxProps = {
  position: 'relative',
  display: 'block',
  width: '25px',
  height: '3px',
  borderRadius: '1px',
  backgroundColor: 'currentColor',
  '&::before, &::after': {
    content: '""',
    display: 'block',
    position: 'absolute',
    width: '25px',
    height: '3px',
    borderRadius: '1px',
    backgroundColor: 'currentColor',
  },
  '&::before': {
    top: '-8px',
  },
  '&::after': {
    top: '8px',
  },
};

/** Trigger: always visible (the hamburger shows at every width). */
export const hamburgerTriggerSx: SxProps = {
  color: 'var(--neutral-base-white)',
  '&:focus-visible': {
    outline: '2px solid var(--text-neutral-inverse)',
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

/** 6px inset + 228px content + 1px border = 242px, matching #hamburger-contents. */
export const hamburgerListSx: SxProps = {
  minWidth: '240px',
  margin: 0,
  padding: '6px',
  listStyle: 'none',
};

/**
 * App-nav, support links, and their dividers: shown only below the top-nav
 * breakpoint (1061px), where the top bar's nav collapses (prod's .show-mobile).
 * Authored default-visible so jsdom (which ignores @media) keeps them testable.
 * Carries a literal `mobileOnly` class as a stable hook for tests asserting the
 * width gate (the emotion class is hashed).
 */
export const mobileOnlyItemSx: SxProps = {
  [`@media (min-width: ${HEADER_BREAKPOINTS.desktopNav}px)`]: {
    display: 'none',
  },
};

/** Signed-out auth rows: shown only below mobileAuth, where the bar hides them. */
export const mobileAuthOnlyItemSx: SxProps = {
  [`@media (min-width: ${HEADER_BREAKPOINTS.mobileAuth}px)`]: {
    display: 'none',
  },
};

/** Hamburger signed-out auth (mobile). Sign in = DSCO secondary (neutral text). */
export const hamburgerSignInSx = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: '8px',
  textAlign: 'center',
  color: 'var(--text-neutral-primary)',
  fontSize: '16px',
  fontWeight: 400,
  textDecoration: 'none',
  borderRadius: '4px',
  '&:visited, &:active': {color: 'var(--text-neutral-primary)'},
  '&:hover': {backgroundColor: '#e7e8ea'},
};

/** Create account = DSCO primary (brand-purple fill, white text). */
export const hamburgerCreateAccountSx = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  marginTop: '4px',
  padding: '8px',
  textAlign: 'center',
  color: 'var(--neutral-base-white)',
  backgroundColor: 'var(--background-brand-purple-primary)',
  fontSize: '16px',
  fontWeight: 400,
  textDecoration: 'none',
  borderRadius: '4px',
  '&:visited, &:active, &:hover': {color: 'var(--neutral-base-white)'},
};

/** Separator after the signed-out auth block; mobile-only like the auth itself. */
export const authDividerSx = {
  height: '1px',
  margin: '0.5rem 0',
  padding: 0,
  background: '#d1d4d8',
  [`@media (min-width: ${HEADER_BREAKPOINTS.mobileAuth}px)`]: {display: 'none'},
};

export const dividerSx: SxProps = {
  height: '1px',
  margin: '0.5rem 0',
  padding: 0,
  // Legacy header divider gray (rgb(209,212,216)); no design token matches.
  background: '#d1d4d8',
  [`@media (min-width: ${HEADER_BREAKPOINTS.desktopNav}px)`]: {
    display: 'none',
  },
};

export const linkSx = {
  display: 'block',
  boxSizing: 'border-box',
  width: '100%',
  padding: '8px',
  color: 'var(--text-neutral-primary)',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  textDecoration: 'none',
  '&:visited, &:active': {
    color: 'var(--text-neutral-primary)',
  },
  // Legacy header hover gray (rgb(231,232,234)); prod rounds the hamburger
  // highlight, unlike the square help/account hovers.
  '&:hover': {
    backgroundColor: '#e7e8ea',
    borderRadius: '4px',
    color: 'var(--text-neutral-primary)',
  },
};

/**
 * Native `<details>` section. The summary hides its UA marker; the chevron is
 * the only open/closed cue, rotated via `[open]`. Toggling is instant (no JS, no
 * animation — reduced-motion safe).
 */
export const hamburgerSectionSx: SxProps = {
  '& summary': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    width: '100%',
    padding: '8px',
    listStyle: 'none',
    cursor: 'pointer',
    // Match the link rows' metrics — the UA summary default shifts the baseline.
    fontSize: '14px',
    lineHeight: '21px',
    '&::-webkit-details-marker': {
      display: 'none',
    },
    '&:hover': {
      backgroundColor: '#e7e8ea',
      borderRadius: '4px',
    },
  },
  '& .chevron': {
    color: 'var(--text-neutral-primary)',
    fontSize: '14px',
  },
  '&[open] .chevron': {
    transform: 'rotate(180deg)',
  },
};

export const expandTextSx = {
  maxWidth: '210px',
  overflow: 'hidden',
  color: 'var(--text-neutral-primary)',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '21px',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Sub-list: 20px indent, no fill — indent is the only visual cue. */
export const subListSx = {
  width: 'auto',
  margin: '0 0 0 20px',
  padding: 0,
  listStyle: 'none',
};
